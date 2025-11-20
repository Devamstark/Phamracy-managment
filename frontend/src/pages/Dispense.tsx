import React, { useState } from 'react';
import { FiShoppingCart, FiAlertCircle } from 'react-icons/fi';

/**
 * Dispense Page - Simplified version
 */
const Dispense: React.FC = () => {
    const [customerName, setCustomerName] = useState('');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dispense Medicines</h1>
                <p className="text-slate-600 mt-1">Create new sale and dispense medicines</p>
            </div>

            {/* Compliance Notice */}
            <div className="alert alert-info flex items-start">
                <FiAlertCircle className="mt-0.5 mr-3 flex-shrink-0" size={20} />
                <div>
                    <p className="font-medium">Compliance Reminder</p>
                    <p className="text-sm mt-1">
                        Schedule H, H1, and X medicines require valid prescription. Ensure doctor verification before dispensing.
                    </p>
                </div>
            </div>

            {/* Dispense Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Customer & Prescription */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Customer Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="input-field"
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Prescription (Optional for OTC)
                                </label>
                                <select className="input-field">
                                    <option value="">No prescription (OTC only)</option>
                                    <option value="1">Prescription #1 - Rajesh Kumar</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Add Medicines</h2>
                        <div className="text-center py-12 text-slate-500">
                            <FiShoppingCart className="mx-auto mb-4" size={48} />
                            <p>Search and add medicines to cart</p>
                            <button className="btn-gradient mt-4">Search Medicines</button>
                        </div>
                    </div>
                </div>

                {/* Right: Cart Summary */}
                <div className="glass-card p-6 h-fit">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Cart Summary</h2>
                    <div className="space-y-4">
                        <div className="text-center py-8 text-slate-500">
                            <p>No items in cart</p>
                        </div>
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-medium">₹0.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">GST (12%)</span>
                                <span className="font-medium">₹0.00</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Total</span>
                                <span>₹0.00</span>
                            </div>
                        </div>
                        <button className="w-full btn-gradient" disabled>
                            Complete Sale
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dispense;
