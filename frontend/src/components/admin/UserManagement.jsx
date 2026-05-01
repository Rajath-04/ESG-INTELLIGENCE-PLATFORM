import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, UserPlus, Shield, User } from 'lucide-react';
import api from '../../api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/api/admin/users');
            setUsers(response.data.users);
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (username) => {
        if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
            return;
        }

        try {
            await api.delete(`/api/admin/users/${username}`);
            setUsers(users.filter(u => u.username !== username));
        } catch (err) {
            alert('Failed to delete user: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            await api.post('/api/register', {
                username: newAdmin.username,
                password: newAdmin.password,
                role: 'admin'
            });

            alert(`Admin account created successfully!\nUsername: ${newAdmin.username}\nPassword: ${newAdmin.password}\n\nShare these credentials with your teammate.`);
            setShowCreateAdmin(false);
            setNewAdmin({ username: '', password: '' });
            fetchUsers(); // Refresh user list
        } catch (err) {
            alert('Failed to create admin: ' + (err.response?.data?.detail || err.message));
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return <div className="text-gray-900 text-center py-8">Loading users...</div>;
    }

    if (error) {
        return <div className="text-red-600 text-center py-8">{error}</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
                    <p className="text-gray-600 text-sm">Total Users: {users.length}</p>
                </div>
                <button
                    onClick={() => setShowCreateAdmin(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                >
                    <UserPlus size={18} />
                    Create Admin
                </button>
            </div>

            {/* Create Admin Modal */}
            {showCreateAdmin && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowCreateAdmin(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Create Admin Account</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Create a new admin account to share dashboard access with your teammates.
                        </p>

                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={newAdmin.username}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="text"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="Enter password"
                                    required
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    You'll need to share this password with your teammate
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateAdmin(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            Create Admin
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            <div className="space-y-3">
                {users.map((user, index) => (
                    <motion.div
                        key={user.username}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all border border-gray-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${user.role === 'admin'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {user.role === 'admin' ? <Shield size={20} /> : <User size={20} />}
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">{user.username}</p>
                                <p className="text-gray-600 text-sm capitalize">{user.role}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleDeleteUser(user.username)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                            title="Delete user"
                        >
                            <Trash2 size={18} />
                        </button>
                    </motion.div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="text-center text-gray-600 py-12">
                    No users found
                </div>
            )}
        </div>
    );
}
