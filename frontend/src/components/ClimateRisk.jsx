import { motion } from 'framer-motion';
import { Cloud, Droplets, Thermometer, Wind, AlertTriangle, TrendingUp, Leaf, Factory, CheckCircle } from 'lucide-react';
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

function ClimateRisk({ company }) {
    if (!company) return null;

    // Calculate climate risk score
    const envScore = parseFloat(company.Environment_Score) || 0;

    // Sector risk factors
    const sectorRiskFactors = {
        'Oil': 20,
        'Petroleum Products': 20,
        'Gas': 18,
        'Consumable Fuels': 18,
        'Power': 15,
        'Energy': 15,
        'Transport Services': 12,
        'Automobiles': 12,
        'Auto Components': 10,
        'Cement & Cement Products': 10,
        'Basic metals': 10,
        'Ferrous Metals': 10,
        'Non - Ferrous Metals': 10,
        'Chemicals & Petrochemicals': 8,
        'Industrial Manufacturing': 8,
        'Paper and paper products': 7,
        'Textiles & Apparels': 6,
        'Construction': 6,
        'Civil engineering': 6,
        'Food products': 5,
        'Consumer Durables': 5,
        'Diversified FMCG': 4,
        'IT - Software': 2,
        'Telecom - Services': 2,
        'Finance': 2,
        'Banks': 2,
        'Insurance': 2,
        'Healthcare Services': 3,
        'Pharmaceuticals & Biotechnology': 3,
    };

    const getSectorRisk = (sector) => {
        for (const [key, value] of Object.entries(sectorRiskFactors)) {
            if (sector.includes(key)) return value;
        }
        return 5; // Default moderate risk
    };

    const sectorRisk = getSectorRisk(company.Sector);
    const climateRiskScore = Math.min(100, (100 - envScore) + sectorRisk);

    // Determine risk level
    const getRiskLevel = (score) => {
        if (score < 30) return { level: 'Low', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-500' };
        if (score < 50) return { level: 'Medium', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-500' };
        if (score < 70) return { level: 'High', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-500' };
        return { level: 'Critical', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-500' };
    };

    const riskLevel = getRiskLevel(climateRiskScore);

    // Climate risk breakdown
    const carbonEmissionsRisk = Math.min(100, (100 - envScore) * 1.2);
    const physicalRisk = Math.min(100, sectorRisk * 3);
    const transitionRisk = Math.min(100, (100 - envScore) * 0.8 + sectorRisk);
    const resourceScarcityRisk = Math.min(100, (100 - envScore) * 0.9);

    const riskBreakdown = [
        { name: 'Carbon Emissions', value: carbonEmissionsRisk, color: '#ef4444' },
        { name: 'Physical Climate', value: physicalRisk, color: '#f59e0b' },
        { name: 'Transition Risk', value: transitionRisk, color: '#eab308' },
        { name: 'Resource Scarcity', value: resourceScarcityRisk, color: '#84cc16' },
    ];

    // Radial chart data
    const radialData = [
        {
            name: 'Climate Risk',
            value: climateRiskScore,
            fill: riskLevel.color === 'green' ? '#10b981' :
                riskLevel.color === 'yellow' ? '#eab308' :
                    riskLevel.color === 'orange' ? '#f97316' : '#ef4444'
        }
    ];

    // Trend data (mock)
    const trendData = [
        { month: 'Jan', risk: climateRiskScore - 8 },
        { month: 'Feb', risk: climateRiskScore - 6 },
        { month: 'Mar', risk: climateRiskScore - 4 },
        { month: 'Apr', risk: climateRiskScore - 2 },
        { month: 'May', risk: climateRiskScore - 1 },
        { month: 'Jun', risk: climateRiskScore },
    ];

    // Mitigation recommendations
    const getRecommendations = () => {
        const recommendations = [];

        if (carbonEmissionsRisk > 60) {
            recommendations.push({ icon: Factory, text: 'Implement carbon reduction strategies and set net-zero targets', priority: 'high' });
        }
        if (physicalRisk > 60) {
            recommendations.push({ icon: Cloud, text: 'Assess physical climate risks and develop adaptation plans', priority: 'high' });
        }
        if (transitionRisk > 60) {
            recommendations.push({ icon: TrendingUp, text: 'Prepare for policy changes and market shifts towards low-carbon economy', priority: 'medium' });
        }
        if (resourceScarcityRisk > 60) {
            recommendations.push({ icon: Droplets, text: 'Improve resource efficiency and explore circular economy models', priority: 'medium' });
        }

        if (recommendations.length === 0) {
            recommendations.push({ icon: CheckCircle, text: 'Maintain current environmental practices and monitor emerging risks', priority: 'low' });
        }

        return recommendations;
    };

    const recommendations = getRecommendations();

    return (
        <div className="space-y-6">
            {/* Header Alert */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${riskLevel.bgColor} border ${riskLevel.borderColor} rounded-lg p-4 flex items-center gap-3`}
            >
                <AlertTriangle className={riskLevel.textColor} size={24} />
                <div>
                    <h3 className={`font-semibold ${riskLevel.textColor}`}>
                        Climate Risk Level: {riskLevel.level}
                    </h3>
                    <p className={`text-sm ${riskLevel.textColor}`}>
                        {company.Company} has a {riskLevel.level.toLowerCase()} climate risk profile based on environmental performance and sector exposure.
                    </p>
                </div>
            </motion.div>

            {/* Risk Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <RiskCard
                    title="Overall Climate Risk"
                    value={climateRiskScore.toFixed(1)}
                    icon={Thermometer}
                    color={riskLevel.color}
                />
                <RiskCard
                    title="Carbon Emissions"
                    value={carbonEmissionsRisk.toFixed(1)}
                    icon={Factory}
                    color={carbonEmissionsRisk > 60 ? 'red' : carbonEmissionsRisk > 40 ? 'orange' : 'green'}
                />
                <RiskCard
                    title="Physical Climate"
                    value={physicalRisk.toFixed(1)}
                    icon={Cloud}
                    color={physicalRisk > 60 ? 'red' : physicalRisk > 40 ? 'orange' : 'green'}
                />
                <RiskCard
                    title="Transition Risk"
                    value={transitionRisk.toFixed(1)}
                    icon={Wind}
                    color={transitionRisk > 60 ? 'red' : transitionRisk > 40 ? 'orange' : 'green'}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Gauge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Climate Risk Score</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="90%"
                            data={radialData}
                            startAngle={180}
                            endAngle={0}
                        >
                            <RadialBar
                                minAngle={15}
                                background
                                clockWise
                                dataKey="value"
                                cornerRadius={10}
                            />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-gray-900">
                                {climateRiskScore.toFixed(0)}
                            </text>
                            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-gray-600">
                                Risk Score
                            </text>
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-2">
                        <span className={`inline-block px-4 py-2 rounded-full font-semibold ${riskLevel.bgColor} ${riskLevel.textColor}`}>
                            {riskLevel.level} Risk
                        </span>
                    </div>
                </motion.div>

                {/* Risk Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factor Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={riskBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" angle={-15} textAnchor="end" height={80} />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {riskBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Risk Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Climate Risk Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Climate Conditions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Climate Conditions</h3>
                    <div className="space-y-4">
                        <ConditionItem
                            icon={Factory}
                            label="Carbon Emissions Risk"
                            value={carbonEmissionsRisk}
                            description="Risk from greenhouse gas emissions and carbon intensity"
                        />
                        <ConditionItem
                            icon={Cloud}
                            label="Physical Climate Risk"
                            value={physicalRisk}
                            description="Exposure to extreme weather, floods, and droughts"
                        />
                        <ConditionItem
                            icon={TrendingUp}
                            label="Transition Risk"
                            value={transitionRisk}
                            description="Risk from policy changes and market shifts"
                        />
                        <ConditionItem
                            icon={Droplets}
                            label="Resource Scarcity"
                            value={resourceScarcityRisk}
                            description="Water and resource availability concerns"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Sector-Specific Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector-Specific Climate Insights</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Leaf className="text-blue-600 mt-1" size={20} />
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-2">{company.Sector}</h4>
                            <p className="text-sm text-blue-800">
                                Sector Risk Factor: <span className="font-semibold">{sectorRisk}/20</span>
                            </p>
                            <p className="text-sm text-blue-700 mt-2">
                                {sectorRisk > 15
                                    ? 'This sector has high carbon intensity and significant exposure to climate-related regulations. Companies should prioritize decarbonization strategies.'
                                    : sectorRisk > 10
                                        ? 'This sector faces moderate climate risks. Focus on improving energy efficiency and reducing emissions.'
                                        : sectorRisk > 5
                                            ? 'This sector has relatively lower climate risks but should still monitor environmental performance.'
                                            : 'This sector has low direct climate risk but should consider indirect supply chain impacts.'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Mitigation Recommendations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mitigation Recommendations</h3>
                <div className="space-y-3">
                    {recommendations.map((rec, idx) => {
                        const Icon = rec.icon;
                        const priorityColors = {
                            high: 'bg-red-50 border-red-200 text-red-800',
                            medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                            low: 'bg-green-50 border-green-200 text-green-800'
                        };
                        return (
                            <div key={idx} className={`border rounded-lg p-4 ${priorityColors[rec.priority]}`}>
                                <div className="flex items-start gap-3">
                                    <Icon size={20} className="mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{rec.text}</p>
                                        <span className="text-xs uppercase font-semibold mt-1 inline-block">
                                            {rec.priority} Priority
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}

function RiskCard({ title, value, icon: Icon, color }) {
    const colorClasses = {
        green: { bg: 'from-green-500 to-green-600', text: 'text-green-600' },
        yellow: { bg: 'from-yellow-500 to-yellow-600', text: 'text-yellow-600' },
        orange: { bg: 'from-orange-500 to-orange-600', text: 'text-orange-600' },
        red: { bg: 'from-red-500 to-red-600', text: 'text-red-600' },
    };

    const colors = colorClasses[color] || colorClasses.green;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="card bg-gradient-to-br from-white to-gray-50"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${colors.bg}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </motion.div>
    );
}

function ConditionItem({ icon: Icon, label, value, description }) {
    const getColor = (val) => {
        if (val < 40) return 'text-green-600';
        if (val < 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0">
            <Icon className={`${getColor(value)} mt-1`} size={20} />
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <span className={`font-semibold ${getColor(value)}`}>{value.toFixed(0)}</span>
                </div>
                <p className="text-xs text-gray-600">{description}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${value < 40 ? 'bg-green-500' : value < 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${value}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default ClimateRisk;
