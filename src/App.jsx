import Home from './pages/Home'
import { Route, Routes } from 'react-router-dom'
import WhyFarmilkyPage from './pages/WhyFarmilky'
import ContactPage from './pages/Contact'
import OrderNowPage from './pages/Order'
import AuthPage from './pages/Login'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import { Toaster } from 'react-hot-toast';
import Cart from './pages/Cart'
import Subscription from './pages/Subscription'
import MySubscriptions from './pages/MySubscription'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import MyOrders from './pages/MyOrders'
import OrderDetail from './pages/OrderDetail'
import SubscriptionDetail from './pages/SubscriptionDetail'


const App = () => {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="why-farmilky" element={<WhyFarmilkyPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="order" element={<OrderNowPage />} />
        <Route path="cart" element={<Cart />} />
        <Route
          path="subscribe"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <MySubscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:id"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions/:id"
          element={
            <ProtectedRoute>
              <SubscriptionDetail />
            </ProtectedRoute>
          }
        />

      </Route>

      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
    </Routes>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "16px",
          padding: "12px 16px",
        },
      }}
    />
    </>
  )
}

export default App
