import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { issuesAPI } from '../services/api';
import { Filter, RefreshCw, MapPin, Eye, ThumbsUp, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const CATEGORY_COLORS = {
    road: '#ef4444',
    water: '#3b82f6',
    electricity: '#f59e0b',
    safety: '#8b5cf6',
    waste: '#22c55e',
    other: '#6b7280'
};

const CATEGORY_ICONS = {
    road: '🚧',
    water: '💧',
    electricity: '⚡',
    safety: '🛡️',
    waste: '🗑️',
    other: '📋'
};

const STATUS_STYLES = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
    verified: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Verified' },
    'in-progress': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', label: 'In Progress' },
    resolved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Resolved' }
};

// Custom marker icon creator
const createCustomIcon = (category) => {
    const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
    return divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">
          ${CATEGORY_ICONS[category] || '📍'}
        </span>
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

// Map center controller
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 13);
        }
    }, [center, map]);
    return null;
};

const MapViewPage = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [mapCenter, setMapCenter] = useState([28.6139, 77.209]); // Default: Delhi
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchIssues();
        getUserLocation();
    }, []);

    const fetchIssues = async () => {
        try {
            const response = await issuesAPI.getAll({ limit: 100 });
            setIssues(response.data.issues || []);
        } catch (error) {
            console.error('Failed to fetch issues:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                },
                () => {
                    console.log('Location access denied');
                }
            );
        }
    };

    const filteredIssues = issues.filter(issue => {
        if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
        if (selectedStatus !== 'all' && issue.status !== selectedStatus) return false;
        return issue.location?.coordinates?.length >= 2;
    });

    return (
        <div className="min-h-screen pt-16">
            {/* Filter Bar */}
            <div className="fixed top-16 left-0 right-0 z-40 glass-card border-b border-indigo-500/20">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold hidden md:block">Issue Map</h1>
                            <span className="text-sm text-gray-400">
                                {filteredIssues.length} issues found
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400'
                                    }`}
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                            <button
                                onClick={fetchIssues}
                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-4 pb-2"
                        >
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="road">🚧 Road</option>
                                        <option value="water">💧 Water</option>
                                        <option value="electricity">⚡ Electricity</option>
                                        <option value="safety">🛡️ Safety</option>
                                        <option value="waste">🗑️ Waste</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Status</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="verified">Verified</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div className={`w-full ${showFilters ? 'h-[calc(100vh-140px)] mt-[124px]' : 'h-[calc(100vh-100px)] mt-[84px]'}`}>
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        className="w-full h-full"
                        style={{ background: '#1a1a2e' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        <MapController center={mapCenter} />

                        {filteredIssues.map((issue) => (
                            <Marker
                                key={issue._id}
                                position={[
                                    issue.location.coordinates[1],
                                    issue.location.coordinates[0]
                                ]}
                                icon={createCustomIcon(issue.category)}
                            >
                                <Popup className="custom-popup">
                                    <div className="min-w-[200px] p-1">
                                        <div className="flex items-start gap-2 mb-2">
                                            <span className="text-xl">{CATEGORY_ICONS[issue.category]}</span>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                                                <p className="text-xs text-gray-600 line-clamp-2">{issue.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[issue.status]?.bg
                                                } ${STATUS_STYLES[issue.status]?.text}`}
                                                style={{ background: 'rgba(0,0,0,0.1)' }}
                                            >
                                                {STATUS_STYLES[issue.status]?.label}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <ThumbsUp className="w-3 h-3" />
                                                {issue.upvotes?.length || 0}
                                            </span>
                                        </div>

                                        <Link
                                            to={`/issue/${issue._id}`}
                                            className="block w-full text-center bg-indigo-500 text-white text-sm py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            {/* Legend */}
            <div className="fixed bottom-4 left-4 glass-card p-4 z-40">
                <h4 className="text-xs text-gray-400 mb-2">Categories</h4>
                <div className="space-y-1">
                    {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => (
                        <div key={cat} className="flex items-center gap-2 text-xs">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: CATEGORY_COLORS[cat] }}
                            />
                            <span>{icon} {cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MapViewPage;
