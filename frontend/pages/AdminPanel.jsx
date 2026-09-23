import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Users, ShieldAlert, Building2, Radio, 
    Settings, LogOut, ChevronRight, Activity, Search, Scale, Shield
} from 'lucide-react';
import { useAuthStore } from '../store';
import { api } from '../services/api';

// Child components (to be implemented by subagents)
import OverviewDashboard from '../components/admin/OverviewDashboard';
import CampusManager from '../components/admin/CampusManager';
import UserDirectory from '../components/admin/UserDirectory';
import ModerationQueue from '../components/admin/ModerationQueue';
import BroadcastCenter from '../components/admin/BroadcastCenter';
import SuspensionAppeals from '../components/admin/SuspensionAppeals';
import { VerificationQueue } from '../components/admin/VerificationQueue';

export const AdminPanel = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Verify admin access
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.role !== 'admin' && user?.role !== 'moderator') {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center text-center px-4">
                <div className="max-w-md w-full">
                    <ShieldAlert size={64} className="mx-auto text-red-500 mb-6" />
                    <h1 className="text-3xl font-serif text-white mb-2">Access Denied</h1>
                    <p className="text-white/50 mb-8">You do not have the required clearance to access the Global Admin Panel.</p>
                    <a href="/" className="inline-block bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors">
                        Return to Campus
                    </a>
                </div>
            </div>
        );
    }

    const navigation = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'campuses', label: 'Campus Manager', icon: Building2 },
        { id: 'users', label: 'User Directory', icon: Users },
        { id: 'moderation', label: 'Moderation Queue', icon: ShieldAlert },
        { id: 'verifications', label: 'Identity Verifications', icon: Shield },
        { id: 'appeals', label: 'Appeals', icon: Scale },
        { id: 'broadcast', label: 'Broadcast Center', icon: Radio },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <OverviewDashboard />;
            case 'campuses': return <CampusManager />;
            case 'users': return <UserDirectory />;
            case 'moderation': return <ModerationQueue />;
            case 'verifications': return <VerificationQueue />;
            case 'appeals': return <SuspensionAppeals />;
            case 'broadcast': return <BroadcastCenter />;
            default: return <OverviewDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-[#030303] text-white flex flex-col md:flex-row font-sans selection:bg-primary/30">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-[#0a0a0c] border-r border-white/5 h-screen sticky top-0">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                            <ShieldAlert size={18} />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-sm tracking-wide">GOD MODE</h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Global Admin</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {navigation.map(nav => (
                            <button
                                key={nav.id}
                                onClick={() => setActiveTab(nav.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    activeTab === nav.id 
                                        ? 'bg-primary text-black shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' 
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <nav.icon size={18} />
                                {nav.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <img src={user?.avatarUrl} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                            <p className="text-xs text-white/40 truncate">@{user?.username}</p>
                        </div>
                    </div>
                    <a href="/" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-colors">
                        <LogOut size={14} /> Exit Admin
                    </a>
                </div>
            </aside>
            

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 bg-[#0a0a0c] border-b border-white/5 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                        <ShieldAlert size={14} />
                    </div>
                    <h1 className="font-bold text-white text-sm">GOD MODE</h1>
                </div>
                <select 
                    value={activeTab} 
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="bg-[#111114] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                >
                    {navigation.map(nav => (
                        <option key={nav.id} value={nav.id}>{nav.label}</option>
                    ))}
                </select>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto bg-[#030303] relative">
                {/* Subtle background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
