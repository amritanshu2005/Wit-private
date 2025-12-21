import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { issuesAPI } from '../services/api';
import {
    MapPin, ThumbsUp, CheckCircle, MessageCircle,
    Share2, AlertTriangle, Clock, User, ArrowLeft,
    Send
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
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending Review' },
    verified: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Community Verified' },
    'in-progress': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', label: 'Being Resolved' },
    resolved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Resolved' },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rejected' }
};

const IssuePage = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upvoting, setUpvoting] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [comment, setComment] = useState('');
    const [commenting, setCommenting] = useState(false);

    useEffect(() => {
        fetchIssue();
    }, [id]);

    const fetchIssue = async () => {
        try {
            const response = await issuesAPI.getById(id);
            setIssue(response.data);
        } catch (error) {
            console.error('Failed to fetch issue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async () => {
        if (!isAuthenticated || upvoting) return;
        setUpvoting(true);
        try {
            const response = await issuesAPI.upvote(id);
            setIssue(prev => ({
                ...prev,
                upvotes: response.data.upvoted
                    ? [...(prev.upvotes || []), { user: user._id }]
                    : (prev.upvotes || []).filter(u => u.user !== user._id)
            }));
        } catch (error) {
            console.error('Failed to upvote:', error);
        }
        setUpvoting(false);
    };

    const handleVerify = async (verified) => {
        if (!isAuthenticated || verifying) return;
        setVerifying(true);
        try {
            await issuesAPI.verify(id, { verified, comment: '' });
            fetchIssue();
        } catch (error) {
            console.error('Failed to verify:', error);
        }
        setVerifying(false);
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim() || commenting) return;
        setCommenting(true);
        try {
            const response = await issuesAPI.comment(id, { text: comment });
            setIssue(prev => ({ ...prev, comments: response.data.comments }));
            setComment('');
        } catch (error) {
            console.error('Failed to comment:', error);
        }
        setCommenting(false);
    };

    const hasUpvoted = issue?.upvotes?.some(u => u.user === user?._id || u.user?._id === user?._id);
    const hasVerified = issue?.verifications?.some(v => v.user === user?._id || v.user?._id === user?._id);

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Issue not found</h2>
                    <Link to="/map" className="text-indigo-400 hover:text-indigo-300">
                        ← Back to map
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container-custom">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <Link
                        to="/map"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Map
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Header */}
                        <div className="glass-card p-6 mb-6">
                            <div className="flex items-start gap-4">
                                <span className="text-4xl">{CATEGORY_ICONS[issue.category]}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`badge ${STATUS_STYLES[issue.status]?.bg} ${STATUS_STYLES[issue.status]?.text}`}>
                                            {STATUS_STYLES[issue.status]?.label}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {new Date(issue.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl font-bold mb-2">{issue.title}</h1>
                                    <p className="text-gray-400">{issue.description}</p>

                                    {issue.location?.address && (
                                        <div className="flex items-center gap-2 mt-4 text-gray-500">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">{issue.location.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Images */}
                            {issue.images?.length > 0 && (
                                <div className="mt-6 grid grid-cols-3 gap-3">
                                    {issue.images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img.url}
                                            alt={`Issue ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-xl"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-700">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleUpvote}
                                    disabled={!isAuthenticated || upvoting}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${hasUpvoted
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    <ThumbsUp className="w-5 h-5" />
                                    <span>{issue.upvotes?.length || 0}</span>
                                </motion.button>

                                {!hasVerified && isAuthenticated && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleVerify(true)}
                                        disabled={verifying}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Verify
                                    </motion.button>
                                )}

                                <div className="flex items-center gap-2 text-gray-500">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm">
                                        {issue.verifications?.filter(v => v.verified).length || 0} verifications
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reporter Info */}
                        <div className="glass-card p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4">Reported By</h2>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="font-medium">{issue.reporter?.name || 'Anonymous'}</p>
                                    <p className="text-sm text-gray-400">
                                        {issue.reporter?.civicPoints || 0} civic points
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Comments ({issue.comments?.length || 0})
                            </h2>

                            {isAuthenticated && (
                                <form onSubmit={handleComment} className="mb-6">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            className="input-field flex-1"
                                        />
                                        <motion.button
                                            type="submit"
                                            disabled={!comment.trim() || commenting}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="btn-primary px-4"
                                        >
                                            <Send className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-4">
                                {issue.comments?.length > 0 ? (
                                    issue.comments.map((c, index) => (
                                        <div key={index} className="p-4 bg-gray-800/50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <span className="font-medium">{c.user?.name || 'User'}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(c.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 ml-10">{c.text}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        No comments yet. Be the first to comment!
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default IssuePage;
