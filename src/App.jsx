import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Loader from './components/Loader'
import { Toaster } from 'react-hot-toast'

// Lazy-loaded pages — each chunk is only fetched when the user navigates to that route
const Home               = lazy(() => import('./pages/Home'))
const WhyFarmilkyPage    = lazy(() => import('./pages/WhyFarmilky'))
const ContactPage        = lazy(() => import('./pages/Contact'))
const OrderNowPage       = lazy(() => import('./pages/Order'))
const AuthPage           = lazy(() => import('./pages/Login'))
const SignupPage         = lazy(() => import('./pages/Signup'))
const Cart               = lazy(() => import('./pages/Cart'))
const Subscription       = lazy(() => import('./pages/Subscription'))
const MySubscriptions    = lazy(() => import('./pages/MySubscription'))
const Checkout           = lazy(() => import('./pages/Checkout'))
const OrderSuccess       = lazy(() => import('./pages/OrderSuccess'))
const MyOrders           = lazy(() => import('./pages/MyOrders'))
const OrderDetail        = lazy(() => import('./pages/OrderDetail'))
const SubscriptionDetail = lazy(() => import('./pages/SubscriptionDetail'))
const Profile            = lazy(() => import('./pages/Profile'))
const MyComplaints       = lazy(() => import('./pages/MyComplaints'))
const RaiseComplaint     = lazy(() => import('./pages/RaiseComplaint'))
const Passbook           = lazy(() => import('./pages/Passbook'))
const MyInvoices         = lazy(() => import('./pages/MyInvoices'))
const NotFound           = lazy(() => import('./pages/NotFound'))
const ProductDetail      = lazy(() => import('./pages/ProductDetail'))

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loader className="min-h-screen" message="Loading..." />}>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="why-farmilky" element={<WhyFarmilkyPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="order" element={<OrderNowPage />} />
            <Route path="product/:id" element={<ProductDetail />} />
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
              path="/passbook"
              element={
                <ProtectedRoute>
                  <Passbook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-invoices"
              element={
                <ProtectedRoute>
                  <MyInvoices />
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
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-complaints"
              element={
                <ProtectedRoute>
                  <MyComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/raise-complaint"
              element={
                <ProtectedRoute>
                  <RaiseComplaint />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </Suspense>
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
