import React from "react";
import { Link, useParams } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { useGetOrderByIdQuery } from "../features/api/orderApi";

const OrderSuccess = () => {
    const { id } = useParams();
    const { data } = useGetOrderByIdQuery(id);
    const order = data?.order;

    return (
        <section className="bg-[#F9F5F0] min-h-[80vh] flex items-center justify-center py-16">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg text-center mx-4">
                <div className="flex justify-center mb-6">
                    <FaCheckCircle className="text-green-500 text-6xl" />
                </div>

                <h1 className="text-3xl font-bold text-primary mb-2">
                    Order Placed!
                </h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your order. We'll start processing it right away.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-2">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Order ID</p>
                        <p className="font-mono font-medium text-gray-800 break-all">{id}</p>
                    </div>
                    {order?.createdAt && (
                        <div>
                            {(() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                
                                const expected = new Date(order.createdAt);
                                expected.setDate(expected.getDate() + 1);
                                expected.setHours(0, 0, 0, 0);
                                
                                if (today >= expected) {
                                    return (
                                        <p className="font-semibold text-secondary text-lg">
                                            Arriving Today!
                                        </p>
                                    );
                                }
                                
                                return (
                                    <>
                                        <p className="text-sm text-gray-500 mb-1">Expected Delivery</p>
                                        <p className="font-semibold text-secondary">
                                            {expected.toLocaleDateString(undefined, {
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <Link
                        to="/my-orders"
                        className="block w-full bg-secondary text-white py-3 rounded-xl font-semibold hover:bg-secondary/90 transition"
                    >
                        View My Orders
                    </Link>
                    <Link
                        to="/order"
                        className="block w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default OrderSuccess;
