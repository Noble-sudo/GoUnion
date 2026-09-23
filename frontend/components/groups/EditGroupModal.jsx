import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";
import { api } from "../../services/api";
import { useToast } from "../ui/Toast";
import { useConfirm } from "../ui/ConfirmProvider";

export const EditGroupModal = ({ isOpen, onClose, group }) => {
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");
  const [privacy, setPrivacy] = useState(group?.privacy || "public");
  const [category, setCategory] = useState(group?.category || "Other");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(group?.cover_image || group?.imageUrl || "");
  const fileInputRef = useRef(null);
  
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: (data) => api.groups.update(group.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", group.id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast("Circle updated successfully", "success");
      onClose();
    },
    onError: (err) => toast(err.response?.data?.error || "Failed to update circle", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.groups.delete(group.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast("Circle deleted successfully", "success");
      onClose();
      window.location.href = '/groups';
    },
    onError: (err) => toast(err.response?.data?.error || "Failed to delete circle", "error")
  });

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({ name, description, privacy, category, file: coverFile });
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#030303] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="text-xl font-bold text-white">Edit Circle</h2>
          <button onClick={onClose} className="rounded-full p-2 text-white/50 hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Cover Image</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative h-32 w-full overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-white/40">
                    <ImageIcon size={24} className="mb-2" />
                    <span className="text-sm font-bold">Upload Cover</span>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-primary focus:outline-none" 
                required 
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-primary focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
              >
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Professional">Professional</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Privacy</label>
              <select 
                value={privacy} 
                onChange={e => setPrivacy(e.target.value)} 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none appearance-none"
              >
                <option value="public">Public (Anyone can join)</option>
                <option value="private">Private (Invite or Request only)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-white/10 mt-6">
            <button 
              type="button"
              disabled={deleteMutation?.isPending}
              onClick={() => {
                confirm({
                  title: "Delete Circle",
                  message: "Are you sure you want to completely delete this circle? This cannot be undone.",
                  isDanger: true,
                  confirmText: "Delete",
                }).then((yes) => {
                  if (yes) deleteMutation.mutate();
                });
              }}
              className="flex-1 rounded-xl bg-red-500/10 py-4 font-bold text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              {deleteMutation?.isPending ? "Deleting..." : "Delete Circle"}
            </button>
            
            <button 
              type="submit" 
              disabled={updateMutation.isPending} 
              className="flex-[2] rounded-xl bg-primary py-4 font-bold text-black hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
