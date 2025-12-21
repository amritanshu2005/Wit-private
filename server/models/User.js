import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['citizen', 'authority', 'admin'],
        default: 'citizen'
    },
    department: {
        type: String,
        default: null
    },
    civicPoints: {
        type: Number,
        default: 0
    },
    badges: [{
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now }
    }],
    avatar: {
        type: String,
        default: null
    },
    issuesReported: {
        type: Number,
        default: 0
    },
    issuesVerified: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Award badge method
userSchema.methods.awardBadge = function (badgeName, icon) {
    const exists = this.badges.find(b => b.name === badgeName);
    if (!exists) {
        this.badges.push({ name: badgeName, icon });
    }
};

export default mongoose.model('User', userSchema);
