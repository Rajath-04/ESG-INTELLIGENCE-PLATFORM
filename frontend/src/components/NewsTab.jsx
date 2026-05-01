import { useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { getNews } from '../api';

function NewsTab() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');

    const fetchNews = async () => {
        if (!query) return;

        setLoading(true);
        try {
            const data = await getNews(query, 10);
            setArticles(data.articles);
        } catch (error) {
            console.error('Failed to fetch news:', error);
            alert('Failed to fetch news articles');
        } finally {
            setLoading(false);
        }
    };

    const getSentimentBadge = (sentiment) => {
        if (sentiment.label === 'Positive') {
            return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Positive
            </span>;
        } else if (sentiment.label === 'Negative') {
            return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Negative
            </span>;
        } else {
            return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                Neutral
            </span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-gradient-to-br from-blue-50 to-primary-50 border-blue-200"
            >
                <h3 className="text-xl font-bold text-gray-900 mb-2">📰 ESG News Browser</h3>
                <p className="text-gray-700">
                    Search for ESG-related news articles from Google News. Articles are analyzed for sentiment
                    (Positive/Negative/Neutral) and controversy detection.
                </p>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Search ESG News</h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchNews()}
                        placeholder="e.g., Reliance India ESG OR sustainability OR pollution"
                        className="input flex-1"
                    />
                    <button
                        onClick={fetchNews}
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Loading...' : 'Search News'}
                    </button>
                </div>
            </motion.div>

            {/* Articles */}
            {articles.length > 0 && (
                <div className="space-y-4">
                    {articles.map((article, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="card hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-primary-100 p-3 rounded-lg">
                                    <Newspaper className="w-6 h-6 text-primary-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                                            <a href={article.url} target="_blank" rel="noopener noreferrer">
                                                {article.title}
                                            </a>
                                        </h4>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {getSentimentBadge(article.sentiment)}
                                            {article.sentiment.controversy && (
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Controversy
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-3">{article.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{article.source.name}</span>
                                        <span>•</span>
                                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {articles.length === 0 && !loading && (
                <div className="card text-center py-12">
                    <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">
                        Search for ESG-related news articles
                    </p>
                    <p className="text-sm text-gray-500">
                        Try searching for company names with keywords like "ESG", "sustainability", "pollution", or "controversy"
                    </p>
                </div>
            )}
        </div>
    );
}

export default NewsTab;
