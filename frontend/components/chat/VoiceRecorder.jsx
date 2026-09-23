import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Send, AlertCircle } from 'lucide-react';

export const VoiceRecorder = ({ onSend, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const pendingSendRef = useRef(false);

    useEffect(() => {
        startRecording();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopRecording();
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                
                if (pendingSendRef.current && blob.size > 0) {
                    pendingSendRef.current = false;
                    onSend(blob);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);

            timerRef.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError(err?.name === 'NotAllowedError'
                ? 'Microphone permission was denied.'
                : 'Microphone recording is unavailable in this browser.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        streamTracksStop();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const streamTracksStop = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    };

    const handleSend = () => {
        if (audioBlob) {
            onSend(audioBlob);
        } else if (isRecording) {
            pendingSendRef.current = true;
            stopRecording();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 w-full animate-in fade-in slide-in-from-right-4 duration-300">
            {error ? (
                <>
                    <span className="flex-1 flex items-center gap-2 text-red-300 text-xs font-medium">
                        <AlertCircle size={16} />
                        {error}
                    </span>
                    <button onClick={onCancel} className="p-2 text-white/50 hover:text-white transition-colors">
                        <Trash2 size={18} />
                    </button>
                </>
            ) : isRecording ? (
                <>
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-500 text-sm font-medium w-12">{formatTime(duration)}</span>
                    <div className="flex-1" />
                    <button onClick={onCancel} className="p-2 text-white/50 hover:text-white transition-colors">
                        <Trash2 size={18} />
                    </button>
                    <button onClick={handleSend} className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg">
                        <Send size={16} className="ml-0.5" />
                    </button>
                </>
            ) : (
                <>
                    <span className="text-white text-sm font-medium w-12">{formatTime(duration)}</span>
                    <div className="flex-1" />
                    <button onClick={onCancel} className="p-2 text-white/50 hover:text-white transition-colors">
                        <Trash2 size={18} />
                    </button>
                    <button onClick={() => audioBlob && onSend(audioBlob)} className="p-2 bg-primary rounded-full text-black hover:brightness-110 transition-colors shadow-lg">
                        <Send size={16} className="ml-0.5" />
                    </button>
                </>
            )}
        </div>
    );
};
