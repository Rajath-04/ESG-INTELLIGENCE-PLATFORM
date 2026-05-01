import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle } from 'lucide-react';
import api from '../../api';

export default function AddCompanyModal({ isOpen, onClose, onSuccess }) {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.company.trim()) return 'Company name is required';
        if (!formData.sector) return 'Sector is required';
        if (!formData.esgScore || formData.esgScore < 0 || formData.esgScore > 100)
            return 'ESG Score must be between 0-100';
        if (!formData.environmentScore || formData.environmentScore < 0 || formData.environmentScore > 100)
            return 'Environment Score must be between 0-100';
        if (!formData.socialScore || formData.socialScore < 0 || formData.socialScore > 100)
            return 'Social Score must be between 0-100';
        if (!formData.governanceScore || formData.governanceScore < 0 || formData.governanceScore > 100)
            return 'Governance Score must be between 0-100';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Form submitted!');
        console.log('Form data:', formData);

        const validationError = validateForm();
        console.log('Validation error:', validationError);

        if (validationError) {
            setError(validationError);
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            console.log('=== FORM DATA BEFORE PAYLOAD ===');
            console.log('company:', formData.company);
            console.log('sector:', formData.sector);
            console.log('esgScore:', formData.esgScore);
            console.log('environmentScore:', formData.environmentScore);
            console.log('socialScore:', formData.socialScore);
            console.log('governanceScore:', formData.governanceScore);
            console.log('category:', formData.category);
            console.log('================================');

            const payload = {
                company: formData.company,
                sector: formData.sector,
                esg_score: parseFloat(formData.esgScore),
                environment_score: parseFloat(formData.environmentScore),
                social_score: parseFloat(formData.socialScore),
                governance_score: parseFloat(formData.governanceScore),
                category: formData.category,
            };

            console.log('Sending payload:', payload);

            const response = await api.post('/api/admin/add-company', payload);

            console.log('Response:', response.data);

            onSuccess(formData);

            setFormData({
                company: '',
                sector: '',
                esgScore: '',
                environmentScore: '',
                socialScore: '',
                governanceScore: '',
                category: 'Adequate',
            });

            onClose();
        } catch (err) {
            console.error('Add company error:', err);

            // Handle different error response formats
            let errorMessage = 'Failed to add company. Please try again.';

            if (err.response?.data) {
                const data = err.response.data;

                // Check if it's a FastAPI validation error
                if (Array.isArray(data.detail)) {
                    errorMessage = data.detail.map(e => e.msg).join(', ');
                } else if (typeof data.detail === 'string') {
                    errorMessage = data.detail;
                } else if (data.message) {
                    errorMessage = data.message;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                    <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Plus size={24} className="text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Add New Company</h2>
                                <p className="text-slate-400 text-sm">Enter company ESG information</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                                <AlertCircle size={20} />
                                <span>{String(error)}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Company Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter company name"

                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Sector <span className="text-red-400">*</span>
                            </label>
                            <select
                                name="sector"
                                value={formData.sector}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"

                            >
                                <option value="">Select a sector</option>
                                {sectors.map(sector => (
                                    <option key={sector} value={sector}>{sector}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    ESG Score (0-100) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="esgScore"
                                    value={formData.esgScore}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    placeholder="0-100"

                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Environment Score (0-100) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="environmentScore"
                                    value={formData.environmentScore}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    placeholder="0-100"

                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Social Score (0-100) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="socialScore"
                                    value={formData.socialScore}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    placeholder="0-100"

                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Governance Score (0-100) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="governanceScore"
                                    value={formData.governanceScore}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    placeholder="0-100"

                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                ESG Category <span className="text-red-400">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"

                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
            </div>
        </AnimatePresence>
    );
}
