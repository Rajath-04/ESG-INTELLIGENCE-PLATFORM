import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Play, BarChart3 } from 'lucide-react';
import { uploadCustomESG, processCustomESG, getNews } from '../api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function CustomLab() {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newsLoading, setNewsLoading] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companyNews, setCompanyNews] = useState([]);
    const [esgNewsScore, setEsgNewsScore] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setUploadStatus('');
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const response = await uploadCustomESG(file);
            setUploadStatus(`✓ Uploaded ${response.rows} companies with ${response.columns.length} columns`);
        } catch (error) {
            setUploadStatus('✗ Upload failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async () => {
        setLoading(true);
        try {
            const response = await processCustomESG();
            setResults(response.companies);
            setUploadStatus('✓ ESG engine completed successfully');
        } catch (error) {
            console.error('Processing error:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
            setUploadStatus('✗ Processing failed: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyNews = async (company) => {
        setSelectedCompany(company);
        setNewsLoading(true);
        setCompanyNews([]);
        setEsgNewsScore(null);

        try {
            const query = `${company.Company} India ESG OR sustainability`;
            const data = await getNews(query, 10);
            setCompanyNews(data.articles);

            // Calculate ESG + News Score
            if (data.articles.length > 0) {
                const baseESG = parseFloat(company.ESG_Score) || 0;

                let sentimentSum = 0;
                let controversyCount = 0;

                data.articles.forEach(article => {
                    const sentiment = article.sentiment;
                    if (sentiment.label === 'Positive') sentimentSum += sentiment.score;
                    else if (sentiment.label === 'Negative') sentimentSum -= Math.abs(sentiment.score);
                    if (sentiment.controversy) controversyCount++;
                });

                const avgSentiment = sentimentSum / data.articles.length;
                const controversyPenalty = controversyCount * 2;
                const adjustedESG = Math.max(0, Math.min(100, baseESG + avgSentiment - controversyPenalty));
                const impact = adjustedESG - baseESG;

                setEsgNewsScore({
                    baseESG: baseESG.toFixed(1),
                    adjustedESG: adjustedESG.toFixed(1),
                    impact: impact.toFixed(1),
                    sentimentAvg: avgSentiment.toFixed(1),
                    controversies: controversyCount,
                });
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setNewsLoading(false);
        }
    };

    const riskColors = {
        'Negligible': '#15803D',
        'Low': '#4ADE80',
        'Medium': '#FACC15',
        'High': '#FB923C',
        'Severe': '#DC2626',
    };

    return (
        <div className="space-y-6">
            {/* Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200"
            >
                <h3 className="text-xl font-bold text-gray-900 mb-3">🔬 Custom ESG Lab</h3>
                <p className="text-gray-700 mb-4">
                    This lab uses a richer ESG dataset and computes:
                </p>
                <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-primary-600 mt-1">•</span>
                        <span>MSCI-style <strong>ESG Score (0–100) + AAA–CCC rating</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-600 mt-1">•</span>
                        <span>Sustainalytics-style <strong>Risk score (0–100) + Negligible→Severe</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-600 mt-1">•</span>
                        <span>Sector-percentile & data coverage</span>
                    </li>
                </ul>
            </motion.div>

            {/* Upload */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload ESG Dataset</h3>
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer text-primary-600 hover:text-primary-700 font-semibold"
                        >
                            Choose CSV or Excel file
                        </label>
                        {file && (
                            <p className="mt-2 text-sm text-gray-600">
                                Selected: {file.name}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            Upload Dataset
                        </button>
                        <button
                            onClick={handleProcess}
                            disabled={!uploadStatus.includes('✓') || loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Play className="w-5 h-5" />
                            Run ESG Engine
                        </button>
                    </div>

                    {uploadStatus && (
                        <div className={`p-3 rounded-lg ${uploadStatus.includes('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                            }`}>
                            {uploadStatus}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Results */}
            {results && results.length > 0 && (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">ESG Results</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Company</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Sector</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-900">ESG Score</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Rating</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Risk</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {results.slice(0, 10).map((company, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{company.Company}</td>
                                            <td className="px-4 py-3">{company.Sector}</td>
                                            <td className="px-4 py-3 font-semibold text-primary-600">
                                                {typeof company.ESG_Score === 'number' ? company.ESG_Score.toFixed(1) : company.ESG_Score}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded font-semibold">
                                                    {company.ESG_Rating}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded font-semibold" style={{
                                                    backgroundColor: riskColors[company.ESG_Risk_Category] + '20',
                                                    color: riskColors[company.ESG_Risk_Category],
                                                }}>
                                                    {company.ESG_Risk_Category}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* ESG + News Score Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card bg-gradient-to-br from-blue-50 to-primary-50 border-blue-200"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-4">📰 ESG + News Score</h3>
                        <p className="text-gray-700 mb-4">
                            Select a company to fetch recent news and see how news sentiment affects their ESG score
                        </p>

                        <div className="flex gap-3 mb-4">
                            <select
                                onChange={(e) => {
                                    const company = results.find(c => c.Company === e.target.value);
                                    if (company) fetchCompanyNews(company);
                                }}
                                className="input flex-1"
                                defaultValue=""
                            >
                                <option value="" disabled>Select a company to analyze news...</option>
                                {results.map((company, idx) => (
                                    <option key={idx} value={company.Company}>
                                        {company.Company} - ESG: {typeof company.ESG_Score === 'number' ? company.ESG_Score.toFixed(1) : company.ESG_Score}
                                    </option>
                                ))}
                            </select>
                            {newsLoading && (
                                <div className="flex items-center gap-2 text-primary-600">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                                    <span>Loading news...</span>
                                </div>
                            )}
                        </div>

                        {esgNewsScore && (
                            <div className="bg-white rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-gray-900 mb-3">
                                    {selectedCompany?.Company} - News Impact Analysis
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 mb-1">Base ESG</p>
                                        <p className="text-2xl font-bold text-gray-900">{esgNewsScore.baseESG}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 mb-1">News Sentiment</p>
                                        <p className={`text-2xl font-bold ${parseFloat(esgNewsScore.sentimentAvg) > 0 ? 'text-green-600' :
                                            parseFloat(esgNewsScore.sentimentAvg) < 0 ? 'text-red-600' : 'text-gray-600'
                                            }`}>
                                            {parseFloat(esgNewsScore.sentimentAvg) > 0 ? '+' : ''}{esgNewsScore.sentimentAvg}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 mb-1">Adjusted ESG</p>
                                        <p className="text-2xl font-bold text-primary-600">{esgNewsScore.adjustedESG}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 mb-1">Net Impact</p>
                                        <p className={`text-2xl font-bold ${parseFloat(esgNewsScore.impact) > 0 ? 'text-green-600' :
                                            parseFloat(esgNewsScore.impact) < 0 ? 'text-red-600' : 'text-gray-600'
                                            }`}>
                                            {parseFloat(esgNewsScore.impact) > 0 ? '+' : ''}{esgNewsScore.impact}
                                        </p>
                                    </div>
                                </div>
                                {esgNewsScore.controversies > 0 && (
                                    <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded text-sm text-orange-800">
                                        ⚠️ {esgNewsScore.controversies} controversy article{esgNewsScore.controversies > 1 ? 's' : ''} (penalty: -{esgNewsScore.controversies * 2} points)
                                    </div>
                                )}
                            </div>
                        )}

                        {companyNews.length > 0 && (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {companyNews.slice(0, 5).map((article, idx) => (
                                    <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <a href={article.url} target="_blank" rel="noopener noreferrer"
                                                className="text-sm font-semibold text-gray-900 hover:text-primary-600 flex-1">
                                                {article.title}
                                            </a>
                                            <div className="flex gap-1 flex-shrink-0">
                                                {article.sentiment.label === 'Positive' && (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                                        +{article.sentiment.score}
                                                    </span>
                                                )}
                                                {article.sentiment.label === 'Negative' && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                                        {article.sentiment.score}
                                                    </span>
                                                )}
                                                {article.sentiment.controversy && (
                                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                                                        ⚠️
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600">{article.source.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top ESG Scores</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={results.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="Company" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip />
                                    <Bar dataKey="ESG_Score" fill="#10b981" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={Object.entries(
                                            results.reduce((acc, c) => {
                                                acc[c.ESG_Risk_Category] = (acc[c.ESG_Risk_Category] || 0) + 1;
                                                return acc;
                                            }, {})
                                        ).map(([name, value]) => ({ name, value }))}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        dataKey="value"
                                    >
                                        {Object.keys(riskColors).map((key) => (
                                            <Cell key={key} fill={riskColors[key]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </motion.div>


                    </div>

                </>
            )}
        </div>
    );
}

export default CustomLab;
