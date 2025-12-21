import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, issuesAPI } from '../services/api';
import {
    BarChart3, TrendingUp, AlertTriangle, CheckCircle,
    Clock, Users, MapPin, Activity, ArrowUp, ArrowDown,
    ChevronRight, RefreshCw
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';

const CATEGORY_COLORS = {
    road: '#ef4444',
    water: '#3b82f6',
    electricity: '#f59e0b',
    safety: '#8b5cf6',
    waste: '#22c55e',
    other: '#6b7280'
};

const STATUS_COLORS = {
    pending: '#f59e0b',
    verified: '#3b82f6',
    'in-progress': '#6366f1',
    resolved: '#22c55e',
    rejected: '#ef4444'
};

const AuthorityDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [priorityQueue, setPriorityQueue] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, queueRes, activityRes] = await Promise.all([
                analyticsAPI.getStats(),
                analyticsAPI.getPriorityQueue().catch(() => ({ data: [] })),
                analyticsAPI.getActivity()
            ]);
            setStats(statsRes.data);
            setPriorityQueue(queueRes.data || []);
            setActivities(activityRes.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const handleStatusUpdate = async (issueId, newStatus) => {
        try {
            await issuesAPI.updateStatus(issueId, { status: newStatus });
            fetchData();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const categoryData = stats?.categoryStats?.map(cat => ({
        name: cat._id?.charAt(0).toUpperCase() + cat._id?.slice(1) || 'Unknown',
        value: cat.count,
        color: CATEGORY_COLORS[cat._id] || CATEGORY_COLORS.other
    })) || [];

    const statusData = stats?.statusStats?.map(s => ({
        name: s._id?.replace('-', ' ').charAt(0).toUpperCase() + s._id?.slice(1) || 'Unknown',
        value: s.count,
        color: STATUS_COLORS[s._id] || '#6b7280'
    })) || [];

    const trendData = stats?.dailyTrends || [];

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <div className="container-custom">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Authority Dashboard</h1>
                        <p className="text-gray-400">Real-time civic intelligence for {user?.department || 'All Departments'}</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-3 glass-card hover:bg-gray-800 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </motion.div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-indigo-400" />
                            </div>
                            <span className="text-green-400 text-sm flex items-center gap-1">
                                <ArrowUp className="w-3 h-3" /> 12%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold">{stats?.overview?.totalIssues || 0}</h3>
                        <p className="text-gray-400 text-sm">Total Issues</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                            </div>
                            <span className="text-yellow-400 text-sm">Needs attention</span>
                        </div>
                        <h3 className="text-3xl font-bold">{stats?.overview?.pendingIssues || 0}</h3>
                        <p className="text-gray-400 text-sm">Pending Issues</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <span className="text-green-400 text-sm">{stats?.overview?.resolutionRate || 0}%</span>
                        </div>
                        <h3 className="text-3xl font-bold">{stats?.overview?.resolvedIssues || 0}</h3>
                        <p className="text-gray-400 text-sm">Resolved Issues</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold">{stats?.overview?.avgResolutionHours || 0}h</h3>
                        <p className="text-gray-400 text-sm">Avg Resolution Time</p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Category Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-xl font-semibold mb-6">Issues by Category</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {categoryData.map((cat, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded" style={{ background: cat.color }}></div>
                                    <span>{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Status Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-xl font-semibold mb-6">Issues by Status</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis type="number" stroke="#64748b" />
                                    <YAxis dataKey="name" type="category" stroke="#64748b" width={80} />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Weekly Trend */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-xl font-semibold mb-6">7-Day Trend</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis
                                        dataKey="_id"
                                        stroke="#64748b"
                                        tickFormatter={(val) => val?.slice(-5) || ''}
                                    />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#6366f1"
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Priority Queue */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            Priority Queue
                        </h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {priorityQueue.length > 0 ? (
                                priorityQueue.map((issue, index) => (
                                    <div
                                        key={issue._id}
                                        className="p-4 bg-gray-800/50 rounded-xl flex items-center gap-4"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${issue.priority >= 8 ? 'bg-red-500' :
                                            issue.priority >= 5 ? 'bg-yellow-500' :
                                                'bg-blue-500'
                                            }`}>
                                            {issue.priority}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate">{issue.title}</h3>
                                            <p className="text-sm text-gray-400">{issue.category} • {issue.reporter?.name}</p>
                                        </div>
                                        <select
                                            value={issue.status}
                                            onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">No pending issues</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-400" />
                            Recent Activity
                        </h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {activities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">
                                            <span className="font-medium">{activity.user?.name || 'User'}</span>
                                            {' reported '}
                                            <span className="text-indigo-400">{activity.issue?.title}</span>
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AuthorityDashboard;
