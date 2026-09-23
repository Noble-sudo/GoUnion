import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Video, Send, Camera, Smile, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useToast } from "../ui/Toast";
import { CameraModal } from "../chat/CameraModal";
import EmojiPicker, { Theme } from "emoji-picker-react";

export const CreateStatusModal = ({ isOpen, onClose, onSuccess }) => {
  const [content, setContent] = useState("");
  const handleEmojiClick = (emojiObj) => setContent(prev => prev + emojiObj.emoji);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const createMutation = useMutation({
    mutationFn: api.stories.create,
    onSuccess: () => {
      toast("Story added", "success");
      setContent("");
      setImage(null);
      setPreview(null);
      onSuccess?.();
      onClose();
    },
    onError: () => toast("Failed to add story", "error"),
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    createMutation.mutate({ content, image });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm" />
          
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-[#141417] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-y-auto custom-scrollbar max-h-[90vh]">
            <div className="p-8 pb-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-white tracking-tighter">Add to Story</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 pt-4">
              <div className="mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-3xl group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mt-16 group-hover:bg-primary/10 transition-all" />
                

                <textarea onFocus={() => setIsEmojiPickerOpen(false)} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share an update" className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-700 resize-none h-32 font-medium relative z-10" />
                
                <div className="flex items-center justify-between mt-4 relative z-10 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4 text-zinc-500">
                    <button onClick={() => { if (!isEmojiPickerOpen) document.activeElement?.blur(); setIsEmojiPickerOpen(!isEmojiPickerOpen); }} className="flex items-center gap-2 hover:text-primary transition-colors">
                        {isEmojiPickerOpen ? <Keyboard size={20} className="text-primary" /> : <Smile size={20} />}
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Emoji</span>
                      </button>
                      
                      <button onClick={() => setShowCamera(true)} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Camera size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Camera</span>
                    </button>
                    
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <ImageIcon size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Gallery</span>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleImageChange} />
                    </button>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${content.length > 100 ? "text-primary" : "text-zinc-600"}`}>{content.length}/150</span>
                </div>
              </div>
              
              {preview && (
                <div className="mb-8 relative aspect-square max-h-48 rounded-2xl overflow-hidden border border-white/10">
                  {image?.type?.startsWith("video/") ? (
                    <video src={preview} className="w-full h-full object-cover" controls playsInline />
                  ) : (
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                  )}
                  <button onClick={() => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); setImage(null); setPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-all">
                    <X size={14} />
                  </button>
                </div>
              )}
              
              <button onClick={handleSubmit} disabled={(!content.trim() && !image) || createMutation.isPending} className="w-full h-14 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-primary/20">
                {createMutation.isPending ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Send size={18} />}
                <span>{createMutation.isPending ? "Posting..." : "Post Story"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {showCamera && (
        <CameraModal 
          onClose={() => setShowCamera(false)}
          onCapture={(file) => {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setShowCamera(false);
          }}
        />
      )}
    </AnimatePresence>
  );
};

