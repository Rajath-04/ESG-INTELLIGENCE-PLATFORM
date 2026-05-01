import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, TrendingUp, Shield, FileText, Bot, Beaker } from 'lucide-react';
import { login, register } from '../api';

function Landing({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true); // Track login vs signup
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('investor'); // Track selected role
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Force login mode when admin role is selected
    useEffect(() => {
        if (role === 'admin') {
            setIsLogin(true);
        }
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = isLogin
                ? await login(username, password)
                : await register(username, password);

            onLogin(response.access_token, response.username, response.role);
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg shadow-lg">
                            <Leaf className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                ESG Intelligence Platform
                            </h1>
                            <p className="text-xs text-gray-600">Sustainable investing insights</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left side - Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div>
                            <div className="inline-block mb-4">
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                                    🌱 Sustainable Investing
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
                                Discover ESG Intelligence
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Analyze how companies perform on <span className="text-emerald-700 font-semibold">Environmental, Social, and Governance</span> factors, track controversies, and see how ESG links to market performance.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform">
                                <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-gray-700">Company-wise ESG scores & sector comparison</span>
                            </div>
                            <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform">
                                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-gray-700">India-focused ESG news & controversies</span>
                            </div>
                            <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform">
                                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    <Beaker className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="text-gray-700">Custom ESG Lab with hybrid scoring (MSCI + risk)</span>
                            </div>
                            <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform">
                                <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    <Shield className="w-5 h-5 text-orange-600" />
                                </div>
                                <span className="text-gray-700">One-click ESG investor report (PDF)</span>
                            </div>
                            <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform">
                                <div className="p-2 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    <Bot className="w-5 h-5 text-cyan-600" />
                                </div>
                                <span className="text-gray-700">ESG GPT assistant for investor questions</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">500+</div>
                                <div className="text-xs text-gray-600">Companies</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">15+</div>
                                <div className="text-xs text-gray-600">Sectors</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">24/7</div>
                                <div className="text-xs text-gray-600">ESG GPT</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right side - Auth Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                    >
                        <div className="mb-6 text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-3">
                                <Leaf className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome</h2>
                            <p className="text-sm text-gray-600">Sign in to access your dashboard</p>
                        </div>

                        {/* Tab switcher - Only show for Investor */}
                        {role === 'investor' && (
                            <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 ${isLogin
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 ${!isLogin
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}

                        {/* Admin login notice */}
                        {role === 'admin' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-5 bg-purple-50 border border-purple-200 rounded-xl p-3"
                            >
                                <p className="text-xs text-purple-700 text-center font-medium flex items-center justify-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Admin access only
                                </p>
                            </motion.div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {isLogin ? 'Log in as' : 'Sign up as'}
                                </label>
                                <div className="flex gap-3">
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="investor"
                                            checked={role === 'investor'}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="peer sr-only"
                                        />
                                        <div className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gray-50 border-2 border-gray-300 rounded-xl peer-checked:bg-emerald-50 peer-checked:border-emerald-500 transition-all">
                                            <TrendingUp className="w-4 h-4 text-gray-600 peer-checked:text-emerald-600" />
                                            <span className="text-sm font-medium text-gray-700">Investor</span>
                                        </div>
                                    </label>
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={role === 'admin'}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="peer sr-only"
                                        />
                                        <div className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gray-50 border-2 border-gray-300 rounded-xl peer-checked:bg-purple-50 peer-checked:border-purple-500 transition-all">
                                            <Shield className="w-4 h-4 text-gray-600 peer-checked:text-purple-600" />
                                            <span className="text-sm font-medium text-gray-700">Admin</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Please wait...
                                    </span>
                                ) : (
                                    isLogin ? 'Sign In' : 'Create Account'
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* About Us Section */}
            <div className="bg-white border-t border-gray-200 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-700 to-gray-900 bg-clip-text text-transparent mb-4">
                            About Us
                        </h2>
                        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                            Empowering investors with comprehensive ESG intelligence for sustainable and responsible investing in India
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {/* Mission */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
                            <p className="text-gray-600">
                                To democratize access to ESG data and insights, enabling investors to make informed decisions that drive positive environmental and social impact.
                            </p>
                        </motion.div>

                        {/* Vision */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <Leaf className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
                            <p className="text-gray-600">
                                To become India's leading ESG intelligence platform, fostering a culture of sustainable investing and corporate responsibility across all sectors.
                            </p>
                        </motion.div>

                        {/* Values */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Values</h3>
                            <p className="text-gray-600">
                                Transparency, accuracy, and innovation guide our work. We believe in data-driven insights that create long-term value for investors and society.
                            </p>
                        </motion.div>
                    </div>

                    {/* What We Offer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-gradient-to-r from-gray-50 to-emerald-50/30 rounded-2xl p-8 border border-gray-200"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What We Offer</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg mt-1">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Comprehensive ESG Data</h4>
                                    <p className="text-sm text-gray-600">Access detailed ESG scores, ratings, and metrics for 500+ Indian companies across 15+ sectors</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg mt-1">
                                    <Bot className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">AI-Powered Insights</h4>
                                    <p className="text-sm text-gray-600">Chat with our ESG GPT assistant for instant answers to your sustainability questions</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg mt-1">
                                    <Beaker className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Custom Analysis Tools</h4>
                                    <p className="text-sm text-gray-600">Upload your own datasets and create custom ESG scoring models tailored to your needs</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg mt-1">
                                    <TrendingUp className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Real-time Updates</h4>
                                    <p className="text-sm text-gray-600">Stay informed with the latest ESG news, controversies, and regulatory changes</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-3 mb-4 md:mb-0">
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
                                <Leaf className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-white">ESG Intelligence Platform</div>
                                <div className="text-xs text-gray-400">Sustainable investing insights</div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-400">
                            © 2024 ESG Intelligence Platform. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function Feature({ icon, text }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1 text-primary-400">{icon}</div>
            <p className="text-gray-300">{text}</p>
        </div>
    );
}

export default Landing;
