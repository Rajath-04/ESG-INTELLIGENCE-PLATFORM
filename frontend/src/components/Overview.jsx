import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Overview({ company, companies }) {
    if (!company) return null;

    const esgScore = parseFloat(company.ESG_Score) || 0;
    const envScore = parseFloat(company.Environment_Score) || 0;
    const socScore = parseFloat(company.Social_Score) || 0;
    const govScore = parseFloat(company.Governance_Score) || 0;

    // Mock trend data (in production, this would come from API)
    const trendData = [
        { month: 'Jan', score: esgScore - 5 },
        { month: 'Feb', score: esgScore - 3 },
        { month: 'Mar', score: esgScore - 2 },
        { month: 'Apr', score: esgScore - 1 },
        { month: 'May', score: esgScore },
        { month: 'Jun', score: esgScore + 1 },
    ];

    const pillarData = [
        { name: 'Environment', score: envScore, color: '#10b981' },
        { name: 'Social', score: socScore, color: '#3b82f6' },
        { name: 'Governance', score: govScore, color: '#8b5cf6' },
    ];

    const pieData = [
        { name: 'Environment', value: envScore, color: '#10b981' },
        { name: 'Social', value: socScore, color: '#3b82f6' },
        { name: 'Governance', value: govScore, color: '#8b5cf6' },
    ];

    const getRiskColor = (risk) => {
        if (risk === 'Low') return 'text-green-600 bg-green-100';
        if (risk === 'Medium') return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getActionColor = (action) => {
        if (action === 'Buy') return 'text-green-600 bg-green-100';
        if (action === 'Hold') return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard
                    title="ESG Score"
                    value={esgScore.toFixed(1)}
                    max="100"
                    trend={+2.3}
                    color="primary"
                />
                <KPICard
                    title="Environment"
                    value={envScore.toFixed(1)}
                    max="100"
                    trend={+1.5}
                    color="green"
                />
                <KPICard
                    title="Social"
                    value={socScore.toFixed(1)}
                    max="100"
                    trend={-0.8}
                    color="blue"
                />
                <KPICard
                    title="Governance"
                    value={govScore.toFixed(1)}
                    max="100"
                    trend={+3.2}
                    color="purple"
                />
            </div>

            {/* Company Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{company.Company}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoItem label="Sector" value={company.Sector} />
                    <InfoItem label="Category" value={company.ESG_Category || 'N/A'} />
                    <InfoItem
                        label="Risk Level"
                        value={
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(company.Risk_Level)}`}>
                                {company.Risk_Level}
                            </span>
                        }
                    />
                    <InfoItem
                        label="Investor Action"
                        value={
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getActionColor(company.Investor_Action)}`}>
                                {company.Investor_Action}
                            </span>
                        }
                    />
                </div>
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ESG Score Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ESG Score Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Pillar Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ESG Pillar Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={pillarData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                                {pillarData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Pillar Distribution Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Top Companies */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top ESG Performers</h3>
                    <div className="space-y-3">
                        {companies
                            .sort((a, b) => (parseFloat(b.ESG_Score) || 0) - (parseFloat(a.ESG_Score) || 0))
                            .slice(0, 5)
                            .map((comp, idx) => (
                                <div key={comp.Company} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{comp.Company}</p>
                                            <p className="text-xs text-gray-500">{comp.Sector}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-primary-600">{parseFloat(comp.ESG_Score).toFixed(1)}</p>
                                        <p className="text-xs text-gray-500">{comp.Risk_Level} Risk</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function KPICard({ title, value, max, trend, color }) {
    const colorClasses = {
        primary: 'from-primary-500 to-primary-600',
        green: 'from-green-500 to-green-600',
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="card bg-gradient-to-br from-white to-gray-50"
        >
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">/ {max}</p>
            </div>
            <div className="flex items-center gap-1">
                {trend >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                </span>
            </div>
        </motion.div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="font-semibold text-gray-900">{value}</p>
        </div>
    );
}

export default Overview;
