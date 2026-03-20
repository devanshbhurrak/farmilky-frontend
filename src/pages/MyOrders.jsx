import React from "react";
import { useGetUserOrdersQuery } from "../features/api/orderApi";
import { Link } from "react-router-dom";
import { FaBoxOpen, FaChevronRight } from "react-icons/fa";

const MyOrders = () => {
  const { data: orderData, isLoading, error } = useGetUserOrdersQuery();

  const orders = orderData?.order || []; // The backend returns { order: [...] }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-red-500">
        <p className="text-xl font-semibold mb-2">Failed to load orders</p>
        <p className="text-sm cursor-pointer underline" onClick={() => window.location.reload()}>Try Again</p>
      </div>
    );
  }

  return (
    <section className="bg-[#F9F5F0] min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8 px-2">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <div className="flex justify-center mb-6">
                <FaBoxOpen className="text-gray-300 text-6xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8">It looks like you haven't placed any orders yet.</p>
            <Link
              to="/order"
              className="bg-secondary text-white px-8 py-3 rounded-xl font-semibold hover:bg-secondary/90 transition shadow-lg shadow-secondary/20"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-200 transition">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Order ID: <span className="font-mono text-gray-700">{order._id}</span></p>
                        <p className="text-sm text-gray-500">Placed on: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                        {order.orderStatus === 'delivered' ? (
                            <p className="text-sm text-green-600 font-medium mt-1">Delivered on: {new Date(order.deliveredAt).toLocaleDateString()}</p>
                        ) : order.orderStatus === 'cancelled' ? (
                            <p className="text-sm text-red-500 font-medium mt-1">Cancelled on: {new Date(order.cancelledAt).toLocaleDateString()}</p>
                        ) : (
                            <p className="text-sm text-secondary font-medium mt-1">
                                {(() => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    
                                    const expected = new Date(order.createdAt);
                                    expected.setDate(expected.getDate() + 1);
                                    expected.setHours(0, 0, 0, 0);

                                    return today >= expected 
                                        ? "Arriving Today" 
                                        : `Expected Delivery: ${expected.toLocaleDateString()}`;
                                })()}
                            </p>
                        )}
                    </div>
                    <div>
                        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold capitalize 
                            ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : 
                              order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 
                              'bg-blue-50 text-blue-600'}`}>
                            {order.orderStatus}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {order.items.map((item) => (
                        <div key={item._id} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {/* Placeholder since order items might not popluate images fully or depending on backend */}
                                <img src={item.image || "https://placehold.co/100"} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 line-clamp-1">{item.name}</h4>
                                <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                            <div className="font-semibold text-gray-800">
                                ₹{item.price * item.quantity}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                     <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold text-primary">₹{order.totalAmount}</p>
                     </div>
                     {/* Could add a 'View Details' button here if we had a dedicated detail page */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyOrders;
