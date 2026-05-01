import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SectorInsights({ company, companies }) {
    if (!company) return null;

    // Group companies by sector
    const sectorStats = companies.reduce((acc, comp) => {
        const sector = comp.Sector;
        if (!acc[sector]) {
            acc[sector] = {
                sector,
                companies: [],
                avgESG: 0,
                count: 0,
            };
        }
        acc[sector].companies.push(comp);
        acc[sector].count++;
        return acc;
    }, {});

    // Calculate averages
    const sectorData = Object.values(sectorStats).map(stat => ({
        sector: stat.sector,
        avgESG: stat.companies.reduce((sum, c) => sum + (parseFloat(c.ESG_Score) || 0), 0) / stat.count,
        count: stat.count,
    })).sort((a, b) => b.avgESG - a.avgESG);

    // Companies in same sector
    const sectorCompanies = companies
        .filter(c => c.Sector === company.Sector)
        .sort((a, b) => (parseFloat(b.ESG_Score) || 0) - (parseFloat(a.ESG_Score) || 0));

    return (
        <div className="space-y-6">
            {/* Sector Comparison */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sector ESG Comparison</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={sectorData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="sector" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgESG" fill="#10b981" name="Average ESG Score" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Sector Rankings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {company.Sector} Sector Rankings
                </h3>
                <div className="space-y-3">
                    {sectorCompanies.map((comp, idx) => (
                        <div
                            key={comp.Company}
                            className={`p-4 rounded-lg border-2 transition-all ${comp.Company === company.Company
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${idx < 3 ? 'bg-gradient-to-br from-accent-400 to-primary-400 text-white' : 'bg-gray-200 text-gray-700'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{comp.Company}</p>
                                        <p className="text-sm text-gray-600">Risk: {comp.Risk_Level}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary-600">
                                        {parseFloat(comp.ESG_Score).toFixed(1)}
                                    </p>
                                    <p className="text-sm text-gray-600">{comp.Investor_Action}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default SectorInsights;
