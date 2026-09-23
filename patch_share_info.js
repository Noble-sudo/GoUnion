import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    'import { ArrowLeft, Camera, Check, CheckCheck, Image as ImageIcon, FileText, MessageSquarePlus, MoreVertical, Paperclip, Plus, Search, Send, UserPlus, X, Mic, Smile, Trash2, Reply, Share, Share2, Keyboard, Maximize2, Download, ExternalLink, User, BellOff, LogOut, Ban } from "lucide-react";',
    'import { ArrowLeft, Camera, Check, CheckCheck, Image as ImageIcon, FileText, MessageSquarePlus, MoreVertical, Paperclip, Plus, Search, Send, UserPlus, X, Mic, Smile, Trash2, Reply, Share, Share2, Keyboard, Maximize2, Download, ExternalLink, User, BellOff, LogOut, Ban, Info } from "lucide-react";'
);

const firstShareTarget = `{navigator.share && (
                                                                                    <button onClick={() => handleShare(msg, mine)} className="flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 rounded-lg w-full text-left">
                                                                                        <ExternalLink size={14} /> Share externally
                                                                                    </button>
                                                                                )}`;

const firstInfoReplacement = `{mine && (
                                                                                    <button onClick={() => { setMsgInfoModal(msg); setActiveMessageMenu(null); }} className="flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 rounded-lg w-full text-left">
                                                                                        <Info size={14} /> Message Info
                                                                                    </button>
                                                                                )}`;

const secondShareTarget = `{navigator.share && (
                                                                        <button onClick={() => handleShare(msg, mine)} className="hover:text-white transition-colors flex items-center gap-1" title="Share Externally">
                                                                            <ExternalLink size={12} /> <span className="hidden sm:inline">Share</span>
                                                                        </button>
                                                                    )}`;

const secondInfoReplacement = `{mine && (
                                                                        <button onClick={() => setMsgInfoModal(msg)} className="hover:text-white transition-colors flex items-center gap-1" title="Message Info">
                                                                            <Info size={12} /> <span className="hidden sm:inline">Info</span>
                                                                        </button>
                                                                    )}`;

c = c.replace(firstShareTarget, firstInfoReplacement);
c = c.replace(secondShareTarget, secondInfoReplacement);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Replaced Share with Info");
