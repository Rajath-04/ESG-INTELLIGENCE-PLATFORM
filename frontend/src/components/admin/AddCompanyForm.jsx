import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle, Building2, TrendingUp, Leaf, Users, Shield, Award } from 'lucide-react';
import api from '../../api';

export default function AddCompanyForm({ onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        company: '',
        sector: '',
        esgScore: '',
        environmentScore: '',
        socialScore: '',
        governanceScore: '',
        category: 'Adequate',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const sectors = [
        'Textiles & Apparels', 'Food products', 'Civil engineering', 'Agricultural Food & other Products',
        'Fertilizers & Agrochemicals', 'Banks', 'Personal Products', 'Oil', 'Power', 'Paper and paper products',
        'Electrical equipment', 'Finance', 'Realty', 'Construction', 'Pharmaceuticals & Biotechnology',
        'Industrial Products', 'Cement & Cement Products', 'Chemicals & Petrochemicals', 'Healthcare Services',
        'Consumer Durables', 'Automobiles', 'IT - Software', 'Telecom - Services', 'Diversified FMCG',
        'Auto Components', 'Petroleum Products', 'Transport Services', 'Leisure Services', 'Insurance',
        'Capital Markets', 'Ferrous Metals', 'Non - Ferrous Metals', 'Consumable Fuels', 'Gas',
        'Entertainment', 'Industrial Manufacturing', 'Wearing apparel', 'Basic metals', 'Other Utilities'
    ];

    const categories = ['Poor', 'Inadequate', 'Adequate', 'Strong', 'Excellent'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const payload = {
                company: formData.company,
                sector: formData.sector,
                esg_score: parseFloat(formData.esgScore),
                environment_score: parseFloat(formData.environmentScore),
                social_score: parseFloat(formData.socialScore),
                governance_score: parseFloat(formData.governanceScore),
                category: formData.category,
            };

            await api.post('/api/admin/add-company', payload);

            onSuccess();

            // Reset form
            setFormData({
                company: '',
                sector: '',
                esgScore: '',
                environmentScore: '',
                socialScore: '',
                governanceScore: '',
                category: 'Adequate',
            });
        } catch (err) {
            let errorMessage = 'Failed to add company. Please try again.';

            if (err.response?.data) {
                const data = err.response.data;
                if (Array.isArray(data.detail)) {
                    errorMessage = data.detail.map(e => e.msg).join(', ');
                } else if (typeof data.detail === 'string') {
                    errorMessage = data.detail;
                }
            }

            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Building2 size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Add New Company</h3>
                        <p className="text-emerald-100 text-sm">Enter ESG data for a new company</p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X size={20} className="text-white" />
                </button>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-6 mt-6"
                    >
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Company Name & Sector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Building2 size={16} className="text-emerald-600" />
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter company name"
                            required
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <TrendingUp size={16} className="text-emerald-600" />
                            Sector
                        </label>
                        <select
                            value={formData.sector}
                            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            required
                        >
                            <option value="">Select sector</option>
                            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* ESG Scores Grid */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Award size={16} className="text-emerald-600" />
                        ESG Scores (0-100)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ESG Score */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                Overall ESG Score
                            </label>
                            <input
                                type="number"
                                value={formData.esgScore}
                                onChange={(e) => setFormData({ ...formData, esgScore: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                placeholder="0-100"
                                min="0"
                                max="100"
                                required
                            />
                        </div>

                        {/* Environment Score */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Leaf size={16} className="text-green-600" />
                                Environment Score
                            </label>
                            <input
                                type="number"
                                value={formData.environmentScore}
                                onChange={(e) => setFormData({ ...formData, environmentScore: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="0-100"
                                min="0"
                                max="100"
                                required
                            />
                        </div>

                        {/* Social Score */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Users size={16} className="text-blue-600" />
                                Social Score
                            </label>
                            <input
                                type="number"
                                value={formData.socialScore}
                                onChange={(e) => setFormData({ ...formData, socialScore: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="0-100"
                                min="0"
                                max="100"
                                required
                            />
                        </div>

                        {/* Governance Score */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Shield size={16} className="text-amber-600" />
                                Governance Score
                            </label>
                            <input
                                type="number"
                                value={formData.governanceScore}
                                onChange={(e) => setFormData({ ...formData, governanceScore: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                placeholder="0-100"
                                min="0"
                                max="100"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Award size={16} className="text-emerald-600" />
                        ESG Category
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-emerald-800 disabled:to-teal-800 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        {submitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus size={20} />
                                Add Company
                            </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
