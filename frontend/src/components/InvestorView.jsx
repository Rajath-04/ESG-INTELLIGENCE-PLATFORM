import { motion } from 'framer-motion';
import { Download, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { generateReport } from '../api';

function InvestorView({ company }) {
    if (!company) return null;

    const esgScore = parseFloat(company.ESG_Score) || 0;
    const riskLevel = company.Risk_Level;
    const action = company.Investor_Action;

    const handleDownloadReport = async () => {
        try {
            const blob = await generateReport(company.Company);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ESG_Report_${company.Company}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to generate report:', error);
            alert('Failed to generate PDF report');
        }
    };

    const getActionRecommendation = () => {
        if (action === 'Buy') {
            return {
                title: 'Strong Buy Recommendation',
                description: 'This company demonstrates excellent ESG performance with low risk factors. Consider for long-term sustainable investment.',
                icon: <TrendingUp className="w-8 h-8" />,
                color: 'green',
            };
        } else if (action === 'Hold') {
            return {
                title: 'Hold Recommendation',
                description: 'This company shows moderate ESG performance. Monitor for improvements before increasing position.',
                icon: <Shield className="w-8 h-8" />,
                color: 'yellow',
            };
        } else {
            return {
                title: 'Avoid Recommendation',
                description: 'This company has concerning ESG metrics and high risk factors. Consider alternatives with better sustainability profiles.',
                icon: <AlertTriangle className="w-8 h-8" />,
                color: 'red',
            };
        }
    };

    const recommendation = getActionRecommendation();

    const colorClasses = {
        green: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: 'text-green-600',
        },
        yellow: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            icon: 'text-yellow-600',
        },
        red: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: 'text-red-600',
        },
    };

    const colors = colorClasses[recommendation.color];

    return (
        <div className="space-y-6">
            {/* Investment Recommendation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border-2 ${colors.bg} ${colors.border}`}
            >
                <div className="flex items-start gap-4">
                    <div className={colors.icon}>
                        {recommendation.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-2xl font-bold mb-2 ${colors.text}`}>
                            {recommendation.title}
                        </h3>
                        <p className={`text-lg ${colors.text}`}>
                            {recommendation.description}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <h4 className="text-sm font-medium text-gray-600 mb-2">ESG Score</h4>
                    <p className="text-4xl font-bold text-primary-600 mb-2">{esgScore.toFixed(1)}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${esgScore}%` }}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Risk Level</h4>
                    <p className={`text-4xl font-bold mb-2 ${riskLevel === 'Low' ? 'text-green-600' :
                            riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {riskLevel}
                    </p>
                    <p className="text-sm text-gray-600">
                        {riskLevel === 'Low' ? 'Minimal ESG concerns' :
                            riskLevel === 'Medium' ? 'Moderate ESG concerns' : 'Significant ESG concerns'}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card"
                >
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Investor Action</h4>
                    <p className={`text-4xl font-bold mb-2 ${action === 'Buy' ? 'text-green-600' :
                            action === 'Hold' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {action}
                    </p>
                    <p className="text-sm text-gray-600">Based on ESG analysis</p>
                </motion.div>
            </div>

            {/* Download Report */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            ESG Investor Report
                        </h3>
                        <p className="text-gray-600">
                            Download a comprehensive PDF report with ESG scores, risk analysis, and investment recommendations.
                        </p>
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Download PDF
                    </button>
                </div>
            </motion.div>

            {/* Investment Notes */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card bg-blue-50 border-blue-200"
            >
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    📌 Important Notes for Investors
                </h3>
                <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>This report summarizes ESG performance for indicative decision support.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Combine ESG insights with financial analysis and valuation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Check official annual reports, BRSR filings, and independent research.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>ESG scores may evolve with new controversies or policy changes.</span>
                    </li>
                </ul>
            </motion.div>
        </div>
    );
}

export default InvestorView;
