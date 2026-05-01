import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Leaf } from 'lucide-react';
import { getCompanies } from '../api';
import Overview from '../components/Overview';
import SectorInsights from '../components/SectorInsights';
import InvestorView from '../components/InvestorView';
import NewsTab from '../components/NewsTab';
import ESGChat from '../components/ESGChat';
import CustomLab from '../components/CustomLab';
import ComplianceCheck from '../components/ComplianceCheck';
// import ClimateRisk from '../components/ClimateRisk';

function Dashboard({ username, onLogout }) {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const data = await getCompanies();
            setCompanies(data.companies);
            if (data.companies.length > 0) {
                setSelectedCompany(data.companies[0]);
            }
        } catch (error) {
            console.error('Failed to load companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'sector', label: 'Sector Insights' },
        { id: 'lab', label: 'Custom Lab' },
        { id: 'investor', label: 'Investor View' },
        // { id: 'climate', label: 'Climate Risk' },
        { id: 'compliance', label: 'Compliance Check' },
        { id: 'news', label: 'News & ESG' },
        { id: 'chat', label: 'ESG GPT' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading ESG data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg">
                                <Leaf className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">ESG Intelligence Platform</h1>
                                <p className="text-sm text-gray-600">Sustainable investing insights</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Welcome back,</p>
                                <p className="font-semibold text-gray-900">{username}</p>
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Company selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Company
                    </label>
                    <select
                        value={selectedCompany?.Company || ''}
                        onChange={(e) => {
                            const company = companies.find(c => c.Company === e.target.value);
                            setSelectedCompany(company);
                        }}
                        className="w-full max-w-md px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    >
                        {companies.map((company) => (
                            <option key={company.Company} value={company.Company}>
                                {company.Company} - {company.Sector}
                            </option>
                        ))}
                    </select>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </motion.div>

                {/* Tab content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && <Overview company={selectedCompany} companies={companies} />}
                    {activeTab === 'sector' && <SectorInsights company={selectedCompany} companies={companies} />}
                    {activeTab === 'investor' && <InvestorView company={selectedCompany} />}
                    {/* {activeTab === 'climate' && <ClimateRisk company={selectedCompany} />} */}
                    {activeTab === 'compliance' && <ComplianceCheck company={selectedCompany} companies={companies} />}
                    {activeTab === 'news' && <NewsTab company={selectedCompany} />}
                    {activeTab === 'chat' && <ESGChat companies={companies} />}
                    {activeTab === 'lab' && <CustomLab />}
                </motion.div>
            </div>
        </div>
    );
}

export default Dashboard;
