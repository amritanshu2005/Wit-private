import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/icivic-guardian';

// User Schema (inline for seeding)
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'citizen' },
    department: String,
    civicPoints: { type: Number, default: 0 },
    badges: [{ name: String, icon: String, earnedAt: Date }],
    issuesReported: { type: Number, default: 0 },
    issuesVerified: { type: Number, default: 0 }
}, { timestamps: true });

// Issue Schema (inline for seeding)
const issueSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number],
        address: String
    },
    images: [{ url: String }],
    status: { type: String, default: 'pending' },
    priority: { type: Number, default: 5 },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    upvotes: [{ user: mongoose.Schema.Types.ObjectId }],
    verifications: [{ user: mongoose.Schema.Types.ObjectId, verified: Boolean }],
    assignedDepartment: String
}, { timestamps: true });

issueSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);
const Issue = mongoose.model('Issue', issueSchema);

// Sample Data
const sampleUsers = [
    {
        name: 'Demo Citizen',
        email: 'citizen@demo.com',
        password: 'demo123',
        role: 'citizen',
        civicPoints: 150,
        badges: [
            { name: 'Civic Starter', icon: '🌟', earnedAt: new Date() },
            { name: 'First Report', icon: '📝', earnedAt: new Date() }
        ],
        issuesReported: 5
    },
    {
        name: 'Authority Admin',
        email: 'authority@demo.com',
        password: 'demo123',
        role: 'authority',
        department: 'Municipal Corporation',
        civicPoints: 0
    },
    {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'demo123',
        role: 'citizen',
        civicPoints: 320,
        badges: [
            { name: 'Civic Starter', icon: '🌟', earnedAt: new Date() },
            { name: 'Community Hero', icon: '🦸', earnedAt: new Date() },
            { name: 'Verified Reporter', icon: '✅', earnedAt: new Date() }
        ],
        issuesReported: 12
    },
    {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: 'demo123',
        role: 'citizen',
        civicPoints: 280,
        badges: [
            { name: 'Civic Starter', icon: '🌟', earnedAt: new Date() },
            { name: 'Top Verifier', icon: '🏆', earnedAt: new Date() }
        ],
        issuesReported: 8,
        issuesVerified: 15
    }
];

// Issues around Delhi, India
const sampleIssues = [
    {
        title: 'Large pothole causing accidents',
        description: 'A dangerous pothole has formed on the main road near the market. Multiple vehicles have been damaged. Urgent repair needed.',
        category: 'road',
        location: {
            type: 'Point',
            coordinates: [77.2090, 28.6139], // Delhi
            address: 'Connaught Place, New Delhi'
        },
        status: 'pending',
        priority: 8
    },
    {
        title: 'Water pipe leakage flooding street',
        description: 'A major water pipe has burst causing flooding on the street. Water has been flowing for 3 days now.',
        category: 'water',
        location: {
            type: 'Point',
            coordinates: [77.2195, 28.6280],
            address: 'Karol Bagh, New Delhi'
        },
        status: 'in-progress',
        priority: 9,
        assignedDepartment: 'Water Supply'
    },
    {
        title: 'Street light not working',
        description: 'The street light outside the community center has been broken for 2 weeks. Area is very dark and unsafe at night.',
        category: 'electricity',
        location: {
            type: 'Point',
            coordinates: [77.2310, 28.6350],
            address: 'Rajendra Place, New Delhi'
        },
        status: 'verified',
        priority: 6
    },
    {
        title: 'Garbage dump near school',
        description: 'Garbage is being dumped near the school entrance. Very unhygienic and children are falling sick.',
        category: 'waste',
        location: {
            type: 'Point',
            coordinates: [77.1855, 28.6292],
            address: 'Patel Nagar, New Delhi'
        },
        status: 'pending',
        priority: 7
    },
    {
        title: 'Broken footpath tiles',
        description: 'Several tiles on the footpath are broken creating a tripping hazard for pedestrians, especially elderly.',
        category: 'road',
        location: {
            type: 'Point',
            coordinates: [77.2250, 28.6100],
            address: 'India Gate, New Delhi'
        },
        status: 'resolved',
        priority: 5
    },
    {
        title: 'Open manhole without cover',
        description: 'URGENT: An open manhole on the main road is extremely dangerous. A child almost fell in yesterday.',
        category: 'safety',
        location: {
            type: 'Point',
            coordinates: [77.2400, 28.6200],
            address: 'Laxmi Nagar, New Delhi'
        },
        status: 'in-progress',
        priority: 10,
        assignedDepartment: 'Public Works'
    },
    {
        title: 'Electricity transformer sparking',
        description: 'The transformer near the park is making loud noises and sparking at night. Very dangerous.',
        category: 'electricity',
        location: {
            type: 'Point',
            coordinates: [77.2000, 28.6400],
            address: 'Rohini, New Delhi'
        },
        status: 'pending',
        priority: 9
    },
    {
        title: 'Sewage overflow on road',
        description: 'Sewage is overflowing onto the main road. Very bad smell and health hazard for residents.',
        category: 'water',
        location: {
            type: 'Point',
            coordinates: [77.2500, 28.5800],
            address: 'Saket, New Delhi'
        },
        status: 'verified',
        priority: 8
    }
];

async function seed() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Issue.deleteMany({});

        // Create users
        console.log('👥 Creating users...');
        const createdUsers = [];
        for (const userData of sampleUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            const user = await User.create({
                ...userData,
                password: hashedPassword
            });
            createdUsers.push(user);
        }
        console.log(`✅ Created ${createdUsers.length} users`);

        // Create issues
        console.log('📋 Creating issues...');
        const citizenUsers = createdUsers.filter(u => u.role === 'citizen');
        const createdIssues = [];

        for (let i = 0; i < sampleIssues.length; i++) {
            const issueData = sampleIssues[i];
            const reporter = citizenUsers[i % citizenUsers.length];

            const issue = await Issue.create({
                ...issueData,
                reporter: reporter._id,
                upvotes: citizenUsers.slice(0, Math.floor(Math.random() * 3) + 1).map(u => ({ user: u._id })),
                verifications: citizenUsers.slice(0, Math.floor(Math.random() * 2) + 1).map(u => ({
                    user: u._id,
                    verified: true
                }))
            });
            createdIssues.push(issue);
        }
        console.log(`✅ Created ${createdIssues.length} issues`);

        console.log('\n🎉 Seeding complete!\n');
        console.log('Demo Accounts:');
        console.log('  Citizen:   citizen@demo.com / demo123');
        console.log('  Authority: authority@demo.com / demo123');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
