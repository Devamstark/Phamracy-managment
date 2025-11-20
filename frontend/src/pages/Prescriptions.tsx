import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FiUpload, FiFileText, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface Prescription {
    id: string;
    patientName: string;
    doctorName: string;
    doctorRegistration: string;
    doctorVerified: boolean;
    prescriptionDate: string;
    createdAt: string;
}

/**
 * Prescriptions Page
 */
const Prescriptions: React.FC = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const response = await api.get('/prescriptions', {
                params: { page: 1, limit: 20 },
            });
            setPrescriptions(response.data.data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">E-Prescriptions</h1>
                    <p className="text-slate-600 mt-1">FHIR/ABDM compliant prescriptions</p>
                </div>
                <button className="btn-gradient flex items-center space-x-2">
                    <FiUpload size={20} />
                    <span>Upload FHIR Bundle</span>
                </button>
            </div>

            {/* Prescriptions List */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : prescriptions.length === 0 ? (
                    <div className="text-center py-12">
                        <FiFileText className="mx-auto text-slate-300 mb-4" size={64} />
                        <p className="text-slate-500">No prescriptions found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Patient</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Doctor</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Registration</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Verified</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Uploaded</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {prescriptions.map((prescription) => (
                                    <tr key={prescription.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {prescription.patientName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{prescription.doctorName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {prescription.doctorRegistration}
                                        </td>
                                        <td className="px-6 py-4">
                                            {prescription.doctorVerified ? (
                                                <span className="flex items-center text-success-600">
                                                    <FiCheckCircle className="mr-1" size={16} />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-danger-600">
                                                    <FiXCircle className="mr-1" size={16} />
                                                    Not Verified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {formatDate(prescription.prescriptionDate)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {formatDate(prescription.createdAt)}
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

export default Prescriptions;
