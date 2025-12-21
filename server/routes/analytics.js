import express from 'express';
import Issue from '../models/Issue.js';
import User from '../models/User.js';
import { auth, authorityOnly } from '../middleware/auth.js';

const router = express.Router();

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const totalIssues = await Issue.countDocuments();
        const pendingIssues = await Issue.countDocuments({ status: 'pending' });
        const inProgressIssues = await Issue.countDocuments({ status: 'in-progress' });
        const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
        const totalUsers = await User.countDocuments({ role: 'citizen' });

        // Calculate average resolution time
        const resolvedWithTime = await Issue.find({
            status: 'resolved',
            resolvedAt: { $exists: true }
        }).select('createdAt resolvedAt');

        let avgResolutionHours = 0;
        if (resolvedWithTime.length > 0) {
            const totalHours = resolvedWithTime.reduce((acc, issue) => {
                const hours = (issue.resolvedAt - issue.createdAt) / (1000 * 60 * 60);
                return acc + hours;
            }, 0);
            avgResolutionHours = Math.round(totalHours / resolvedWithTime.length);
        }

        // Category breakdown
        const categoryStats = await Issue.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Status breakdown
        const statusStats = await Issue.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Recent trends (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const dailyTrends = await Issue.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            overview: {
                totalIssues,
                pendingIssues,
                inProgressIssues,
                resolvedIssues,
                totalUsers,
                avgResolutionHours,
                resolutionRate: totalIssues ? Math.round((resolvedIssues / totalIssues) * 100) : 0
            },
            categoryStats,
            statusStats,
            dailyTrends
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Heatmap Data
router.get('/heatmap', async (req, res) => {
    try {
        const issues = await Issue.find({
            'location.coordinates': { $exists: true }
        }).select('location category status priority createdAt');

        // Group by location clusters
        const heatmapData = issues.map(issue => ({
            lat: issue.location.coordinates[1],
            lng: issue.location.coordinates[0],
            category: issue.category,
            status: issue.status,
            priority: issue.priority,
            weight: issue.priority / 10
        }));

        // Calculate hotspots (areas with high issue density)
        const hotspots = await Issue.aggregate([
            {
                $group: {
                    _id: {
                        lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 2] },
                        lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 2] }
                    },
                    count: { $sum: 1 },
                    avgPriority: { $avg: '$priority' },
                    categories: { $push: '$category' }
                }
            },
            { $match: { count: { $gte: 2 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            points: heatmapData,
            hotspots: hotspots.map(h => ({
                lat: h._id.lat,
                lng: h._id.lng,
                count: h.count,
                avgPriority: Math.round(h.avgPriority),
                dominantCategory: getMostFrequent(h.categories)
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Department Performance
router.get('/departments', auth, authorityOnly, async (req, res) => {
    try {
        const departmentStats = await Issue.aggregate([
            { $match: { assignedDepartment: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$assignedDepartment',
                    total: { $sum: 1 },
                    resolved: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    inProgress: {
                        $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json(departmentStats.map(dept => ({
            department: dept._id,
            total: dept.total,
            resolved: dept.resolved,
            pending: dept.pending,
            inProgress: dept.inProgress,
            resolutionRate: Math.round((dept.resolved / dept.total) * 100)
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Priority Queue
router.get('/priority-queue', auth, authorityOnly, async (req, res) => {
    try {
        const issues = await Issue.find({
            status: { $in: ['pending', 'verified', 'in-progress'] }
        })
            .populate('reporter', 'name')
            .sort({ priority: -1, createdAt: 1 })
            .limit(20);

        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Recent Activity
router.get('/activity', async (req, res) => {
    try {
        const recentIssues = await Issue.find()
            .populate('reporter', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title category status createdAt reporter location');

        const activities = recentIssues.map(issue => ({
            type: 'issue_created',
            issue: {
                id: issue._id,
                title: issue.title,
                category: issue.category,
                status: issue.status
            },
            user: issue.reporter,
            location: issue.location?.address,
            timestamp: issue.createdAt
        }));

        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function
function getMostFrequent(arr) {
    const counts = {};
    arr.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

export default router;
