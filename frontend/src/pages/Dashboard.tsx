import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FiPackage, FiAlertTriangle, FiDollarSign, FiFileText } from 'react-icons/fi';

interface DashboardStats {
    lowStockCount: number;
    expiringCount: number;
    todaySales: number;
    recentPrescriptions: number;
}

/**
 * Dashboard Page
 */
const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        lowStockCount: 0,
        expiringCount: 0,
        todaySales: 0,
        recentPrescriptions: 0,
    });
    const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
    const [expiryAlerts, setExpiryAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [lowStockRes, expiryRes] = await Promise.all([
                api.get('/inventory/alerts/low-stock'),
                api.get('/inventory/alerts/expiry?days=30'),
            ]);

            setLowStockAlerts(lowStockRes.data.data.slice(0, 5));
            setExpiryAlerts(expiryRes.data.data.slice(0, 5));

            setStats({
                lowStockCount: lowStockRes.data.data.length,
                expiringCount: expiryRes.data.data.length,
                todaySales: 0,
                recentPrescriptions: 0,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Low Stock Items',
            value: stats.lowStockCount,
            icon: FiPackage,
            color: 'danger',
            bgColor: 'bg-danger-100',
            textColor: 'text-danger-700',
        },
        {
            title: 'Expiring Soon',
            value: stats.expiringCount,
            icon: FiAlertTriangle,
            color: 'warning',
            bgColor: 'bg-warning-100',
            textColor: 'text-warning-700',
        },
        {
            title: "Today's Sales",
            value: `₹${stats.todaySales.toLocaleString()}`,
            icon: FiDollarSign,
            color: 'success',
            bgColor: 'bg-success-100',
            textColor: 'text-success-700',
        },
        {
            title: 'Recent Prescriptions',
            value: stats.recentPrescriptions,
            icon: FiFileText,
            color: 'primary',
            bgColor: 'bg-primary-100',
            textColor: 'text-primary-700',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600 mt-1">Overview of pharmacy operations</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="glass-card p-6 card-hover">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                                </div>
                                <div className={`${stat.bgColor} ${stat.textColor} p-4 rounded-xl`}>
                                    <Icon size={28} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alerts */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <FiPackage className="mr-2 text-danger-600" />
                        Low Stock Alerts
                    </h2>
                    {lowStockAlerts.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No low stock items</p>
                    ) : (
                        <div className="space-y-3">
                            {lowStockAlerts.map((alert, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-danger-50 rounded-lg border border-danger-200">
                                    <div>
                                        <p className="font-medium text-slate-900">{alert.medicine.name}</p>
                                        <p className="text-sm text-slate-600">
                                            Stock: {alert.currentStock} / Reorder: {alert.reorderLevel}
                                        </p>
                                    </div>
                                    <span className="badge badge-danger">Low</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expiry Alerts */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <FiAlertTriangle className="mr-2 text-warning-600" />
                        Expiry Alerts (30 days)
                    </h2>
                    {expiryAlerts.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No expiring items</p>
                    ) : (
                        <div className="space-y-3">
                            {expiryAlerts.map((alert, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-warning-50 rounded-lg border border-warning-200">
                                    <div>
                                        <p className="font-medium text-slate-900">{alert.medicine.name}</p>
                                        <p className="text-sm text-slate-600">
                                            Batch: {alert.batch.batchNumber} • {alert.daysUntilExpiry} days left
                                        </p>
                                    </div>
                                    <span className="badge badge-warning">{alert.daysUntilExpiry}d</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
