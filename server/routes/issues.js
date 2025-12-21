import express from 'express';
import multer from 'multer';
import path from 'path';
import Issue from '../models/Issue.js';
import User from '../models/User.js';
import { auth, authorityOnly } from '../middleware/auth.js';

const router = express.Router();

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

// Create Issue
router.post('/', auth, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, category, latitude, longitude, address } = req.body;

        const images = req.files?.map(file => ({
            url: `/uploads/${file.filename}`
        })) || [];

        const issue = new Issue({
            title,
            description,
            category,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
                address
            },
            images,
            reporter: req.userId
        });

        // Add initial timeline entry
        issue.addTimelineEntry('created', 'Issue reported by citizen', req.userId);

        await issue.save();

        // Update user stats
        await User.findByIdAndUpdate(req.userId, {
            $inc: { issuesReported: 1, civicPoints: 10 }
        });

        res.status(201).json({
            message: 'Issue reported successfully',
            issue
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Issues (with filters)
router.get('/', async (req, res) => {
    try {
        const { category, status, page = 1, limit = 20, lat, lng, radius } = req.query;

        let query = {};

        if (category) query.category = category;
        if (status) query.status = status;

        // Geospatial query if coordinates provided
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius) || 5000
                }
            };
        }

        const issues = await Issue.find(query)
            .populate('reporter', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Issue.countDocuments(query);

        res.json({
            issues,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Single Issue
router.get('/:id', async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('reporter', 'name avatar civicPoints')
            .populate('comments.user', 'name avatar')
            .populate('verifications.user', 'name avatar');

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        res.json(issue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Issue Status (Authority only)
router.put('/:id/status', auth, authorityOnly, async (req, res) => {
    try {
        const { status, assignedDepartment } = req.body;

        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        issue.status = status;
        if (assignedDepartment) issue.assignedDepartment = assignedDepartment;
        if (status === 'resolved') issue.resolvedAt = new Date();

        issue.addTimelineEntry(
            'status_update',
            `Status changed to ${status}`,
            req.userId
        );

        await issue.save();

        res.json({ message: 'Issue updated', issue });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upvote Issue
router.post('/:id/upvote', auth, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        const existingUpvote = issue.upvotes.find(
            u => u.user.toString() === req.userId
        );

        if (existingUpvote) {
            // Remove upvote
            issue.upvotes = issue.upvotes.filter(
                u => u.user.toString() !== req.userId
            );
        } else {
            // Add upvote
            issue.upvotes.push({ user: req.userId });
            // Award points to reporter
            await User.findByIdAndUpdate(issue.reporter, {
                $inc: { civicPoints: 2 }
            });
        }

        await issue.save();

        res.json({
            upvoted: !existingUpvote,
            upvoteCount: issue.upvotes.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify Issue
router.post('/:id/verify', auth, async (req, res) => {
    try {
        const { verified, comment } = req.body;

        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        // Check if already verified by this user
        const existingVerification = issue.verifications.find(
            v => v.user.toString() === req.userId
        );

        if (existingVerification) {
            return res.status(400).json({ error: 'Already verified' });
        }

        issue.verifications.push({
            user: req.userId,
            verified,
            comment
        });

        // If enough verifications, update status
        const positiveVerifications = issue.verifications.filter(v => v.verified).length;
        if (positiveVerifications >= 3 && issue.status === 'pending') {
            issue.status = 'verified';
            issue.addTimelineEntry('verified', 'Issue verified by community', req.userId);
        }

        // Award points to verifier
        await User.findByIdAndUpdate(req.userId, {
            $inc: { issuesVerified: 1, civicPoints: 5 }
        });

        await issue.save();

        res.json({
            message: 'Verification recorded',
            verificationCount: issue.verifications.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Comment
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const { text } = req.body;

        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        issue.comments.push({
            user: req.userId,
            text
        });

        await issue.save();

        const populatedIssue = await Issue.findById(req.params.id)
            .populate('comments.user', 'name avatar');

        res.json({
            message: 'Comment added',
            comments: populatedIssue.comments
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get My Issues
router.get('/user/my-issues', auth, async (req, res) => {
    try {
        const issues = await Issue.find({ reporter: req.userId })
            .sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
