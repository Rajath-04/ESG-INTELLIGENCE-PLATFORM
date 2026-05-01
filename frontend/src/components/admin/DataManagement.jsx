import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Plus, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api';
import AddCompanyForm from './AddCompanyForm';

export default function DataManagement() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [companiesRes, statsRes] = await Promise.all([
                api.get('/api/companies'),
                api.get('/api/stats')
            ]);
            setCompanies(companiesRes.data.companies.slice(0, 10)); // Show first 10
            setStats(statsRes.data);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompanyAdded = (companyData) => {
        setUploadStatus({
            type: 'success',
            message: `Successfully added ${companyData.company} to the dataset`
        });

        // Refresh data
        setTimeout(() => {
            fetchData();
            setUploadStatus(null);
        }, 3000);
    };

    const handleExportData = async () => {
        try {
            const response = await api.get('/api/companies');
            const companies = response.data.companies;

            // Convert to CSV
            const headers = ['Company', 'Sector', 'ESG_Score', 'Environment_Score', 'Social_Score', 'Governance_Score', 'Risk_Level', 'Investor_Action'];
            const csvContent = [
                headers.join(','),
                ...companies.map(c => [
                    `"${c.Company}"`,
                    `"${c.Sector}"`,
                    c.ESG_Score,
                    c.Environment_Score,
                    c.Social_Score,
                    c.Governance_Score,
                    `"${c.Risk_Level}"`,
                    `"${c.Investor_Action}"`
                ].join(','))
            ].join('\n');

            // Download file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `esg_data_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setUploadStatus({ type: 'success', message: 'Data exported successfully' });
            setTimeout(() => setUploadStatus(null), 3000);
        } catch (err) {
            setUploadStatus({ type: 'error', message: 'Failed to export data' });
        }
    };

    if (loading) {
        return <div className="text-gray-900 text-center py-8">Loading data...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">ESG Data Management</h3>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Upload Status */}
            {uploadStatus && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${uploadStatus.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/50 text-green-200'
                        : 'bg-red-500/20 border border-red-500/50 text-red-200'
                        }`}
                >
                    {uploadStatus.type === 'success' ? (
                        <CheckCircle size={20} />
                    ) : (
                        <AlertCircle size={20} />
                    )}
                    <span>{uploadStatus.message}</span>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">Total Companies</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_companies || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">Total Sectors</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_sectors || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">Avg ESG Score</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.avg_esg_score?.toFixed(1) || 'N/A'}</p>
                </div>
            </div>

            {/* Recent Companies */}
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Companies (Sample)</h4>
                <div className="space-y-2">
                    {companies.map((company, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="bg-white rounded-lg p-3 flex justify-between items-center border border-gray-200 hover:shadow-md transition-all"
                        >
                            <div>
                                <p className="text-gray-900 font-medium">{company.Company}</p>
                                <p className="text-gray-600 text-sm">{company.Sector}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-emerald-600 font-semibold">ESG: {company.ESG_Score}</p>
                                <p className="text-gray-600 text-sm">{company.Risk_Level} Risk</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            {!showAddForm && (
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
                    >
                        <Plus size={16} />
                        Add Company
                    </button>
                    <button
                        onClick={handleExportData}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                    >
                        <Download size={16} />
                        Export Data
                    </button>
                </div>
            )}

            {/* Add Company Form */}
            {showAddForm && (
                <AddCompanyForm
                    onSuccess={() => {
                        setShowAddForm(false);
                        fetchData();
                        setUploadStatus({ type: 'success', message: 'Company added successfully!' });
                        setTimeout(() => setUploadStatus(null), 3000);
                    }}
                    onCancel={() => setShowAddForm(false)}
                />
            )}
        </div>
    );
}
