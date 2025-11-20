import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FiDollarSign, FiDownload } from 'react-icons/fi';

interface Sale {
    id: string;
    invoiceNumber: string;
    customerName?: string;
    totalAmount: number;
    gstAmount: number;
    paymentMethod: string;
    createdAt: string;
}

/**
 * Sales Page
 */
const Sales: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const response = await api.get('/sales', {
                params: { page: 1, limit: 20 },
            });
            setSales(response.data.data);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Sales History</h1>
                    <p className="text-slate-600 mt-1">View all sales and invoices</p>
                </div>
                <button className="btn-gradient flex items-center space-x-2">
                    <FiDownload size={20} />
                    <span>Export Report</span>
                </button>
            </div>

            {/* Sales Table */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : sales.length === 0 ? (
                    <div className="text-center py-12">
                        <FiDollarSign className="mx-auto text-slate-300 mb-4" size={64} />
                        <p className="text-slate-500">No sales found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Invoice #</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">GST</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Payment</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-primary-600">
                                            {sale.invoiceNumber}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900">
                                            {sale.customerName || 'Walk-in'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            ₹{sale.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            ₹{sale.gstAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="badge badge-info">{sale.paymentMethod}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {formatDate(sale.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                                View Invoice
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sales;
