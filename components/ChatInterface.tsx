import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { PortalMode, ChatMessage, GroundingChunk } from '../types';
import { SendIcon, LocateIcon, LoaderIcon } from './ui/Icons';
import { useGeoLocation } from '../hooks/useGeoLocation';

interface ChatInterfaceProps {
  mode: PortalMode;
  apiKey: string;
}

export default function ChatInterface({ mode, apiKey }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { location } = useGeoLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      let model = 'gemini-2.5-flash';
      let config: any = {};
      
      if (mode === PortalMode.MAPS) {
        model = 'gemini-2.5-flash';
        config.tools = [{ googleMaps: {} }];
        if (location) {
          config.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: location.latitude,
                longitude: location.longitude
              }
            }
          };
        }
      } else if (mode === PortalMode.THINK) {
        model = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 2048 };
      }

      const responseStream = await ai.models.generateContentStream({
        model,
        contents: userMsg.text,
        config
      });

      let responseText = '';
      let groundingChunks: GroundingChunk[] = [];
      const modelMsgId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, {
        id: modelMsgId,
        role: 'model',
        text: '',
        isThinking: mode === PortalMode.THINK
      }]);

      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          responseText += c.text;
        }
        
        // Collect grounding metadata if available
        if (c.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          groundingChunks = c.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
        }

        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, text: responseText, groundingChunks, isThinking: false } 
            : msg
        ));
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Maaf, saya mengalami kendala saat memproses permintaan Anda."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGrounding = (chunks?: GroundingChunk[]) => {
    if (!chunks || chunks.length === 0) return null;

    return (
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 gap-2">
        {chunks.map((chunk, i) => {
           if (chunk.maps) {
             return (
               <a 
                key={i} 
                href={chunk.maps.uri} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm group"
               >
                 <div className="bg-white p-2 rounded-md shrink-0 border border-slate-200 group-hover:border-emerald-500">
                   <LocateIcon className="w-5 h-5 text-emerald-800" />
                 </div>
                 <div>
                   <div className="font-bold text-slate-800 text-sm">{chunk.maps.title}</div>
                   {chunk.maps.placeAnswerSources?.map((source, j) => (
                     source.reviewSnippets?.map((snippet, k) => (
                        <div key={`${j}-${k}`} className="text-xs text-slate-500 mt-1 italic">"{snippet.text}"</div>
                     ))
                   ))}
                 </div>
               </a>
             );
           }
           if (chunk.web) {
             return (
               <a 
                key={i} 
                href={chunk.web.uri} 
                target="_blank" 
                rel="noreferrer"
                className="block text-xs text-emerald-700 font-medium hover:underline truncate bg-emerald-50 px-2 py-1 rounded"
               >
                 🔗 {chunk.web.title}
               </a>
             );
           }
           return null;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
            <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                {mode === PortalMode.MAPS ? <LocateIcon className="w-8 h-8 text-emerald-900"/> : <LoaderIcon className="w-8 h-8 text-emerald-900"/>}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
                {mode === PortalMode.MAPS ? "Asisten Lokasi Sekolah" : "Smart Tutor AI"}
            </h3>
            <p className="max-w-xs text-sm text-slate-500 leading-relaxed">
              {mode === PortalMode.MAPS ? "Informasi gedung, fasilitas, dan navigasi area sekolah." : "Bantuan akademik, penjelasan konsep, dan diskusi materi pelajaran."}
            </p>
            {mode === PortalMode.MAPS && location && (
              <span className="mt-4 text-[10px] uppercase font-bold bg-emerald-100 px-3 py-1 rounded-full text-emerald-800 flex items-center gap-1 tracking-wide">
                <LocateIcon className="w-3 h-3" /> Lokasi Aktif
              </span>
            )}
          </div>
        )}
        
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-900 text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
            }`}>
              {msg.isThinking ? (
                 <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                   <LoaderIcon className="w-4 h-4 animate-spin" /> Sedang menganalisa...
                 </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.text}</div>
              )}
              {renderGrounding(msg.groundingChunks)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === PortalMode.MAPS ? "Dimana lokasi perpustakaan?" : "Jelaskan konsep Termodinamika..."}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 placeholder-slate-400 shadow-inner transition-all"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-2.5 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}