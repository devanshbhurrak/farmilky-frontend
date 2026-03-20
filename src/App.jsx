import Home from './pages/Home'
import { Route, Routes } from 'react-router-dom'
import WhyFarmilkyPage from './pages/WhyFarmilky'
import ContactPage from './pages/Contact'
import OrderNowPage from './pages/Order'
import AuthPage from './pages/Login'
import Layout from './components/Layout'
import { Toaster } from 'react-hot-toast';
import Cart from './pages/Cart'
import Subscription from './pages/Subscription'
import MySubscriptions from './pages/MySubscription'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import MyOrders from './pages/MyOrders'


const App = () => {
  return (
    <>
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="why-farmilky" element={<WhyFarmilkyPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="order" element={<OrderNowPage />} />
        <Route path="cart" element={<Cart />} />
        <Route path="subscribe" element={<Subscription />} />
        <Route path="/subscriptions" element={<MySubscriptions />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/my-orders" element={<MyOrders />} />

      </Route>

      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
    </Routes>
    <Toaster />
    </>
  )
}

export default App