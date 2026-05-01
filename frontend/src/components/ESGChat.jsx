import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { sendChatMessage } from '../api';

function ESGChat({ companies }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your ESG assistant for this platform. Ask me about companies, sectors, ESG risk levels, or what ESG means.",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [groqApiKey, setGroqApiKey] = useState('');
    const [apiKeyStatus, setApiKeyStatus] = useState(''); // 'enabled', 'error', or ''
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleApiKeyChange = (e) => {
        const key = e.target.value;
        setGroqApiKey(key);

        // Show status when key is entered
        if (key.trim().length > 20) { // Groq API keys are typically longer
            setApiKeyStatus('enabled');
            // Add confirmation message
            if (messages.length === 1 || !messages.some(m => m.content.includes('ESG GPT Enabled'))) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: '✅ ESG GPT Enabled! You can now ask advanced questions and get AI-powered responses.',
                }]);
            }
        } else if (key.trim().length === 0) {
            setApiKeyStatus('');
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await sendChatMessage(input, groqApiKey || null);
            const assistantMessage = {
                role: 'assistant',
                content: response.answer,
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            let errorMessage = 'Sorry, I encountered an error. ';

            if (error.response?.data?.detail) {
                errorMessage += error.response.data.detail;
            } else if (error.response?.data?.error) {
                errorMessage += error.response.data.error;
            } else if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Please try again or use without API key for rule-based responses.';
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMessage,
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setMessages([
            {
                role: 'assistant',
                content: "Hi! I'm your ESG assistant for this platform. Ask me about companies, sectors, ESG risk levels, or what ESG means.",
            },
        ]);
    };

    return (
        <div className="space-y-4">
            {/* API Key Input (Optional) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card ${apiKeyStatus === 'enabled' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}
            >
                <div className="flex items-start gap-3">
                    <Bot className={`w-5 h-5 mt-1 ${apiKeyStatus === 'enabled' ? 'text-green-600' : 'text-blue-600'}`} />
                    <div className="flex-1">
                        {apiKeyStatus === 'enabled' ? (
                            <p className="text-sm text-green-900 mb-2 font-semibold">
                                ✅ ESG GPT Enabled - AI-powered responses active
                            </p>
                        ) : (
                            <p className="text-sm text-blue-900 mb-2">
                                <strong>Optional:</strong> Add your Groq API key for enhanced AI responses. Leave empty for rule-based answers.
                            </p>
                        )}
                        <input
                            type="password"
                            value={groqApiKey}
                            onChange={handleApiKeyChange}
                            placeholder="Enter Groq API key (optional)"
                            className="input text-sm"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Chat Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">ESG Assistant</h3>
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear
                    </button>
                </div>

                {/* Messages */}
                <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4 space-y-4">
                    {messages.map((message, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="bg-primary-500 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white border border-gray-200 text-gray-900'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            {message.role === 'user' && (
                                <div className="bg-gray-700 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="bg-primary-500 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white border border-gray-200 p-3 rounded-lg">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                        placeholder="Ask about ESG scores, companies, sectors..."
                        className="input flex-1"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="btn-primary"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default ESGChat;
