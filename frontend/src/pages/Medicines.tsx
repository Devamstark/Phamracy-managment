import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';

interface Medicine {
    id: string;
    name: string;
    genericName: string;
    manufacturer: string;
    scheduleType: string;
    unitPrice: number;
    reorderLevel: number;
}

/**
 * Medicines Page
 */
const Medicines: React.FC = () => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [scheduleFilter, setScheduleFilter] = useState('');

    useEffect(() => {
        fetchMedicines();
    }, [searchTerm, scheduleFilter]);

    const fetchMedicines = async () => {
        try {
            const params: any = { page: 1, limit: 50 };
            if (searchTerm) params.search = searchTerm;
            if (scheduleFilter) params.scheduleType = scheduleFilter;

            const response = await api.get('/inventory/medicines', { params });
            setMedicines(response.data.data);
        } catch (error) {
            console.error('Error fetching medicines:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScheduleBadgeColor = (schedule: string) => {
        switch (schedule) {
            case 'OTC':
                return 'badge-success';
            case 'H':
                return 'badge-info';
            case 'H1':
                return 'badge-warning';
            case 'X':
                return 'badge-danger';
            default:
                return 'badge-info';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Medicines</h1>
                    <p className="text-slate-600 mt-1">Manage medicine inventory</p>
                </div>
                <button className="btn-gradient flex items-center space-x-2">
                    <FiPlus size={20} />
                    <span>Add Medicine</span>
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search medicines..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <div className="relative">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select
                            value={scheduleFilter}
                            onChange={(e) => setScheduleFilter(e.target.value)}
                            className="input-field pl-10"
                        >
                            <option value="">All Schedules</option>
                            <option value="OTC">OTC</option>
                            <option value="H">Schedule H</option>
                            <option value="H1">Schedule H1</option>
                            <option value="X">Schedule X</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Medicines Table */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Generic Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Manufacturer</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Schedule</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Reorder Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {medicines.map((medicine) => (
                                    <tr key={medicine.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{medicine.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{medicine.genericName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{medicine.manufacturer}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${getScheduleBadgeColor(medicine.scheduleType)}`}>
                                                {medicine.scheduleType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900">₹{medicine.unitPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{medicine.reorderLevel}</td>
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

export default Medicines;
