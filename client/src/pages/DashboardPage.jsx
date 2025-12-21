import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { issuesAPI, authAPI } from '../services/api';
import {
    FileText, Award, Trophy, CheckCircle, Clock,
    AlertTriangle, TrendingUp, Plus, Eye, ThumbsUp,
    Medal, Star, Zap
} from 'lucide-react';

const CATEGORY_ICONS = {
    road: '🚧',
    water: '💧',
    electricity: '⚡',
    safety: '🛡️',
    waste: '🗑️',
    other: '📋'
};

const STATUS_STYLES = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
    verified: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Verified' },
    'in-progress': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', label: 'In Progress' },
    resolved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Resolved' },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rejected' }
};

const DashboardPage = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my-issues');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [issuesRes, leaderboardRes] = await Promise.all([
                issuesAPI.getMyIssues(),
                authAPI.getLeaderboard()
            ]);
            setIssues(issuesRes.data);
            setLeaderboard(leaderboardRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: issues.length,
        resolved: issues.filter(i => i.status === 'resolved').length,
        pending: issues.filter(i => i.status === 'pending').length,
        inProgress: issues.filter(i => i.status === 'in-progress').length
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container-custom">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                    <p className="text-gray-400">Track your civic contributions and impact</p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="stats-card"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Total Reports</span>
                        </div>
                        <div className="text-3xl font-bold">{stats.total}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="stats-card"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Resolved</span>
                        </div>
                        <div className="text-3xl font-bold text-green-400">{stats.resolved}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="stats-card"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <Award className="w-5 h-5 text-yellow-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Civic Points</span>
                        </div>
                        <div className="text-3xl font-bold text-yellow-400">{user?.civicPoints || 0}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="stats-card"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Badges</span>
                        </div>
                        <div className="text-3xl font-bold">{user?.badges?.length || 0}</div>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Issues Section */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">My Reports</h2>
                                <Link to="/report">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> New Report
                                    </motion.button>
                                </Link>
                            </div>

                            {issues.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-4">No issues reported yet</p>
                                    <Link to="/report" className="text-indigo-400 hover:text-indigo-300">
                                        Report your first issue →
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {issues.slice(0, 5).map((issue, index) => (
                                        <motion.div
                                            key={issue._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link
                                                to={`/issue/${issue._id}`}
                                                className="block p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <span className="text-2xl">{CATEGORY_ICONS[issue.category]}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium truncate">{issue.title}</h3>
                                                        <p className="text-sm text-gray-400 truncate">{issue.description}</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className={`badge ${STATUS_STYLES[issue.status]?.bg} ${STATUS_STYLES[issue.status]?.text}`}>
                                                                {STATUS_STYLES[issue.status]?.label}
                                                            </span>
                                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                <ThumbsUp className="w-3 h-3" />
                                                                {issue.upvotes?.length || 0}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(issue.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Eye className="w-5 h-5 text-gray-500" />
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Badges */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold mb-4">My Badges</h2>
                            {user?.badges?.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {user.badges.map((badge, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl text-center"
                                        >
                                            <span className="text-2xl">{badge.icon}</span>
                                            <p className="text-xs text-gray-400 mt-1">{badge.name}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Report issues to earn badges!</p>
                            )}
                        </div>

                        {/* Leaderboard */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                                Top Guardians
                            </h2>
                            <div className="space-y-3">
                                {leaderboard.slice(0, 5).map((leader, index) => (
                                    <div
                                        key={leader._id}
                                        className={`flex items-center gap-3 p-3 rounded-xl ${leader._id === user?._id ? 'bg-indigo-500/20' : 'bg-gray-800/50'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-500 text-black' :
                                            index === 1 ? 'bg-gray-400 text-black' :
                                                index === 2 ? 'bg-orange-600 text-white' :
                                                    'bg-gray-700'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{leader.name}</p>
                                            <p className="text-xs text-gray-400">{leader.issuesReported} reports</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-yellow-400 font-semibold">{leader.civicPoints}</p>
                                            <p className="text-xs text-gray-500">pts</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
