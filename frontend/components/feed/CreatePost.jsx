import React, { useState, useRef } from "react";
import { Camera, Image as ImageIcon, X, MapPin, Smile, Keyboard, Music } from "lucide-react";
import { MusicPicker } from "./MusicPicker";
import { encodeTrack } from "../../utils/audius";
import EmojiPicker, { Theme } from "../ui/EmojiKeypad";
import { useAuthStore } from "../../store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useToast } from "../ui/Toast";
import { CameraModal } from "../chat/CameraModal";
import { motion, AnimatePresence } from "framer-motion";

export const CreatePost = ({ profileUsername, groupId, mediaOnly = false }) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [track, setTrack] = useState(null);
  const [showMusic, setShowMusic] = useState(false);
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
      setTrack(null);
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
    if (mediaOnly ? !selectedFile : (!content.trim() && !selectedFile)) return;
    mutation.mutate({ caption: track ? (content.trim() ? content.trim() + "\n" : "") + encodeTrack(track) : content, image: selectedFile, group_id: groupId });
  };

  return (
    <div className={`rounded-2xl border transition-colors duration-300 ${isFocused ? 'border-primary/30 bg-primary/[0.02]' : 'border-white/5 bg-white/[0.02] hover:border-white/10'} p-4`}>
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
            placeholder={mediaOnly ? "Share a photo or video from campus..." : "What's happening on campus?"}
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

          {track && (
            <div className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-3 pr-1.5">
              <Music size={14} className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-xs font-bold text-white/80">{track.title} - {track.artist}</span>
              <button type="button" onClick={() => setTrack(null)} className="rounded-full p-1.5 text-white/50 hover:bg-white/10" aria-label="Remove music"><X size={14} /></button>
            </div>
          )}

          <AnimatePresence>
            {(mediaOnly || isFocused || content.trim() || selectedFile) && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                <div className="flex min-w-0 gap-0">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
                  <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" capture="environment" />
                  
                  <button type="button" onClick={() => { if (!isEmojiPickerOpen) document.activeElement?.blur(); setIsEmojiPickerOpen(!isEmojiPickerOpen); }} className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white" title="Emoji">
                      {isEmojiPickerOpen ? <Keyboard className="h-5 w-5 text-primary" /> : <Smile className="h-5 w-5" />}
                    </button>
                    <button type="button" onClick={() => setShowCamera(true)} className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white" title="Camera">
                    <Camera className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full p-1.5 text-primary/70 transition-colors hover:bg-primary/20 hover:text-primary" title="Photo/Video">
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => { document.activeElement?.blur(); setShowMusic(true); }} className={"rounded-full p-1.5 transition-colors hover:bg-white/10 " + (track ? "text-primary" : "text-white/40 hover:text-white")} title="Music">
                    <Music className="h-5 w-5" />
                  </button>
                  <button type="button" className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white" title="Tag Location">
                    <MapPin className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={(mediaOnly ? !selectedFile : (!content.trim() && !selectedFile)) || mutation.isPending}
                  className="ml-auto shrink-0 whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-black transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
      {showMusic && <MusicPicker onClose={() => setShowMusic(false)} onPick={(t) => { setTrack(t); setShowMusic(false); }} />}
      {showCamera && <CameraModal onClose={() => setShowCamera(false)} onCapture={(file) => { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setShowCamera(false); }} />}
    </div>
  );
};
