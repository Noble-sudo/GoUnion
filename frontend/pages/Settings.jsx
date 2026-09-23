import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Bell, Lock, User, LogOut, ChevronLeft, ChevronRight, Save, Camera,
  Eye, EyeOff, MessageSquare, Heart, UserPlus, AtSign, Globe, Trash2, KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar } from '../components/ui/Avatar';
import { registerWebPushNotifications } from '../hooks/usePushNotifications';

/* ─── Toggle Switch ─── */
const Toggle = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-white/5 last:border-0">
    <div className="min-w-0">
      <p className="text-sm font-bold text-white">{label}</p>
      {description && <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-primary' : 'bg-white/10'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-200 ${enabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white/50'}`} />
    </button>
  </div>
);

/* ─── Section Card ─── */
const SectionCard = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-5 ${className}`}>
    {children}
  </div>
);

/* ─── Nav Item ─── */
const NavItem = ({ icon: Icon, label, description, onClick, danger = false }) => (
  <motion.button
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 group ${
      danger
        ? 'border-red-500/10 hover:border-red-500/30 bg-red-500/[0.03] hover:bg-red-500/[0.06]'
        : 'border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04]'
    }`}
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${
      danger
        ? 'bg-red-500/10 border-red-500/20 text-red-400'
        : 'bg-white/5 border-white/10 text-white/60 group-hover:bg-white/10 group-hover:text-white'
    }`}>
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className={`font-bold text-[15px] ${danger ? 'text-red-400' : 'text-white'}`}>{label}</h3>
      {description && <p className="text-xs text-white/35 mt-0.5">{description}</p>}
    </div>
    <ChevronRight size={18} className={`${danger ? 'text-red-400/40' : 'text-white/20'} group-hover:translate-x-0.5 transition-transform`} />
  </motion.button>
);

export const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(null);
  const fileInputRef = useRef(null);

  /* ─── Account Form State ─── */
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  /* ─── Settings Mutation ─── */
  const updateSettingsMutation = useMutation({
    mutationFn: (settings) => api.users.updateSettings(settings),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.setQueryData(['currentUser'], updatedUser);
    }
  });

  const getToggle = (key, fallback = true) => {
    if (user?.settings && user.settings[key] !== undefined) return user.settings[key];
    return fallback;
  };

  const setToggle = (key, value) => {
    // Optimistic UI update via store could be done here, but mutation works fast enough
    return updateSettingsMutation.mutateAsync({ [key]: value });
  };

  /* ─── Username Change Limit ─── */
  const lastUsernameChangeKey = `last_username_change_${user?.id}`;
  const lastUsernameChange = localStorage.getItem(lastUsernameChangeKey);
  let canChangeUsername = true;
  let daysUntilCanChange = 0;
  if (lastUsernameChange) {
    const daysSinceChange = (Date.now() - parseInt(lastUsernameChange, 10)) / (1000 * 60 * 60 * 24);
    if (daysSinceChange < 30) {
      canChangeUsername = false;
      daysUntilCanChange = Math.ceil(30 - daysSinceChange);
    }
  }

  /* ─── Save Profile Mutation ─── */
  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.profiles.update(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setAvatarFile(null);
      if (username !== user?.username) {
        localStorage.setItem(lastUsernameChangeKey, Date.now().toString());
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || '';
      if (msg.toLowerCase().includes('username')) {
        setUsernameError(msg);
      }
    },
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUsernameError('');
    updateProfileMutation.mutate({
      fullName,
      username: username !== user?.username ? username : undefined,
      bio,
      university,
      avatar: avatarFile,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  /* ─── Section Header (with back arrow) ─── */
  const SectionHeader = ({ title }) => (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={() => setActiveTab(null)} className="p-2 -ml-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
        <ChevronLeft size={22} />
      </button>
      <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
    </div>
  );

  /* ─── Tab Content ─── */
  const renderContent = () => {
    switch (activeTab) {

      /* ═══════════════════ ACCOUNT ═══════════════════ */
      case 'account':
        return (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-6">
            <SectionHeader title="Account" />
            <form onSubmit={handleSaveProfile} className="space-y-6">

              {/* Avatar */}
              <SectionCard>
                <div className="flex items-center gap-5">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar src={avatarPreview} alt={fullName} label={fullName} className="h-20 w-20 rounded-2xl object-cover bg-white/10 border border-white/10" />
                    <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera size={22} className="text-white" />
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{user?.fullName || 'Your Name'}</h3>
                    <p className="text-xs text-white/40 mt-0.5">@{user?.username}</p>
                    <p className="text-[11px] text-white/25 mt-1">Tap photo to change</p>
                  </div>
                </div>
              </SectionCard>

              {/* Fields */}
              <SectionCard className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-3.5 text-sm text-white outline-none focus:border-primary/30 transition-all font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setUsernameError(''); }}
                    disabled={!canChangeUsername}
                    className={`w-full bg-white/5 border border-white/5 rounded-xl p-3.5 text-sm text-white outline-none transition-all font-medium ${!canChangeUsername ? 'opacity-40 cursor-not-allowed' : 'focus:border-primary/30'}`}
                  />
                  {!canChangeUsername && <p className="text-[11px] text-amber-400/80 mt-1 ml-1">You can change your username again in {daysUntilCanChange} days.</p>}
                  {usernameError && <p className="text-[11px] text-red-400 mt-1 ml-1">{usernameError}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell people a little about yourself..." className="w-full bg-white/5 border border-white/5 rounded-xl p-3.5 text-sm text-white outline-none focus:border-primary/30 transition-all font-medium resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Institution</label>
                  <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3.5">
                    <div>
                      <p className="text-sm font-bold text-white">{user?.university || 'No campus selected'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {user?.verification_status === 'VERIFIED' ? (
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1"><Shield size={12} /> Verified</span>
                        ) : user?.verification_status === 'LEGACY_UNVERIFIED' ? (
                          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-wider">Legacy (Unverified)</span>
                        ) : (
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">Unverified</span>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => navigate('/onboarding')} className="text-[11px] font-bold text-black bg-white px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors">
                      Change Campus
                    </button>
                  </div>
                </div>
              </SectionCard>

              {/* Save */}
              <button type="submit" disabled={updateProfileMutation.isPending} className="w-full h-13 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50">
                {updateProfileMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : saveSuccess ? (
                  <span className="text-emerald-600 font-black">✓ Profile Updated</span>
                ) : (
                  <><Save size={16} /><span>Save Changes</span></>
                )}
              </button>
            </form>
          </motion.div>
        );

      /* ═══════════════════ PRIVACY ═══════════════════ */
      case 'privacy':
        return (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-6">
            <SectionHeader title="Privacy & Security" />

            <SectionCard>
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Profile Visibility</h4>
              <Toggle
                enabled={getToggle('private_account', false)}
                onChange={(v) => setToggle('private_account', v)}
                label="Private Profile"
                description="Only people who follow you can see your posts and activity."
              />
              <Toggle
                enabled={getToggle('show_online_status', true)}
                onChange={(v) => setToggle('show_online_status', v)}
                label="Show Online Status"
                description="Let others see when you're active on Reconnected."
              />
              <Toggle
                enabled={getToggle('show_last_seen', true)}
                onChange={(v) => setToggle('show_last_seen', v)}
                label="Show Last Seen"
                description="Allow others to see when you were last online."
              />
            </SectionCard>

            <SectionCard>
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Messaging</h4>
              <Toggle
                enabled={getToggle('read_receipts', true)}
                onChange={(v) => setToggle('read_receipts', v)}
                label="Read Receipts"
                description="Show senders when you've read their messages."
              />
              <Toggle
                enabled={getToggle('allow_messages_anyone', true)}
                onChange={(v) => setToggle('allow_messages_anyone', v)}
                label="Allow Messages from Anyone"
                description="When off, only people you follow can message you."
              />
            </SectionCard>

            <SectionCard>
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Content</h4>
              <Toggle
                enabled={getToggle('show_in_suggestions', true)}
                onChange={(v) => setToggle('show_in_suggestions', v)}
                label="Show in People Suggestions"
                description="Appear in the 'People You May Know' section for other students."
              />
            </SectionCard>
          </motion.div>
        );

      /* ═══════════════════ NOTIFICATIONS ═══════════════════ */
      case 'notifications':
        return (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-6">
            <SectionHeader title="Notifications" />

            <SectionCard>
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Push Notifications</h4>
              <Toggle
                enabled={getToggle('push_notifications', true)}
                onChange={async (v) => {
                  const updatedUser = await setToggle('push_notifications', v);
                  if (v) {
                    try {
                      await registerWebPushNotifications({ requestPermission: true });
                    } catch (error) {
                      console.error('Push registration failed:', error);
                    }
                  }
                  return updatedUser;
                }}
                label="Enable Push Notifications"
                description="Receive notifications even when the app is in the background."
              />
            </SectionCard>

            <SectionCard>
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Activity</h4>
              <Toggle
                enabled={getToggle('post_likes', true)}
                onChange={(v) => setToggle('post_likes', v)}
                label="Likes"
                description="When someone likes your post or comment."
              />
              <Toggle
                enabled={getToggle('post_comments', true)}
                onChange={(v) => setToggle('post_comments', v)}
                label="Comments"
                description="When someone comments on your post."
              />
              <Toggle
                enabled={getToggle('new_followers', true)}
                onChange={(v) => setToggle('new_followers', v)}
                label="New Followers"
                description="When someone follows your profile."
              />
              <Toggle
                enabled={getToggle('mentions', true)}
                onChange={(v) => setToggle('mentions', v)}
                label="Mentions"
                description="When someone mentions you in a post or comment."
              />
            </SectionCard>

            <SectionCard>
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Messages</h4>
              <Toggle
                enabled={getToggle('direct_messages', true)}
                onChange={(v) => setToggle('direct_messages', v)}
                label="Direct Messages"
                description="When someone sends you a new message."
              />
              <Toggle
                enabled={getToggle('notify_group_messages', true)}
                onChange={(v) => setToggle('notify_group_messages', v)}
                label="Circle Messages"
                description="When there's new activity in your circles."
              />
            </SectionCard>
          </motion.div>
        );

      /* ═══════════════════ DEFAULT (MENU) ═══════════════════ */
      default:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <NavItem icon={User} label="Account" description="Profile, username, bio, institution" onClick={() => setActiveTab('account')} />
            <NavItem icon={Shield} label="Privacy & Security" description="Visibility, read receipts, messaging" onClick={() => setActiveTab('privacy')} />
            <NavItem icon={Bell} label="Notifications" description="Push alerts, activity, messages" onClick={() => setActiveTab('notifications')} />
            <div className="pt-4" />
            <NavItem
              icon={LogOut}
              label="Sign Out"
              description="End your session on this device"
              danger
              onClick={() => { logout(); navigate('/login'); }}
            />
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full pb-24 pt-6 px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-sm text-white/35 mt-1 font-medium">Manage your account and preferences.</p>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <React.Fragment key={activeTab || 'menu'}>
          {renderContent()}
        </React.Fragment>
      </AnimatePresence>
    </div>
  );
};
