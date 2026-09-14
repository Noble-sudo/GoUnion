import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Send, AlertCircle } from 'lucide-react';
export const VoiceRecorder = ({ onSend, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const streamRef = useRef(null);
    const samplesRef = useRef([]);
    const timerRef = useRef(null);
    const pendingSendRef = useRef(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        // Start recording immediately when component mounts
        startRecording();
        return () => {
            if (timerRef.current)
                clearInterval(timerRef.current);
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
                    channelCount: 1,
                },
            });
            streamRef.current = stream;
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(8192, 1, 1);
            audioContextRef.current = audioContext;
            processorRef.current = processor;
            samplesRef.current = [];
            source.connect(processor);
            const silentOutput = audioContext.createGain();
            silentOutput.gain.value = 0;
            processor.connect(silentOutput);
            silentOutput.connect(audioContext.destination);
            processor.onaudioprocess = (event) => {
                samplesRef.current.push(new Float32Array(event.inputBuffer.getChannelData(0)));
            };
            setIsRecording(true);
            timerRef.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        }
        catch (err) {
            console.error('Error accessing microphone:', err);
            setError(err?.name === 'NotAllowedError'
                ? 'Microphone permission was denied.'
                : 'Microphone recording is unavailable in this browser.');
        }
    };
    const stopRecording = () => {
        if (!isRecording && !audioContextRef.current) return;
        const sampleCount = samplesRef.current.reduce((total, sample) => total + sample.length, 0);
        const merged = new Float32Array(sampleCount);
        let offset = 0;
        for (const sample of samplesRef.current) {
            merged.set(sample, offset);
            offset += sample.length;
        }
        const sampleRate = audioContextRef.current?.sampleRate || 44100;
        const buffer = new ArrayBuffer(44 + merged.length * 2);
        const view = new DataView(buffer);
        const write = (position, value) => [...value].forEach((char, index) => view.setUint8(position + index, char.charCodeAt(0)));
        write(0, 'RIFF'); view.setUint32(4, 36 + merged.length * 2, true); write(8, 'WAVE'); write(12, 'fmt ');
        view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
        write(36, 'data'); view.setUint32(40, merged.length * 2, true);
        for (let index = 0; index < merged.length; index += 1) {
            const sample = Math.max(-1, Math.min(1, merged[index]));
            view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        }
        const blob = new Blob([buffer], { type: 'audio/wav' });
        setAudioBlob(blob);
        processorRef.current?.disconnect();
        audioContextRef.current?.close();
        audioContextRef.current = null;
        processorRef.current = null;
        mediaRecorderRef.current = null;
        streamTracksStop();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (pendingSendRef.current && blob.size > 0) {
            pendingSendRef.current = false;
            onSend(blob);
        }
    };
    const streamTracksStop = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    };
    const handleSend = () => {
        if (audioBlob) {
            onSend(audioBlob);
        }
        else if (isRecording) {
            pendingSendRef.current = true;
            stopRecording();
        }
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    return (_jsxs("div", { className: "flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 w-full animate-in fade-in slide-in-from-right-4 duration-300", children: [error ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "flex-1 items-center gap-2 text-red-300 text-xs font-medium", children: [_jsx(AlertCircle, { size: 16 }), error] }), _jsx("button", { onClick: onCancel, className: "p-2 text-white/50 hover:text-white transition-colors", children: _jsx(Trash2, { size: 18 }) })] })) : (isRecording ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-red-500 animate-pulse" }), _jsx("span", { className: "text-red-500 text-sm font-medium w-12", children: formatTime(duration) }), _jsx("div", { className: "flex-1" }), _jsx("button", { onClick: onCancel, className: "p-2 text-white/50 hover:text-white transition-colors", children: _jsx(Trash2, { size: 18 }) }), _jsx("button", { onClick: handleSend, className: "p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg", children: _jsx(Send, { size: 16, className: "ml-0.5" }) })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-white text-sm font-medium w-12", children: formatTime(duration) }), _jsx("div", { className: "flex-1" }), _jsx("button", { onClick: onCancel, className: "p-2 text-white/50 hover:text-white transition-colors", children: _jsx(Trash2, { size: 18 }) }), _jsx("button", { onClick: () => audioBlob && onSend(audioBlob), className: "p-2 bg-primary rounded-full text-black hover:brightness-110 transition-colors shadow-lg", children: _jsx(Send, { size: 16, className: "ml-0.5" }) })] })))] }));
};
