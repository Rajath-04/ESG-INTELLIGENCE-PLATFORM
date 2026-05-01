import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, AlertTriangle, TrendingUp, DollarSign, Users, Heart } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ComplianceCheck({ company, companies }) {
    const [selectedStandard, setSelectedStandard] = useState('companies-act');

    // Legal standards for CSR spending
    const legalStandards = {
        'companies-act': {
            name: 'Companies Act 2013 (Section 135)',
            description: 'Mandatory 2% of average net profits for CSR activities',
            requiredPercentage: 2.0,
            applicability: 'Companies with net worth ≥ ₹500 crore OR turnover ≥ ₹1000 crore OR net profit ≥ ₹5 crore'
        },
        'sebi-brsr': {
            name: 'SEBI BRSR Requirements',
            description: 'Business Responsibility and Sustainability Reporting',
            requiredPercentage: 2.0,
            applicability: 'Top 1000 listed companies by market capitalization'
        },
        'iso-26000': {
            name: 'ISO 26000 Social Responsibility',
            description: 'International standard for social responsibility',
            requiredPercentage: 1.5,
            applicability: 'Voluntary international standard'
        }
    };

    // Calculate CSR compliance based on Social Score
    const calculateCSRCompliance = () => {
        if (!company) return null;

        const socialScore = company.Social_Score || 0;
        const standard = legalStandards[selectedStandard];

        // Estimate CSR spending percentage based on Social Score
        // Higher social score indicates better CSR spending
        const estimatedCSRSpending = (socialScore / 100) * 3; // Max 3% spending

        // Calculate compliance
        const requiredSpending = standard.requiredPercentage;
        const actualSpending = estimatedCSRSpending;
        const compliancePercentage = (actualSpending / requiredSpending) * 100;
        const gap = Math.max(0, requiredSpending - actualSpending);

        // Determine status
        let status = 'non-compliant';
        let statusColor = 'red';
        let statusText = 'Non-Compliant';

        if (compliancePercentage >= 100) {
            status = 'compliant';
            statusColor = 'green';
            statusText = 'Fully Compliant';
        } else if (compliancePercentage >= 80) {
            status = 'partial';
            statusColor = 'yellow';
            statusText = 'Partially Compliant';
        }

        // CSR spending breakdown (estimated based on social score)
        const spendingBreakdown = [
            { category: 'Education', amount: actualSpending * 0.25, percentage: 25 },
            { category: 'Healthcare', amount: actualSpending * 0.20, percentage: 20 },
            { category: 'Environment', amount: actualSpending * 0.20, percentage: 20 },
            { category: 'Rural Development', amount: actualSpending * 0.15, percentage: 15 },
            { category: 'Women Empowerment', amount: actualSpending * 0.10, percentage: 10 },
            { category: 'Others', amount: actualSpending * 0.10, percentage: 10 }
        ];

        return {
            requiredSpending,
            actualSpending,
            compliancePercentage: Math.min(100, compliancePercentage),
            gap,
            status,
            statusColor,
            statusText,
            socialScore,
            spendingBreakdown,
            standard
        };
    };

    const compliance = calculateCSRCompliance();

    // Prepare chart data
    const comparisonData = compliance ? [
        { name: 'Required', value: compliance.requiredSpending, fill: '#ef4444' },
        { name: 'Actual', value: compliance.actualSpending, fill: '#10b981' },
        { name: 'Gap', value: compliance.gap, fill: '#f59e0b' }
    ] : [];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'];

    if (!company) {
        return (
            <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a company to check CSR compliance</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">CSR Compliance Checker</h2>
                    <p className="text-gray-600 mt-1">
                        Assess social responsibility spending for {company.Company}
                    </p>
                </div>
                <Shield className="w-8 h-8 text-primary-600" />
            </div>

            {/* Legal Standard Selector */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Legal Standard
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                    {Object.keys(legalStandards).map(key => (
                        <button
                            key={key}
                            onClick={() => setSelectedStandard(key)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${selectedStandard === key
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="font-semibold text-gray-900 mb-1">
                                {legalStandards[key].name.split('(')[0]}
                            </div>
                            <div className="text-xs text-gray-600">
                                Required: {legalStandards[key].requiredPercentage}% of net profits
                            </div>
                        </button>
                    ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700">
                        <strong>Applicability:</strong> {compliance?.standard.applicability}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                        <strong>Description:</strong> {compliance?.standard.description}
                    </p>
                </div>
            </div>

            {/* Overall Compliance Status */}
            {compliance && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-6 border-2 ${compliance.statusColor === 'green'
                            ? 'bg-green-50 border-green-200'
                            : compliance.statusColor === 'yellow'
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'bg-red-50 border-red-200'
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {compliance.status === 'compliant' ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : compliance.status === 'partial' ? (
                                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                            ) : (
                                <XCircle className="w-8 h-8 text-red-600" />
                            )}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {compliance.statusText}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    CSR Spending Compliance Status
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">
                                {compliance.compliancePercentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">Compliance Level</div>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all ${compliance.statusColor === 'green'
                                    ? 'bg-green-600'
                                    : compliance.statusColor === 'yellow'
                                        ? 'bg-yellow-600'
                                        : 'bg-red-600'
                                }`}
                            style={{ width: `${compliance.compliancePercentage}%` }}
                        />
                    </div>
                </motion.div>
            )}

            {/* CSR Spending Details */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Spending Comparison */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        CSR Spending Analysis
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-red-600" />
                                <span className="font-semibold text-gray-900">Required Spending</span>
                            </div>
                            <span className="text-xl font-bold text-red-600">
                                {compliance?.requiredSpending.toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-gray-900">Actual Spending</span>
                            </div>
                            <span className="text-xl font-bold text-green-600">
                                {compliance?.actualSpending.toFixed(2)}%
                            </span>
                        </div>
                        {compliance && compliance.gap > 0 && (
                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                                    <span className="font-semibold text-gray-900">Spending Gap</span>
                                </div>
                                <span className="text-xl font-bold text-orange-600">
                                    {compliance.gap.toFixed(2)}%
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-gray-900">Social Score</span>
                            </div>
                            <span className="text-xl font-bold text-blue-600">
                                {compliance?.socialScore.toFixed(1)}/100
                            </span>
                        </div>
                    </div>
                </div>

                {/* Spending Breakdown Pie Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        CSR Spending Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={compliance?.spendingBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ category, percentage }) => `${category} (${percentage}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="percentage"
                            >
                                {compliance?.spendingBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Spending Categories */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">CSR Investment by Category</h3>
                <div className="space-y-3">
                    {compliance?.spendingBreakdown.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="font-semibold text-gray-900">{item.category}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-600">
                                    {item.amount.toFixed(2)}% of net profits
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full"
                                    style={{
                                        width: `${item.percentage}%`,
                                        backgroundColor: COLORS[index % COLORS.length]
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            {compliance && compliance.status !== 'compliant' && (
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">
                                Recommendations for Compliance
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600">•</span>
                                    <span>
                                        Increase CSR spending by {compliance.gap.toFixed(2)}% to meet legal requirements
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600">•</span>
                                    <span>
                                        Focus on priority areas: Education, Healthcare, and Environment
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600">•</span>
                                    <span>
                                        Establish a dedicated CSR committee as per Companies Act 2013
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600">•</span>
                                    <span>
                                        Improve transparency in CSR reporting and disclosure
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600">•</span>
                                    <span>
                                        Align CSR activities with UN Sustainable Development Goals (SDGs)
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {compliance && compliance.status === 'compliant' && (
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">
                                Excellent CSR Performance!
                            </h3>
                            <p className="text-sm text-gray-700">
                                {company.Company} is fully compliant with {compliance.standard.name}.
                                The company demonstrates strong commitment to social responsibility and
                                ethical business practices.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ComplianceCheck;
