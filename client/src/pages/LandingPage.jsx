import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Shield, MapPin, Camera, BarChart3, Users, Award,
    ArrowRight, CheckCircle, Zap, Globe, TrendingUp, FileText
} from 'lucide-react';

const LandingPage = () => {
    const stats = [
        { value: '10K+', label: 'Issues Reported', icon: FileText },
        { value: '85%', label: 'Resolution Rate', icon: CheckCircle },
        { value: '50+', label: 'Cities', icon: Globe },
        { value: '24h', label: 'Avg Response', icon: Zap }
    ];

    const features = [
        {
            icon: Camera,
            title: 'AI-Powered Reporting',
            description: 'Upload images and let our AI automatically categorize and prioritize civic issues.',
            color: 'from-indigo-500 to-purple-500'
        },
        {
            icon: MapPin,
            title: 'Geo-Tagged Tracking',
            description: 'See issues in your area on an interactive map with real-time status updates.',
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: BarChart3,
            title: 'Predictive Analytics',
            description: 'AI predicts problem hotspots before they escalate, enabling proactive governance.',
            color: 'from-orange-500 to-red-500'
        },
        {
            icon: Users,
            title: 'Community Verification',
            description: 'Citizens verify reports, building trust and ensuring authentic complaints.',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: Award,
            title: 'Civic Rewards',
            description: 'Earn points and badges for active participation in improving your city.',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            icon: TrendingUp,
            title: 'Real-time Dashboard',
            description: 'Authorities get live analytics, SLA monitoring, and department performance.',
            color: 'from-pink-500 to-rose-500'
        }
    ];

    return (
        <div className="pt-16 overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 container-custom text-center py-12 md:py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex justify-center mb-6">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="p-3 md:p-4 bg-indigo-500/20 rounded-2xl"
                            >
                                <Shield className="w-10 h-10 md:w-16 md:h-16 text-indigo-400" />
                            </motion.div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight px-2">
                            <span className="gradient-text">iCivic Guardian</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-300 mb-6 md:mb-8 px-4">
                            AI-Powered Digital Watchdog for Smart & Safe Cities
                        </p>
                        <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8 md:mb-10 px-4">
                            From reporting civic issues to predicting them — transform citizens
                            into guardians of their city.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 w-full">
                            <Link to="/register" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-primary flex items-center justify-center gap-2 text-base md:text-lg px-8 py-3 w-full sm:w-auto"
                                >
                                    Get Started <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                            <Link to="/map" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-secondary flex items-center justify-center gap-2 text-base md:text-lg px-8 py-3 w-full sm:w-auto"
                                >
                                    <MapPin className="w-5 h-5" /> Explore Map
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 md:mt-16 px-2"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                className="stats-card text-center p-4 md:p-6"
                            >
                                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-gray-400 text-xs sm:text-sm">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 md:py-20 bg-dark-card/30">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-10 md:mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-2">
                            Powered by <span className="gradient-text">AI Intelligence</span>
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
                            Next-generation civic technology combining machine learning,
                            real-time analytics, and community-driven verification.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glass-card p-6 group cursor-pointer h-full"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm md:text-base">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 md:py-20">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-card p-6 md:p-12 text-center glow-primary max-w-4xl mx-auto"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                            Ready to Transform Your City?
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-8">
                            Join thousands of citizens making their communities better, one report at a time.
                        </p>
                        <Link to="/register" className="inline-block w-full sm:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary text-base md:text-lg px-8 py-3 md:px-10 md:py-4 w-full sm:w-auto"
                            >
                                Start Reporting Now
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-gray-800 bg-dark-card/50">
                <div className="container-custom flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Shield className="w-6 h-6 text-indigo-500" />
                        <span className="font-semibold text-lg">iCivic Guardian</span>
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        © 2025 iCivic Guardian. Built with ❤️ for smarter cities.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
