import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import * as cartService from "../services/cartService";
import { CART_ACTIONS, cartInitialState, cartReducer } from "./cartReducer";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, cartInitialState);

  const [syncState, setSyncState] = useState({
    syncing: false,
    lastSyncError: null,
  });

  const { isAuth, user } = useAuth();

  // Funciones auxiliares:
  const getTotalItems = () =>
    state.items.reduce((sum, i) => sum + i.quantity, 0);
  const getTotalPrice = () =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Persistir carrito en localStorage como caché secundario
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  useEffect(() => {
    const initializeCart = async () => {
      if (isAuth && user?._id) {
        try {
          // 1. Leer items locales ANTES de sobrescribirlos con el BE
          const localRaw = localStorage.getItem("cart");
          const localItems = localRaw ? JSON.parse(localRaw) : [];

          // 2. Obtener carrito del backend
          const backendCart = await cartService.getCart();
          const backendProducts = backendCart?.cart?.products || [];

          if (backendProducts.length === 0 && localItems.length === 0) {
            // Carrito vacío en ambos lados
            dispatch({ type: CART_ACTIONS.INIT, payload: [] });
            return;
          }

          // 3. Merge: BE es fuente de verdad para existentes; items locales únicos se añaden
          const backendIds = new Set(
            backendProducts.map((p) => {
              const id = p.product?._id || p.product || p._id;
              return id?.toString();
            })
          );

          // Items locales que NO están en el BE (genuinamente nuevos, añadidos sin sesión)
          const uniqueLocalItems = localItems.filter((localItem) => {
            const localId = (localItem._id || localItem.productId || localItem.id)?.toString();
            return localId && !backendIds.has(localId);
          });

          // 4. Inicializar el estado con productos del BE
          dispatch({ type: CART_ACTIONS.INIT, payload: backendProducts });

          // 5. Sincronizar items locales únicos al BE y al estado
          if (uniqueLocalItems.length > 0) {
            for (const item of uniqueLocalItems) {
              const productId = item._id || item.productId || item.id;
              const quantity = item.quantity || 1;
              if (productId) {
                dispatch({
                  type: CART_ACTIONS.ADD,
                  payload: { ...item, quantity },
                });
                // Sincronizar con BE de forma silenciosa (fire and forget)
                cartService
                  .addToCart(user._id, productId, quantity)
                  .catch((err) =>
                    console.warn("No se pudo sincronizar item local al BE:", err)
                  );
              }
            }
          }
        } catch (error) {
          console.error("Error al inicializar carrito:", error);
        }
      } else if (!isAuth) {
        // Usuario desautenticado: cargar desde localStorage si hay algo
        const localRaw = localStorage.getItem("cart");
        if (localRaw) {
          try {
            const localItems = JSON.parse(localRaw);
            if (Array.isArray(localItems) && localItems.length > 0) {
              dispatch({ type: CART_ACTIONS.INIT, payload: localItems });
            }
          } catch {
            // localStorage corrupted, ignorar
          }
        }
      }
    };

    initializeCart();
  }, [isAuth, user?._id]);

  const syncToBackend = async (syncFn) => {
    if (!isAuth) return;

    setSyncState({ syncing: true, lastSyncError: null });
    try {
      await syncFn();
      setSyncState({ syncing: false, lastSyncError: null });
    } catch (error) {
      console.error(error);
      setSyncState({ syncing: false, lastSyncError: error });
    }
  };

  const removeFromCart = (productId) => {
    dispatch({ type: CART_ACTIONS.REMOVE, payload: productId });

    syncToBackend(async () => {
      await cartService.removeToCart(user._id, productId);
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    dispatch({
      type: CART_ACTIONS.SET_QTY,
      payload: { _id: productId, quantity: newQuantity },
    });

    syncToBackend(async () => {
      await cartService.updateCartItem(user._id, productId, newQuantity);
    });
  };

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: CART_ACTIONS.ADD, payload: { ...product, quantity } });

    syncToBackend(async () => {
      await cartService.addToCart(user._id, product._id, quantity);
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR });

    syncToBackend(async () => {
      await cartService.clearCart(user._id);
    });
  };

  const value = useMemo(
    () => ({
      cartItems: state.items,
      total: getTotalPrice(),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
    }),
    [state.items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart debe ser usado dentro de CartProvider");
  return context;
}
