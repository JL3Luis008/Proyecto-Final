import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartView from "../Cart/CartView";
import AddressForm from "./Address/AddressForm";
import AddressList from "./Address/AddressList";
import PaymentForm from "./Payment/PaymentForm";
import PaymentList from "./Payment/PaymentList";
import SummarySection from "./shared/SummarySection";
import { Button, ErrorMessage, Loading } from "../../atoms";

import { useCart } from "../../../context/CartContext";
import {
  getMyPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "../../../services/paymentMethodService.js";
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../../services/shippingAddressService.js";
import { createOrder } from "../../../services/orderService.js";
import {
  normalizeAddress,
  normalizePayment,
} from "../../../utils/storageHelpers.js";

import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, total, clearCart } = useCart();

  // Cálculos financieros simples
  const subtotal = typeof total === "number" ? total : 0;
  const TAX_RATE = 0.16; // IVA 16%
  const SHIPPING_RATE = 350; // nuevo costo de envío si subtotal < threshold
  const FREE_SHIPPING_THRESHOLD = 1000; // envío gratis sobre este subtotal

  const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  const grandTotal = parseFloat(
    (subtotal + taxAmount + shippingCost).toFixed(2)
  );
  const formatMoney = (v) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(v);

  // Efecto para redirigir si no hay productos
  useEffect(() => {
    // Si estamos suprimiendo la redirección (p.ej. porque estamos confirmando)
    // no navegamos al carrito aunque esté vacío.
    if (!cartItems || cartItems.length === 0) {
      if (!suppressRedirect.current) {
        navigate("/cart");
      }
    }
  }, [cartItems, navigate]);

  // Flag para evitar redirecciones automáticas cuando estamos confirmando la compra
  const suppressRedirect = useRef(false);

  // Estados para direcciones y métodos de pago (se cargarán desde servicios)
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [localError, setLocalError] = useState(null);

  // Estado para controlar la visualización de formularios
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [addressSectionOpen, setAddressSectionOpen] = useState(true);
  const [paymentSectionOpen, setPaymentSectionOpen] = useState(true);

  // Estado para la selección actual
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    if (!selectedAddress) {
      setAddressSectionOpen(true);
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (!selectedPayment) {
      setPaymentSectionOpen(true);
    }
  }, [selectedPayment]);

  // Cargar direcciones y métodos desde servicios al montar el componente
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoadingLocal(true);
      setLocalError(null);
      try {
        const addrList = await getMyAddresses();
        const payList = await getMyPaymentMethods();

        let addressesWithIds = (addrList || [])
          .map((addr, idx) => normalizeAddress(addr, idx))
          .filter(Boolean);

        let normalizedPayments = (payList || [])
          .map((pay, idx) => normalizePayment(pay, idx))
          .filter(Boolean);

        if (!isMounted) return;

        setAddresses(addressesWithIds);
        setPayments(normalizedPayments);

        // Seleccionar valores por defecto si existen
        const defaultAddr =
          addressesWithIds.find((a) => a.default || a.isDefault) ||
          addressesWithIds[0] ||
          null;
        const defaultPay =
          normalizedPayments.find((p) => p.isDefault || p.default) ||
          normalizedPayments[0] ||
          null;

        setSelectedAddress(defaultAddr);
        setSelectedPayment(defaultPay);
        setAddressSectionOpen(!defaultAddr);
        setPaymentSectionOpen(!defaultPay);
      } catch (err) {
        if (isMounted) {
          setLocalError("No se pudo cargar direcciones o métodos de pago.");
        }
      } finally {
        if (isMounted) {
          setLoadingLocal(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleAddressToggle = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressSectionOpen((prev) => !prev);
  };

  const handlePaymentToggle = () => {
    setShowPaymentForm(false);
    setEditingPayment(null);
    setPaymentSectionOpen((prev) => !prev);
  };

  // Manejadores para direcciones
  const handleAddressSubmit = async (formData) => {
    try {
      setLoadingLocal(true);

      // Adapt field differences for the backend
      const apiPayload = {
        name: formData.name,
        address: formData.address1,
        city: formData.city,
        state: formData.state || "N/A",
        postalCode: formData.postalCode,
        country: formData.country || "México",
        phone: formData.phone || "5555555555",
        isDefault: !!formData.default,
        addressType: formData.addressType || "home",
      };

      let savedRecord;
      if (editingAddress?.id) {
        savedRecord = await updateAddress(editingAddress.id, apiPayload);
      } else {
        savedRecord = await createAddress(apiPayload);
      }

      // Refresh list to get accurate default states from backend
      const updatedList = await getMyAddresses();
      const normalizedList = updatedList.map((a, i) => normalizeAddress(a, i));

      setAddresses(normalizedList);

      // Select the newly added/edited one or the default
      const newlySavedId = savedRecord._id || savedRecord.id;
      const nextSelection = normalizedList.find(a => a.id === newlySavedId) ||
        normalizedList.find(a => a.default || a.isDefault) ||
        normalizedList[0];

      setSelectedAddress(nextSelection);
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressSectionOpen(false);
    } catch (error) {
      console.error("Error saving address:", error);
      setLocalError("No se pudo guardar la dirección. Revisa los datos.");
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleAddressEdit = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
    setAddressSectionOpen(true);
  };

  // NOTE: El ID devuelto por el backend mapea en el frontend a la prop .id por storageHelpers
  const handleAddressDelete = async (addressId) => {
    try {
      setLoadingLocal(true);
      await deleteAddress(addressId);

      const updatedList = await getMyAddresses();
      const normalizedList = updatedList.map((a, i) => normalizeAddress(a, i));
      setAddresses(normalizedList);

      let nextSelection = selectedAddress;
      if (selectedAddress?.id === addressId) {
        nextSelection = null;
      }
      if (normalizedList.length > 0 && !nextSelection) {
        nextSelection = normalizedList.find(a => a.default || a.isDefault) || normalizedList[0];
      }

      setSelectedAddress(nextSelection);
    } catch (error) {
      console.error("Error deleting address:", error);
      setLocalError("No se pudo eliminar la dirección.");
    } finally {
      setLoadingLocal(false);
    }
  };

  // Manejadores para métodos de pago
  const handlePaymentSubmit = async (formData) => {
    try {
      setLoadingLocal(true);

      const apiPayload = {
        type: formData.type || "credit_card",
        cardNumber: formData.cardNumber || "4111111111111111",
        cardHolderName: formData.cardHolderName || formData.placeHolder || "Placeholder Name",
        expiryDate: formData.expiryDate || formData.expireDate || "12/28",
        paypalEmail: formData.paypalEmail,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        isDefault: !!formData.default,
      };

      let savedRecord;
      if (editingPayment?.id) {
        savedRecord = await updatePaymentMethod(editingPayment.id, apiPayload);
      } else {
        savedRecord = await createPaymentMethod(apiPayload);
      }

      const updatedList = await getMyPaymentMethods();
      const normalizedList = updatedList.map((p, i) => normalizePayment(p, i));

      setPayments(normalizedList);

      const newlySavedId = savedRecord._id || savedRecord.id;
      const nextSelection = normalizedList.find(p => p.id === newlySavedId) ||
        normalizedList.find(p => p.default || p.isDefault) ||
        normalizedList[0];

      setSelectedPayment(nextSelection);
      setShowPaymentForm(false);
      setEditingPayment(null);
      setPaymentSectionOpen(false);
    } catch (error) {
      console.error("Error saving payment method:", error);
      setLocalError("No se pudo guardar el método de pago.");
    } finally {
      setLoadingLocal(false);
    }
  };

  const handlePaymentEdit = (payment) => {
    setEditingPayment(payment);
    setShowPaymentForm(true);
    setPaymentSectionOpen(true);
  };

  const handlePaymentDelete = async (paymentId) => {
    try {
      setLoadingLocal(true);
      await deletePaymentMethod(paymentId);

      const updatedList = await getMyPaymentMethods();
      const normalizedList = updatedList.map((p, i) => normalizePayment(p, i));
      setPayments(normalizedList);

      let nextSelection = selectedPayment;
      if (selectedPayment?.id === paymentId) {
        nextSelection = null;
      }
      if (normalizedList.length > 0 && !nextSelection) {
        nextSelection = normalizedList.find(p => p.default || p.isDefault) || normalizedList[0];
      }

      setSelectedPayment(nextSelection);
    } catch (error) {
      console.error("Error deleting payment method:", error);
      setLocalError("No se pudo eliminar el método de pago.");
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    // Mostrar loading o error antes del contenido principal
    loadingLocal ? (
      <div className="checkout-loading">
        <Loading message="Cargando direcciones y métodos de pago..." />
      </div>
    ) : localError ? (
      <div className="checkout-error">
        <ErrorMessage message={localError}>
          <div className="checkout-error-actions">
            <Button onClick={handleRetry} variant="primary">
              Reintentar
            </Button>
          </div>
        </ErrorMessage>
      </div>
    ) : (
      <div className="checkout-container">
        <div className="checkout-left">
          <SummarySection
            title="1. Dirección de envío"
            selected={selectedAddress}
            summaryContent={
              <div className="selected-address">
                <p>{selectedAddress?.name}</p>
                <p>{selectedAddress?.address1}</p>
                <p>
                  {selectedAddress?.city}, {selectedAddress?.postalCode}
                </p>
              </div>
            }
            isExpanded={
              showAddressForm || addressSectionOpen || !selectedAddress
            }
            onToggle={handleAddressToggle}
          >
            {!showAddressForm && !editingAddress ? (
              <AddressList
                addresses={addresses}
                selectedAddress={selectedAddress}
                onSelect={(address) => {
                  setSelectedAddress(address);
                  setShowAddressForm(false);
                  setEditingAddress(null);
                  setAddressSectionOpen(false);
                }}
                onEdit={handleAddressEdit}
                onDelete={handleAddressDelete}
                onAdd={() => {
                  setEditingAddress(null);
                  setShowAddressForm(true);
                  setAddressSectionOpen(true);
                }}
              />
            ) : (
              <AddressForm
                key={editingAddress?.id || "new"}
                onSubmit={handleAddressSubmit}
                onCancel={() => {
                  setShowAddressForm(false);
                  setEditingAddress(null);
                  setAddressSectionOpen(true);
                }}
                initialValues={editingAddress || {}}
                isEdit={!!editingAddress}
              />
            )}
          </SummarySection>

          <SummarySection
            title="2. Método de pago"
            selected={selectedPayment}
            summaryContent={
              <div className="selected-payment">
                <p>{selectedPayment?.alias}</p>
                <p>**** {selectedPayment?.cardNumber?.slice(-4) || "----"}</p>
              </div>
            }
            isExpanded={
              showPaymentForm || paymentSectionOpen || !selectedPayment
            }
            onToggle={handlePaymentToggle}
          >
            {!showPaymentForm && !editingPayment ? (
              <PaymentList
                payments={payments}
                selectedPayment={selectedPayment}
                onSelect={(payment) => {
                  setSelectedPayment(payment);
                  setShowPaymentForm(false);
                  setEditingPayment(null);
                  setPaymentSectionOpen(false);
                }}
                onEdit={handlePaymentEdit}
                onDelete={handlePaymentDelete}
                onAdd={() => {
                  setEditingPayment(null);
                  setShowPaymentForm(true);
                  setPaymentSectionOpen(true);
                }}
              />
            ) : (
              <PaymentForm
                key={editingPayment?.id || "new"}
                onSubmit={handlePaymentSubmit}
                onCancel={() => {
                  setShowPaymentForm(false);
                  setEditingPayment(null);
                  setPaymentSectionOpen(true);
                }}
                initialValues={editingPayment || {}}
                isEdit={!!editingPayment}
              />
            )}
          </SummarySection>

          <SummarySection
            title="3. Revisa tu pedido"
            selected={true}
            isExpanded={true}
          >
            <CartView />
          </SummarySection>
        </div>

        <div className="checkout-right">
          <div className="checkout-summary">
            <h3>Resumen de la Orden</h3>
            <div className="summary-details">
              <p>
                <strong>Dirección de envío:</strong> {selectedAddress?.name}
              </p>
              <p>
                <strong>Método de pago:</strong> {selectedPayment?.alias}
              </p>
              <div className="order-costs">
                <p>
                  <strong>Subtotal:</strong> {formatMoney(subtotal)}
                </p>
                <p>
                  <strong>IVA (16%):</strong> {formatMoney(taxAmount)}
                </p>
                <p>
                  <strong>Envío:</strong>{" "}
                  {shippingCost === 0 ? "Gratis" : formatMoney(shippingCost)}
                </p>
                <hr />
                <p>
                  <strong>Total:</strong> {formatMoney(grandTotal)}
                </p>
              </div>
              <p>
                <strong>Fecha estimada de entrega:</strong>{" "}
                {new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </p>
            </div>
            <Button
              className="pay-button"
              disabled={
                !selectedAddress ||
                !selectedPayment ||
                !cartItems ||
                cartItems.length === 0
              }
              title={
                !cartItems || cartItems.length === 0
                  ? "No hay productos en el carrito"
                  : !selectedAddress
                    ? "Selecciona una dirección de envío"
                    : !selectedPayment
                      ? "Selecciona un método de pago"
                      : "Confirmar y realizar el pago"
              }
              onClick={async () => {
                setLoadingLocal(true);
                try {
                  // The backend expects products array with required fields and shipping/payment ObjectIds.
                  const payload = {
                    products: cartItems.map((item) => ({
                      productId: item.productId || item._id, // Use productId as expected by backend
                      quantity: item.quantity,
                      price: item.price
                    })),
                    shippingAddress: selectedAddress.id || selectedAddress._id,
                    paymentMethod: selectedPayment.id || selectedPayment._id,
                  };

                  const confirmedOrder = await createOrder(payload);

                  suppressRedirect.current = true;
                  clearCart();

                  navigate(`/order-confirmation/${confirmedOrder._id || confirmedOrder.id}`, {
                    state: { order: confirmedOrder },
                  });
                } catch (error) {
                  console.error("Failed to create order:", error);
                  setLocalError("Error procesando tu orden. Por favor intenta de nuevo.");
                } finally {
                  setLoadingLocal(false);
                }
              }}
            >
              Confirmar y Pagar
            </Button>
          </div>
        </div>
      </div>
    )
  );
}
