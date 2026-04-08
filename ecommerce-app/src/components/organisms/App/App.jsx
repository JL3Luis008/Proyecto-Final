import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CartProvider } from "../../../context/CartContext";
import { WishlistProvider } from "../../../context/WishlistContext";
import Layout from "../../../layout/Layout";
import Cart from "../../../pages/Cart";
import Home from "../../../pages/Home";
import Login from "../../../pages/Login";
import ProtectedRoute from "../../../pages/ProtectedRoute";
import SearchResults from "../../../pages/SearchResults";
import WishList from "../../../pages/WishList";
import GuestOnly from "../../../pages/GuestOnly";
import Register from "../../../pages/Register";

const CategoryPage = lazy(() => import("../../../pages/CategoryPage"));
const Checkout = lazy(() => import("../../../pages/Checkout"));
const OrderConfirmation = lazy(() => import("../../../pages/OrderConfirmation"));
const Orders = lazy(() => import("../../../pages/Orders"));
const Product = lazy(() => import("../../../pages/Product"));
const Profile = lazy(() => import("../../../pages/Profile"));
const Settings = lazy(() => import("../../../pages/Settings"));
const AdminProducts = lazy(() => import("../../../pages/AdminProducts"));
const AdminOrders = lazy(() => import("../../../pages/AdminOrders"));
const AdminCategories = lazy(() => import("../../../pages/AdminCategories"));
const AdminUsers = lazy(() => import("../../../pages/AdminUsers"));

function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>Cargando componentes...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/login"
                  element={
                    <GuestOnly>
                      <Login />
                    </GuestOnly>
                  }
                />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/product/:productId" element={<Product />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute
                      redirectTo="/login"
                      allowedRoles={["admin", "customer", "guest"]}
                    >
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout></Checkout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishList></WishList>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings></Settings>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminCategories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<div>Ruta no encontrada</div>} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;
