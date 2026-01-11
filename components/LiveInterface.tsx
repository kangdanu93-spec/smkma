import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decodeAudioData } from '../services/audio-utils';
import { MicIcon, StopIcon, VideoIcon } from './ui/Icons';

interface LiveInterfaceProps {
  apiKey: string;
}

export default function LiveInterface({ apiKey }: LiveInterfaceProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session Refs
  const sessionRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  const startSession = async () => {
    try {
      setError(null);
      const ai = new GoogleGenAI({ apiKey });
      
      // Initialize Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;

      // Setup Video Preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Connect to Live API
      sessionRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: 'You are a helpful multimodal assistant. You can see and hear the user.',
        },
        callbacks: {
          onopen: () => {
            console.log('Live session connected');
            setupAudioInput(stream);
            setupVideoInput();
            setIsActive(true);
          },
          onmessage: async (message: LiveServerMessage) => {
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && outputContextRef.current) {
               playAudioChunk(base64Audio);
             }
          },
          onclose: () => {
            console.log('Live session closed');
            setIsActive(false);
          },
          onerror: (err) => {
            console.error('Live session error:', err);
            setError('Connection error occurred.');
            stopSession();
          }
        }
      });

    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to start session');
    }
  };

  const setupAudioInput = (stream: MediaStream) => {
    if (!inputContextRef.current) return;
    
    const source = inputContextRef.current.createMediaStreamSource(stream);
    const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      
      if (sessionRef.current) {
        sessionRef.current.then(session => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      }
    };

    source.connect(processor);
    processor.connect(inputContextRef.current.destination);
    
    inputSourceRef.current = source;
    processorRef.current = processor;
  };

  const setupVideoInput = () => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    
    frameIntervalRef.current = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video && canvas && sessionRef.current) {
        canvas.width = video.videoWidth * 0.5; // Scale down for performance
        canvas.height = video.videoHeight * 0.5;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          
          sessionRef.current.then(session => {
            session.sendRealtimeInput({
              media: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            });
          });
        }
      }
    }, 1000); // 1 FPS for video stream to save bandwidth/processing
  };

  const playAudioChunk = async (base64Audio: string) => {
    if (!outputContextRef.current) return;
    
    const ctx = outputContextRef.current;
    const audioBuffer = await decodeAudioData(
      Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)),
      ctx,
      24000
    );

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    // Schedule playback
    const currentTime = ctx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
    
    source.onended = () => {
      audioSourcesRef.current.delete(source);
    };
    audioSourcesRef.current.add(source);
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.then(session => session.close());
      sessionRef.current = null;
    }
    
    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    // Stop audio nodes
    if (processorRef.current && inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      processorRef.current.disconnect();
    }
    
    // Stop playing audio
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    if (inputContextRef.current) inputContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();

    setIsActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 items-center justify-center space-y-8">
      {/* Video Container Frame */}
      <div className="relative w-full max-w-3xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20 border-4 border-white ring-1 ring-slate-200">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover transform scale-x-[-1]" 
          muted 
          playsInline 
        />
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
             <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
                <VideoIcon className="w-10 h-10 text-white/80" />
             </div>
            <p className="text-white font-medium text-lg drop-shadow-md tracking-wide">Kamera Non-Aktif</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        
        {isActive && (
          <div className="absolute top-6 right-6 flex space-x-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full animate-pulse shadow-lg ring-2 ring-white/20">
                <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
             </div>
          </div>
        )}
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border border-red-100 text-red-700 rounded-lg max-w-xl text-center shadow-sm text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex items-center gap-6">
        {!isActive ? (
          <button 
            onClick={startSession}
            className="group flex items-center gap-3 px-8 py-4 bg-emerald-900 hover:bg-emerald-800 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/20"
          >
            <VideoIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Mulai Konsultasi Live</span>
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="flex items-center gap-3 px-8 py-4 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <StopIcon className="w-5 h-5" />
            <span>Akhiri Sesi</span>
          </button>
        )}
      </div>
      
      <p className="text-slate-500 text-xs max-w-md text-center bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm">
        Didukung oleh <span className="font-bold text-slate-700">Gemini 2.5 Flash</span>. Tunjukkan objek atau dokumen ke kamera untuk analisa instan.
      </p>
    </div>
  );
}