import React, { useState, useRef } from "react";
import { Camera, Image as ImageIcon, X, MapPin, Smile, Keyboard } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useAuthStore } from "../../store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useToast } from "../ui/Toast";
import { CameraModal } from "../chat/CameraModal";
import { motion, AnimatePresence } from "framer-motion";

export const CreatePost = ({ profileUsername, groupId }) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data) => api.posts.createFeedPost(data),
    onSuccess: () => {
      const ownerUsername = profileUsername || user?.username;
      if (ownerUsername) {
        queryClient.invalidateQueries({ queryKey: ["profile-posts", ownerUsername] });
      }
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      }
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      handleRemoveFile();
      setContent("");
      setIsFocused(false);
      toast("Posted successfully", "success");
    },
    onError: (error) => {
      toast(error?.message || error?.response?.data?.detail || "Unable to create post", "error");
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        const videoElement = document.createElement("video");
        videoElement.preload = "metadata";
        videoElement.onloadedmetadata = () => {
          window.URL.revokeObjectURL(url);
          if (videoElement.duration > 1800) {
            toast.error("Feed videos must be 30 minutes or less");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        };
        videoElement.src = url;
      } else {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleEmojiClick = (emojiObj) => { setContent(prev => prev + emojiObj.emoji); };
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;
    mutation.mutate({ caption: content, image: selectedFile, group_id: groupId });
  };

  return (
    <div className={`rounded-2xl border transition-colors duration-300 ${isFocused ? 'border-blue-500/30 bg-blue-500/[0.02]' : 'border-white/5 bg-white/[0.02] hover:border-white/10'} p-4`}>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <img 
          src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random`} 
          alt="Profile" 
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-white/10 object-cover mt-1 shrink-0" 
        />
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => { setIsFocused(true); setIsEmojiPickerOpen(false); }}
            placeholder="What's happening on campus?"
            className={`w-full resize-none border-none bg-transparent text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-0 transition-all ${isFocused || content.trim() || selectedFile ? 'min-h-[80px]' : 'min-h-[40px]'}`}
          />
          
          <AnimatePresence>
            {previewUrl && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative mt-3 overflow-hidden rounded-xl border border-white/10">
                {selectedFile?.type.startsWith("image/") ? (
                  <img src={previewUrl} alt="Preview" className="h-auto max-h-96 w-full object-cover" />
                ) : (
                  <video src={previewUrl} className="h-auto max-h-96 w-full object-cover" controls />
                )}
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-md transition-colors hover:bg-black/80"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(isFocused || content.trim() || selectedFile) && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex gap-1">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
                  <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" capture="environment" />
                  
                  <button type="button" onClick={() => { if (!isEmojiPickerOpen) document.activeElement?.blur(); setIsEmojiPickerOpen(!isEmojiPickerOpen); }} className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white" title="Emoji">
                      {isEmojiPickerOpen ? <Keyboard className="h-5 w-5 text-blue-400" /> : <Smile className="h-5 w-5" />}
                    </button>
                    <button type="button" onClick={() => setShowCamera(true)} className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white" title="Camera">
                    <Camera className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full p-2 text-blue-400/70 transition-colors hover:bg-blue-400/20 hover:text-blue-400" title="Photo/Video">
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <button type="button" className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white" title="Tag Location">
                    <MapPin className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={(!content.trim() && !selectedFile) || mutation.isPending}
                  className="rounded-full bg-blue-500 px-5 py-1.5 text-sm font-bold text-white transition-all hover:bg-blue-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {mutation.isPending ? "Posting..." : "Post"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
      {isEmojiPickerOpen && (
        <div className="w-full overflow-hidden flex justify-center border-t border-white/5 pt-2 mt-2 animate-in slide-in-from-bottom duration-200">
          <EmojiPicker theme={Theme.DARK} onEmojiClick={handleEmojiClick} lazyLoadEmojis={true} style={{ width: '100%', height: '350px', border: 'none', background: 'transparent' }} />
        </div>
      )}
      {showCamera && <CameraModal onClose={() => setShowCamera(false)} onCapture={(file) => { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setShowCamera(false); }} />}
    </div>
  );
};
