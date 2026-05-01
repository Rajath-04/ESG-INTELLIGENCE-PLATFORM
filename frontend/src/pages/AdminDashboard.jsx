import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Database, Activity, FileText, LogOut, TrendingUp, Shield } from 'lucide-react';
import api from '../api';

// Import admin components (we'll create these next)
import UserManagement from '../components/admin/UserManagement';
import DataManagement from '../components/admin/DataManagement';
import SystemMonitoring from '../components/admin/SystemMonitoring';
import SystemLogs from '../components/admin/SystemLogs';

export default function AdminDashboard({ username, onLogout }) {
    const [activeTab, setActiveTab] = useState('users');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            const response = await api.get('/api/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'data', label: 'Data Management', icon: Database },
        { id: 'monitoring', label: 'System Monitoring', icon: Activity },
        { id: 'logs', label: 'System Logs', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-sm text-gray-600">System management and control</p>
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

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading statistics...</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <StatCard
                            title="Total Users"
                            value={stats?.total_users || 0}
                            subtitle={`${stats?.admin_users || 0} admins, ${stats?.investor_users || 0} investors`}
                            icon={Users}
                            color="blue"
                        />
                        <StatCard
                            title="Companies"
                            value={stats?.total_companies || 0}
                            subtitle={`${stats?.total_sectors || 0} sectors`}
                            icon={Database}
                            color="green"
                        />
                        <StatCard
                            title="Custom Datasets"
                            value={stats?.custom_datasets || 0}
                            subtitle="Uploaded by users"
                            icon={TrendingUp}
                            color="yellow"
                        />
                        <StatCard
                            title="System Status"
                            value="Active"
                            subtitle="All services running"
                            icon={Activity}
                            color="purple"
                        />
                    </motion.div>
                )}

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </motion.div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'data' && <DataManagement />}
                    {activeTab === 'monitoring' && <SystemMonitoring stats={stats} />}
                    {activeTab === 'logs' && <SystemLogs />}
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-emerald-500 to-emerald-600',
        yellow: 'from-yellow-500 to-yellow-600',
        purple: 'from-purple-500 to-purple-600',
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[color]}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-gray-500 text-xs">{subtitle}</p>
        </div>
    );
}
