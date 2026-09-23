import React, { useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Compass, Home, LogOut, MessageSquare, Search, Settings, ShieldCheck, ShoppingBag, User, UserPlus, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "../../services/api";
import { useAuthStore } from "../../store";
import { Avatar } from "../ui/Avatar";
import { InviteModal } from "../ui/InviteModal";
import { isAdminEmail } from "../../config/admins";

const mainNav = [
  { icon: Home, label: "GoUnion", sub: "My Campus", path: "/" },
  { icon: Compass, label: "Konnect", sub: "Beyond Campus", path: "/konnect" },
  { icon: MessageSquare, label: "Messages", path: "/messages", badge: "messages" },
  { icon: Bell, label: "Signals", path: "/notifications", badge: "notifications" },
];

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const isAdmin = user?.role === "admin" || user?.role === "moderator" || isAdminEmail(user?.email);

  const { data: unreadData } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: api.notifications.getUnreadCount,
  });
  const { data: chatsData } = useQuery({
    queryKey: ["chats"],
    queryFn: api.chats.getAll,
    enabled: !!user,
    staleTime: 30000,
  });

  const unreadCount = unreadData?.count || 0;
  const unreadChatsCount = chatsData?.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0) || 0;
  const badgeValue = (type) => type === "messages" ? unreadChatsCount : type === "notifications" ? unreadCount : 0;

  const handleNavClick = (path) => {
    if (location.pathname === "/" && path === "/") window.dispatchEvent(new Event("gounion-refresh-feed"));
    if (location.pathname === "/konnect" && path === "/konnect") window.dispatchEvent(new Event("gounion-refresh-goto"));
  };

  return (
    <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45 }} className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-white/10 bg-[rgba(4,5,6,0.78)] backdrop-blur-2xl md:flex">
      <div className="p-5">
        <Link to="/" className="flex items-center gap-3 mb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-black text-black">R</span>
          <span>
            
          </span>
        </Link>
        
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-4">
        <p className="rc-label mb-3 px-2">Network</p>
        {mainNav.map((item) => {
          const count = badgeValue(item.badge);
          return (
            <NavLink key={item.path} to={item.path} onClick={() => handleNavClick(item.path)} className={({ isActive }) => `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${isActive ? (item.label === 'GoUnion' ? 'border-[rgba(199,249,79,0.28)] bg-[var(--rc-go-soft)] text-white' : 'border-white/10 bg-white/10 text-white') : "border-transparent text-white/58 hover:bg-white/[0.045] hover:text-white"}`}>
              <item.icon className={`h-5 w-5 ${location.pathname === item.path && item.label === 'GoUnion' ? 'text-[var(--rc-go)]' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{item.label}</span>
                  {item.sub && <span className="text-[10px] uppercase tracking-wider text-white/40">{item.sub}</span>}
                </div>
              </div>
              {count > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">{count > 99 ? "99+" : count}</span>}
            </NavLink>
          );
        })}

        <NavLink to="/groups" className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${isActive ? "border-white/10 bg-white/10 text-white" : "border-transparent text-white/58 hover:bg-white/[0.045] hover:text-white"}`}>
          <Users className="h-5 w-5" />
          <span>Circles</span>
        </NavLink>

        <div className="mt-6">
          <p className="rc-label mb-3 px-2">Products</p>
          <NavLink to="/teaky" className={({ isActive }) => `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${isActive ? "border-[rgba(104,212,255,0.32)] bg-[var(--rc-teaky-soft)] text-white" : "border-transparent text-white/58 hover:bg-white/[0.045] hover:text-white"}`}>
            <ShoppingBag className={`h-5 w-5 ${location.pathname === '/teaky' ? 'text-[var(--rc-teaky)]' : ''}`} />
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <span className="font-bold">Teaky</span>
              <span className="rounded-full border border-[rgba(104,212,255,0.24)] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[var(--rc-teaky)]">Soon</span>
            </div>
          </NavLink>
        </div>
        <NavLink to={user?.username ? `/profile/${user.username}` : "/"} className={({ isActive }) => `flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${isActive ? "border-white/10 bg-white/10 text-white" : "border-transparent text-white/58 hover:bg-white/[0.045] hover:text-white"}`}>
          <User className="h-5 w-5" /> Profile
        </NavLink>
        <button onClick={() => setIsInviteOpen(true)} className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-white/58 transition hover:bg-white/[0.045] hover:text-white">
          <UserPlus className="h-5 w-5" /> Invite
        </button>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${isActive ? "border-emerald-400/20 bg-emerald-400/12 text-emerald-300" : "border-transparent text-emerald-300/70 hover:bg-emerald-400/10 hover:text-emerald-300"}`}>
            <ShieldCheck className="h-5 w-5" /> Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatarUrl} label={user?.fullName} alt="Profile" className="h-11 w-11 rounded-xl border border-white/10 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{user?.fullName || "Student"}</p>
              <p className="truncate text-xs text-white/42">{user?.university || "Choose your campus"}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <Link to="/settings" className="rounded-lg p-2 text-white/45 hover:bg-white/5 hover:text-white"><Settings className="h-4 w-4" /></Link>
            <button onClick={() => { logout(); navigate("/login"); }} className="rounded-lg p-2 text-white/45 hover:bg-red-500/10 hover:text-red-300"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} username={user?.username} />
    </motion.aside>
  );
};
