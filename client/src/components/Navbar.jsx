import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    Shield, Menu, X, MapPin, FileText, BarChart3,
    LogOut, User, Award, Bell
} from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { to: '/map', label: 'Map View', icon: MapPin },
        { to: '/report', label: 'Report Issue', icon: FileText, protected: true },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-indigo-500/20">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Shield className="w-8 h-8 text-indigo-500" />
                        </motion.div>
                        <span className="text-xl font-bold gradient-text">iCivic Guardian</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            (!link.protected || isAuthenticated) && (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            )
                        ))}

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                {user?.role === 'authority' || user?.role === 'admin' ? (
                                    <Link
                                        to="/authority"
                                        className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        Authority Panel
                                    </Link>
                                ) : null}

                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Dashboard
                                </Link>

                                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 rounded-full">
                                    <Award className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm font-medium">{user?.civicPoints || 0} pts</span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-300"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass-card border-t border-indigo-500/20"
                    >
                        <div className="px-4 py-4 space-y-3">
                            {navLinks.map((link) => (
                                (!link.protected || isAuthenticated) && (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="flex items-center gap-2 text-gray-300 hover:text-white p-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                )
                            ))}

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center gap-2 text-gray-300 hover:text-white p-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <User className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-2 text-red-400 p-2 w-full"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="pt-3 border-t border-gray-700 space-y-2">
                                    <Link
                                        to="/login"
                                        className="block text-center text-gray-300 hover:text-white p-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block text-center btn-primary p-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
