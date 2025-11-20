import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    FiHome,
    FiPackage,
    FiFileText,
    FiShoppingCart,
    FiDollarSign,
    FiLogOut,
    FiMenu,
    FiX,
} from 'react-icons/fi';

/**
 * Main Layout with Sidebar Navigation
 */
const MainLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const navigation = [
        { name: 'Dashboard', path: '/', icon: FiHome },
        { name: 'Medicines', path: '/medicines', icon: FiPackage },
        { name: 'Prescriptions', path: '/prescriptions', icon: FiFileText },
        { name: 'Dispense', path: '/dispense', icon: FiShoppingCart },
        { name: 'Sales', path: '/sales', icon: FiDollarSign },
    ];

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <div>
                            <h1 className="text-2xl font-bold">PharmaCare</h1>
                            <p className="text-xs text-primary-200">Inventory & eRx</p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-white hover:bg-primary-700 p-2 rounded-lg"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="font-medium">{user?.username}</p>
                                <p className="text-xs text-primary-200">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-danger-600 hover:bg-danger-700 rounded-lg transition-colors duration-200"
                        >
                            <FiLogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white shadow-sm sticky top-0 z-40">
                    <div className="flex items-center justify-between p-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <FiMenu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-primary-900">PharmaCare</h1>
                        <div className="w-6"></div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default MainLayout;
