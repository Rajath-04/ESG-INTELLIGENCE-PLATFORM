import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Info, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../../api';

export default function SystemLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/admin/system-logs');
            setLogs(response.data.logs);
        } catch (err) {
            console.error('Failed to load logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getLevelIcon = (level) => {
        switch (level) {
            case 'ERROR':
                return <AlertCircle size={18} className="text-red-400" />;
            case 'WARNING':
                return <AlertCircle size={18} className="text-yellow-400" />;
            case 'INFO':
                return <Info size={18} className="text-blue-400" />;
            default:
                return <CheckCircle size={18} className="text-green-400" />;
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'ERROR':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'WARNING':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'INFO':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'bg-green-500/20 text-green-400 border-green-500/30';
        }
    };

    if (loading) {
        return <div className="text-gray-900 text-center py-8">Loading logs...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">System Logs</h3>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="space-y-3">
                {logs.map((log, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                    >
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                {getLevelIcon(log.level)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getLevelColor(log.level)}`}>
                                        {log.level}
                                    </span>
                                    <span className="text-gray-600 text-sm">{log.timestamp}</span>
                                </div>
                                <p className="text-gray-900">{log.message}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {logs.length === 0 && (
                <div className="text-center text-gray-600 py-12">
                    No logs available
                </div>
            )}
        </div>
    );
}
