import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['road', 'water', 'electricity', 'safety', 'waste', 'other'],
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: String
    },
    images: [{
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['pending', 'verified', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    priority: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    aiAnalysis: {
        detectedCategory: String,
        confidence: Number,
        sentiment: String,
        urgency: String,
        keywords: [String]
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedDepartment: {
        type: String,
        default: null
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    upvotes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    verifications: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verified: Boolean,
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    timeline: [{
        action: String,
        description: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    resolvedAt: Date,
    expectedResolutionDate: Date
}, { timestamps: true });

// Create 2dsphere index for geospatial queries
issueSchema.index({ location: '2dsphere' });
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ createdAt: -1 });

// Virtual for upvote count
issueSchema.virtual('upvoteCount').get(function () {
    return this.upvotes.length;
});

// Virtual for verification count
issueSchema.virtual('verificationCount').get(function () {
    return this.verifications.filter(v => v.verified).length;
});

// Method to add timeline entry
issueSchema.methods.addTimelineEntry = function (action, description, userId) {
    this.timeline.push({
        action,
        description,
        performedBy: userId
    });
};

// Static method to find nearby issues
issueSchema.statics.findNearby = function (lng, lat, maxDistance = 5000) {
    return this.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $maxDistance: maxDistance
            }
        }
    });
};

export default mongoose.model('Issue', issueSchema);
