import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Camera, MapPin, Send, X, Upload, AlertCircle,
    CheckCircle, Loader2, Image as ImageIcon
} from 'lucide-react';
import { issuesAPI } from '../services/api';

const CATEGORIES = [
    { id: 'road', label: 'Road & Infrastructure', icon: '🚧', color: 'bg-red-500' },
    { id: 'water', label: 'Water Supply', icon: '💧', color: 'bg-blue-500' },
    { id: 'electricity', label: 'Electricity', icon: '⚡', color: 'bg-yellow-500' },
    { id: 'safety', label: 'Public Safety', icon: '🛡️', color: 'bg-purple-500' },
    { id: 'waste', label: 'Waste Management', icon: '🗑️', color: 'bg-green-500' },
    { id: 'other', label: 'Other', icon: '📋', color: 'bg-gray-500' },
];

const ReportIssuePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        address: ''
    });
    const [images, setImages] = useState([]);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index) => {
        setImages(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const getLocation = useCallback(() => {
        setLocating(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });

                // Reverse geocoding (simplified)
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await response.json();
                    setFormData(prev => ({
                        ...prev,
                        address: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                    }));
                } catch {
                    setFormData(prev => ({
                        ...prev,
                        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                    }));
                }
                setLocating(false);
            },
            (err) => {
                setError('Unable to get your location. Please try again.');
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.category) {
            setError('Please select a category');
            return;
        }

        if (!location) {
            setError('Please add your location');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('address', formData.address);
            submitData.append('latitude', location.latitude);
            submitData.append('longitude', location.longitude);

            images.forEach(img => {
                submitData.append('images', img.file);
            });

            await issuesAPI.create(submitData);
            setSuccess(true);

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4"
                    >
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">Issue Reported!</h2>
                    <p className="text-gray-400">Thank you for making your city better. Redirecting...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container-custom">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Report an Issue</h1>
                            <p className="text-gray-400">Help improve your city by reporting civic problems</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-red-400 text-sm">{error}</p>
                                <button onClick={() => setError('')} className="ml-auto">
                                    <X className="w-4 h-4 text-red-400" />
                                </button>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Category Selection */}
                            <div className="glass-card p-6">
                                <label className="block text-sm font-medium text-gray-300 mb-4">
                                    Category *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                            className={`p-4 rounded-xl border transition-all text-left ${formData.category === cat.id
                                                ? 'bg-indigo-500/20 border-indigo-500'
                                                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                                }`}
                                        >
                                            <span className="text-2xl mb-2 block">{cat.icon}</span>
                                            <span className={`text-sm ${formData.category === cat.id ? 'text-white' : 'text-gray-400'}`}>
                                                {cat.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title & Description */}
                            <div className="glass-card p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Issue Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., Large pothole on Main Street"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="input-field resize-none"
                                        placeholder="Describe the issue in detail..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="glass-card p-6">
                                <label className="block text-sm font-medium text-gray-300 mb-4">
                                    Upload Images (max 5)
                                </label>

                                <div className="grid grid-cols-5 gap-3">
                                    {images.map((img, index) => (
                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                                            <img
                                                src={img.preview}
                                                alt={`Upload ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {images.length < 5 && (
                                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-600 hover:border-indigo-500 cursor-pointer flex flex-col items-center justify-center transition-colors">
                                            <Upload className="w-6 h-6 text-gray-500 mb-1" />
                                            <span className="text-xs text-gray-500">Add</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="glass-card p-6">
                                <label className="block text-sm font-medium text-gray-300 mb-4">
                                    Location *
                                </label>

                                <button
                                    type="button"
                                    onClick={getLocation}
                                    disabled={locating}
                                    className="w-full p-4 border border-dashed border-gray-600 rounded-xl hover:border-indigo-500 transition-colors flex items-center justify-center gap-2 mb-4"
                                >
                                    {locating ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                                    ) : (
                                        <MapPin className="w-5 h-5 text-indigo-400" />
                                    )}
                                    <span>{locating ? 'Getting location...' : location ? 'Update Location' : 'Get Current Location'}</span>
                                </button>

                                {location && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-green-400 font-medium">Location captured</p>
                                                <p className="text-xs text-gray-400 mt-1">{formData.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Report
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ReportIssuePage;
