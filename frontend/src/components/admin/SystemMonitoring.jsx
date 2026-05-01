import { motion } from 'framer-motion';
import { TrendingUp, Users, Database, Activity } from 'lucide-react';

export default function SystemMonitoring({ stats }) {
    const metrics = [
        {
            label: 'Total Users',
            value: stats?.total_users || 0,
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'blue'
        },
        {
            label: 'Companies Tracked',
            value: stats?.total_companies || 0,
            change: '+5%',
            trend: 'up',
            icon: Database,
            color: 'green'
        },
        {
            label: 'Avg ESG Score',
            value: stats?.avg_esg_score?.toFixed(1) || 'N/A',
            change: '+2.3',
            trend: 'up',
            icon: TrendingUp,
            color: 'yellow'
        },
        {
            label: 'Active Sessions',
            value: '8',
            change: '-3',
            trend: 'down',
            icon: Activity,
            color: 'purple'
        }
    ];

    const systemHealth = [
        { name: 'API Server', status: 'Healthy', uptime: '99.9%', color: 'green' },
        { name: 'Database', status: 'Healthy', uptime: '99.8%', color: 'green' },
        { name: 'News Service', status: 'Healthy', uptime: '98.5%', color: 'green' },
        { name: 'AI Chat (Groq)', status: 'Operational', uptime: '97.2%', color: 'yellow' },
    ];

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">System Monitoring</h3>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-lg p-4 border border-gray-200"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <Icon size={20} className={`text-${metric.color}-400`} />
                                <span className={`text-sm ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {metric.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                            <p className="text-gray-600 text-sm">{metric.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* System Health */}
            <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">System Health</h4>
                <div className="space-y-3">
                    {systemHealth.map((service, index) => (
                        <motion.div
                            key={service.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${service.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'
                                    } animate-pulse`} />
                                <div>
                                    <p className="text-gray-900 font-medium">{service.name}</p>
                                    <p className="text-gray-600 text-sm">{service.status}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-900 font-semibold">{service.uptime}</p>
                                <p className="text-gray-600 text-sm">Uptime</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
