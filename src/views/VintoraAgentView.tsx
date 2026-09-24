import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, Send, Bot, User as UserIcon, Play, Clock, 
  ThumbsUp, ChevronDown, ChevronUp, CheckCircle2, 
  Compass, Radio, Moon, Sun, Layers, ArrowRight, 
  Search, RefreshCw, Cpu, ShieldCheck, Zap, ImagePlus, 
  X, Download, ExternalLink, Image as ImageIcon,
  Sliders, Maximize2, Palette, Eye, UserCheck, Star, Copy, Check
} from 'lucide-react';
import { Video, ThemeMode, ViewTab, VintoraMessage, VintoraComplexityTier } from '../types';

interface VintoraAgentViewProps {
  onPlayVideo: (video: Video) => void;
  onNavigateTab: (tab: ViewTab) => void;
  theme: ThemeMode;
  onToggleTheme: (newTheme?: ThemeMode) => void;
  onAddToWatchLater: (video: Video) => void;
  onAddToLiked: (video: Video) => void;
  historyVideos: Video[];
  likedVideos: Video[];
  watchLaterVideos: Video[];
  subscriptionsCount: number;
}

const INITIAL_MESSAGES: VintoraMessage[] = [
  {
    id: 'v-init-1',
    sender: 'vintora',
    text: "Hey! I'm **Vintora Agent**, your personal companion inside FreeTube. I know everything about the app, can find specific video episodes across multiple channels, identify any character, celebrity, or episode thumbnail from an uploaded photo, and generate **2 to 4 high-definition reference image options** with customizable aspect ratios & resolutions.\n\nTry uploading a photo of any celebrity, or ask me to generate artwork!",
    timestamp: 'Just now',
    modelUsed: 'gemini-3.8-flash',
    complexityTier: 'General (Flash + Search)',
    thoughts: [
      {
        title: 'System Boot & Visual Engine Ready',
        detail: 'Initialized Vintora liquid glass environment with Multimodal Vision (Celebrity/Episode recognition), 2-4 Option Image Generator Studio, and Model Tiering.',
        durationMs: 70,
      },
      {
        title: 'Model Routing Active',
        detail: 'Lite for fast app controls, Flash 3.8 + Search for episode discovery & vision identification, and Nano Banana Image for Google AI image generation.',
        durationMs: 50,
      }
    ],
    suggestedPrompts: [
      'Generate 2 options of a cyberpunk neon city (16:9)',
      'Find Taarak Mehta Ep 1291 on different channels',
      'Generate 4 options of anime character portrait (3:4)',
      'Switch the app theme to OLED'
    ]
  }
];

export const VintoraAgentView: React.FC<VintoraAgentViewProps> = ({
  onPlayVideo,
  onNavigateTab,
  theme,
  onToggleTheme,
  onAddToWatchLater,
  onAddToLiked,
  historyVideos,
  likedVideos,
  watchLaterVideos,
  subscriptionsCount,
}) => {
  const [messages, setMessages] = useState<VintoraMessage[]>(() => {
    try {
      const saved = localStorage.getItem('freetube_vintora_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [isDragging, setIsDragging] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  // Image Studio options
  const [showImageStudio, setShowImageStudio] = useState(false);
  const [selectedAspect, setSelectedAspect] = useState<'16:9' | '1:1' | '9:16' | '4:3' | '3:4'>('16:9');
  const [selectedResolution, setSelectedResolution] = useState<'1K' | '2K' | '4K' | '512px'>('1K');
  const [selectedVariationCount, setSelectedVariationCount] = useState<number>(2);

  // Modal image preview state
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem('freetube_vintora_messages', JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, selectedImage, showImageStudio]);

  const toggleThought = (msgId: string) => {
    setExpandedThoughts(prev => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  // Image upload handler from file input
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) setSelectedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
      e.target.value = '';
    }
  };

  // Clipboard paste support for images
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  }, []);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    const imageToSend = selectedImage;
    const mimeToSend = selectedImageMime;

    if ((!query && !imageToSend) || isLoading) return;

    const userMessage: VintoraMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query || (imageToSend ? "Identify this person, celebrity, or episode scene" : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      uploadedImage: imageToSend || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/vintora/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          image: imageToSend || '',
          imageMimeType: mimeToSend,
          history: messages.slice(-8),
          imageConfig: {
            aspectRatio: selectedAspect,
            resolution: selectedResolution,
            variationCount: selectedVariationCount,
          },
          currentAppState: {
            theme,
            historyCount: historyVideos.length,
            likedCount: likedVideos.length,
            watchLaterCount: watchLaterVideos.length,
            subscriptionsCount,
          }
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      const vintoraMessage: VintoraMessage = {
        id: `vintora-${Date.now()}`,
        sender: 'vintora',
        text: data.text || "I've checked that for you!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || 'gemini-3.8-flash',
        complexityTier: data.complexityTier || 'General (Flash + Search)',
        thoughts: data.thoughts || [],
        videos: data.videos,
        channelMatches: data.channelMatches,
        actionExecuted: data.actionExecuted,
        generatedImages: data.generatedImages,
        imageConfig: data.imageConfig || {
          aspectRatio: selectedAspect,
          resolution: selectedResolution,
          variationCount: selectedVariationCount,
        },
        identifiedSubject: data.identifiedSubject,
        suggestedPrompts: data.suggestedPrompts,
      };

      // Automatically open thought process for this new message
      if (data.thoughts && data.thoughts.length > 0) {
        setExpandedThoughts(prev => ({ ...prev, [vintoraMessage.id]: true }));
      }

      setMessages(prev => [...prev, vintoraMessage]);

      // Execute in-app action if authorized by user
      if (data.actionExecuted) {
        const act = data.actionExecuted;
        if (act.type === 'SET_THEME' && act.payload?.theme) {
          onToggleTheme(act.payload.theme);
        } else if (act.type === 'NAVIGATE' && act.payload?.tab) {
          setTimeout(() => onNavigateTab(act.payload.tab), 800);
        } else if (act.type === 'PLAY_VIDEO' && act.payload?.video) {
          onPlayVideo(act.payload.video);
        } else if (act.type === 'ADD_WATCH_LATER' && act.payload?.video) {
          onAddToWatchLater(act.payload.video);
        } else if (act.type === 'ADD_LIKED' && act.payload?.video) {
          onAddToLiked(act.payload.video);
        }
      }

    } catch (err) {
      console.error('Failed to chat with Vintora:', err);
      const errorMessage: VintoraMessage = {
        id: `err-${Date.now()}`,
        sender: 'vintora',
        text: "I analyzed your request and ready to continue! Please let me know what you'd like to find, generate, or check.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash',
        complexityTier: 'General (Flash + Search)',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    try {
      localStorage.removeItem('freetube_vintora_messages');
    } catch {}
  };

  const handleCopyModalLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isLight = theme === 'light';

  return (
    <div 
      id="vintora-agent-view"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full max-w-4xl mx-auto px-3 sm:px-6 pt-2 pb-24 md:pb-6 flex flex-col h-[calc(100dvh-64px)] md:h-[calc(100vh-80px)] min-h-0 relative ${
        isDragging ? 'ring-2 ring-cyan-400 ring-dashed rounded-3xl' : ''
      }`}
    >
      {/* Hidden file input for image upload */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Drag overlay notice */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-cyan-300 pointer-events-none border-2 border-cyan-400 border-dashed">
          <ImagePlus size={48} className="animate-bounce mb-2 text-cyan-400" />
          <p className="text-base font-bold">Drop image to identify character, celebrity, or episode scene</p>
        </div>
      )}

      {/* Liquid Glass Header for Vintora Agent */}
      <div className={`p-3.5 sm:p-4 rounded-3xl border mb-3 flex items-center justify-between backdrop-blur-2xl transition-all duration-300 shadow-xl flex-shrink-0 ${
        isLight
          ? 'bg-gradient-to-r from-white/90 via-slate-50/90 to-sky-50/80 border-slate-200 text-slate-900 shadow-slate-200/50'
          : 'bg-gradient-to-r from-slate-900/80 via-indigo-950/50 to-slate-900/80 border-cyan-500/20 text-white shadow-cyan-950/30'
      }`}>
        <div className="flex items-center gap-3">
          {/* Animated Liquid Orb */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-[1.5px] shadow-lg shadow-cyan-500/20 flex-shrink-0 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <Sparkles size={18} className="text-cyan-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Vintora Agent
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wide bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30">
                Liquid Glass
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
              Celebrity & episode recognition, 2-4 reference image studio, cross-channel streams
            </p>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2">
          <button
            id="vintora-toggle-image-studio-btn"
            onClick={() => setShowImageStudio(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
              showImageStudio
                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 text-pink-300'
                : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-slate-300'
            }`}
            title="Toggle Image Generator Studio"
          >
            <Palette size={13} className={showImageStudio ? 'text-pink-400 animate-spin' : ''} />
            <span className="hidden sm:inline">Image Studio</span>
          </button>

          <button
            id="vintora-clear-chat-btn"
            onClick={handleClearHistory}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all text-xs flex items-center gap-1.5 active:scale-95"
            title="Reset Chat"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Expandable Image Studio Controls Panel */}
      {showImageStudio && (
        <div className="mb-3 p-3.5 sm:p-4 rounded-3xl bg-slate-900/90 border border-pink-500/30 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                <Sliders size={13} />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-pink-200">
                Image Generator & Reference Studio
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/30">
              Google AI Powered
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Aspect Ratio
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '16:9 (Landscape)', value: '16:9' },
                  { label: '1:1 (Square)', value: '1:1' },
                  { label: '9:16 (Story/Shorts)', value: '9:16' },
                  { label: '4:3 (Standard)', value: '4:3' },
                  { label: '3:4 (Portrait)', value: '3:4' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedAspect(item.value as any)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                      selectedAspect === item.value
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30 font-bold'
                        : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Resolution Quality
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '1K Standard', value: '1K' },
                  { label: '2K High-Res', value: '2K' },
                  { label: '4K Ultra HD', value: '4K' },
                  { label: '512px Draft', value: '512px' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedResolution(item.value as any)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                      selectedResolution === item.value
                        ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30 font-bold'
                        : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Image Options Count */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Reference Image Options
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '2 Options', value: 2 },
                  { label: '3 Options', value: 3 },
                  { label: '4 Options', value: 4 },
                  { label: '1 Image', value: 1 },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedVariationCount(item.value)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                      selectedVariationCount === item.value
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30 font-bold'
                        : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preset Inspirations */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex-shrink-0">
              Quick Presets:
            </span>
            {[
              'Generate 2 options of a cyberpunk neon city',
              'Generate 4 options of studio portrait character with dramatic rim lighting',
              'Generate 3 options of floating 3D isometric tech island',
              'Generate 2 options of scenic anime fantasy valley',
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(preset)}
                className="flex-shrink-0 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-slate-300 hover:text-white border border-white/[0.08] transition-all whitespace-nowrap active:scale-95"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Thread */}
      <div 
        id="vintora-messages-thread"
        className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-white/10 min-h-0"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isThoughtExpanded = expandedThoughts[msg.id];

          return (
            <div 
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              {/* Message Container */}
              <div className={`max-w-[95%] sm:max-w-[88%] rounded-3xl p-3.5 sm:p-4 shadow-xl backdrop-blur-xl border transition-all ${
                isUser
                  ? 'bg-gradient-to-tr from-red-600/90 to-rose-600/90 text-white border-red-400/30 rounded-tr-sm shadow-red-900/20'
                  : isLight
                    ? 'bg-white/95 text-slate-900 border-slate-200/80 rounded-tl-sm shadow-slate-200/60'
                    : 'bg-slate-900/90 text-slate-100 border-white/[0.12] rounded-tl-sm shadow-black/40'
              }`}>
                {/* Header for Agent messages (Model & Complexity Pill) */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-white/[0.08] text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Bot size={12} />
                      </div>
                      <span className="font-semibold text-slate-200">Vintora</span>
                      {msg.complexityTier && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                          msg.complexityTier.includes('Pro')
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : msg.complexityTier.includes('Flash')
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {msg.complexityTier}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {msg.modelUsed || 'gemini-3.8-flash'}
                    </span>
                  </div>
                )}

                {/* Uploaded User Image inside user message */}
                {isUser && msg.uploadedImage && (
                  <div className="mb-2.5 rounded-2xl overflow-hidden border border-white/20 shadow-md max-w-xs">
                    <img 
                      src={msg.uploadedImage} 
                      alt="Uploaded query" 
                      className="w-full max-h-52 object-contain bg-black/40 cursor-pointer hover:opacity-95"
                      onClick={() => setPreviewModalImage(msg.uploadedImage!)}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Google AI Studio Style Thought Process Dropdown */}
                {!isUser && msg.thoughts && msg.thoughts.length > 0 && (
                  <div className="mb-3">
                    <button
                      id={`vintora-thought-toggle-${msg.id}`}
                      onClick={() => toggleThought(msg.id)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/25 text-cyan-300 text-xs font-medium transition-all group select-none"
                    >
                      <div className="flex items-center gap-2">
                        <Zap size={13} className="text-cyan-400 animate-pulse" />
                        <span>Thought Process</span>
                        <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                          {msg.thoughts.length} steps
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-cyan-400/80 group-hover:text-cyan-200">
                        <span>{isThoughtExpanded ? 'Hide' : 'Inspect'}</span>
                        {isThoughtExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </button>

                    {/* Expandable Thinking Steps */}
                    {isThoughtExpanded && (
                      <div className="mt-2 p-3 rounded-2xl bg-black/40 border border-cyan-500/20 space-y-2 text-xs font-sans animate-in fade-in slide-in-from-top-1 duration-150">
                        {msg.thoughts.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px] font-mono text-cyan-300 flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-cyan-200 text-[11px]">{step.title}</p>
                              <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">{step.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Identified Celebrity / Subject Spotlight Card */}
                {!isUser && msg.identifiedSubject && (
                  <div className="mb-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/30 text-xs space-y-2 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                          <Star size={13} />
                        </div>
                        <span className="font-bold text-amber-200 text-sm">
                          {msg.identifiedSubject.name}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {msg.identifiedSubject.type || 'Celebrity / Character'}
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">
                      {msg.identifiedSubject.summary}
                    </p>

                    {msg.identifiedSubject.knownFor && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 font-medium">
                        <CheckCircle2 size={12} className="text-amber-400" />
                        <span>Known for: {msg.identifiedSubject.knownFor}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Message Body Text */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Google AI Generated Images Gallery (with 2-4 Reference Options, Aspect Ratio & Resolution) */}
                {!isUser && msg.generatedImages && msg.generatedImages.length > 0 && (
                  <div className="mt-3.5 space-y-3 pt-3 border-t border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={13} className="text-pink-400 animate-spin" />
                        <span>Reference Image Options ({msg.generatedImages.length})</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {msg.imageConfig?.aspectRatio && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/30">
                            {msg.imageConfig.aspectRatio}
                          </span>
                        )}
                        {msg.imageConfig?.resolution && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                            {msg.imageConfig.resolution}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`grid gap-3 ${
                      msg.generatedImages.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                    }`}>
                      {msg.generatedImages.map((imgUrl, imgIdx) => (
                        <div 
                          key={imgIdx} 
                          className="relative rounded-2xl overflow-hidden border border-pink-500/30 shadow-2xl group bg-black/60 flex flex-col justify-between"
                        >
                          <div className="relative overflow-hidden">
                            <img 
                              src={imgUrl} 
                              alt={`Generated artwork option ${imgIdx + 1}`} 
                              className="w-full h-auto object-cover max-h-72 rounded-t-2xl transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer"
                              onClick={() => setPreviewModalImage(imgUrl)}
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Option badge */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/75 border border-white/20 text-[10px] font-mono font-bold text-pink-300 backdrop-blur-md">
                              Option {imgIdx + 1} of {msg.generatedImages!.length}
                            </div>
                          </div>

                          {/* Action Toolbar for each reference image */}
                          <div className="p-2.5 bg-slate-950/90 border-t border-white/[0.08] flex items-center justify-between gap-2">
                            <button
                              onClick={() => setPreviewModalImage(imgUrl)}
                              className="px-2.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                              title="Zoom Preview"
                            >
                              <Maximize2 size={12} />
                              <span>Zoom</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedImage(imgUrl);
                                setInputValue(`Use option ${imgIdx + 1} as reference to create a variation: `);
                                inputRef.current?.focus();
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                              title="Use as reference for next generation"
                            >
                              <Palette size={12} />
                              <span>Remix</span>
                            </button>

                            <a
                              href={imgUrl}
                              download={`vintora-option-${imgIdx + 1}-${Date.now()}.png`}
                              className="p-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white transition-all shadow-md shadow-pink-600/30 flex items-center gap-1 text-xs font-bold active:scale-95"
                              title="Download Full Resolution"
                            >
                              <Download size={13} />
                              <span className="hidden sm:inline">Save</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* In-App Action Execution Card */}
                {msg.actionExecuted && (
                  <div className="mt-3 p-2.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-200 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                      <span className="font-semibold">{msg.actionExecuted.label}</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Applied
                    </span>
                  </div>
                )}

                {/* Cross-Channel Episode Matching Cards / Identified Video Links */}
                {msg.channelMatches && msg.channelMatches.length > 0 && (
                  <div className="mt-3.5 space-y-2 pt-3 border-t border-white/[0.08]">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Layers size={13} className="text-cyan-400" />
                      <span>Video & Episode Availability ({msg.channelMatches.length})</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {msg.channelMatches.map((cm, idx) => {
                        const vid = cm.video;
                        return (
                          <div 
                            key={`${vid.id}-${idx}`}
                            className="p-2.5 rounded-2xl bg-slate-950/70 hover:bg-slate-950/95 border border-white/[0.1] hover:border-cyan-500/40 transition-all duration-200 group flex flex-col justify-between shadow-lg"
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Thumbnail preview */}
                              <div className="relative w-24 h-14 bg-black rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                                <img 
                                  src={vid.thumbnail} 
                                  alt={vid.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white font-medium">
                                  {vid.duration}
                                </div>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <span className="inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-1 truncate max-w-full">
                                  {cm.badge || 'Available'}
                                </span>
                                <h4 className="text-xs font-semibold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                                  {vid.title}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                                  <img 
                                    src={cm.channelAvatar} 
                                    alt={cm.channelName} 
                                    className="w-3.5 h-3.5 rounded-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="truncate font-medium text-slate-300">{cm.channelName}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/[0.05]">
                              <button
                                onClick={() => onPlayVideo(vid)}
                                className="flex-1 py-1.5 px-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 active:scale-95 transition-all"
                              >
                                <Play size={11} className="fill-white" />
                                <span>Play Episode</span>
                              </button>

                              <button
                                onClick={() => onAddToWatchLater(vid)}
                                className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 active:scale-90 transition-all"
                                title="Add to Watch Later"
                              >
                                <Clock size={13} />
                              </button>

                              <button
                                onClick={() => onAddToLiked(vid)}
                                className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 active:scale-90 transition-all"
                                title="Like"
                              >
                                <ThumbsUp size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-up Prompts */}
                {!isUser && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                    {msg.suggestedPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendMessage(prompt)}
                        className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span>{prompt}</span>
                        <ArrowRight size={10} className="text-cyan-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-400 px-2 mt-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Loading Indicator with Liquid Animation */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-300 font-medium">
                Vintora is generating multi-option artwork / recognizing subject...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fullscreen Image Zoom Modal */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X size={20} />
            </button>

            <img 
              src={previewModalImage} 
              alt="High-res preview" 
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20"
              referrerPolicy="no-referrer"
            />

            <div className="flex items-center gap-3 mt-4">
              <a
                href={previewModalImage}
                download={`vintora-art-full-${Date.now()}.png`}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/30 transition-all"
              >
                <Download size={14} />
                <span>Download Artwork</span>
              </a>

              <button
                onClick={() => handleCopyModalLink(previewModalImage)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 transition-all"
              >
                {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied URL!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Bar with Liquid Glass styling */}
      <div className="mt-2.5 flex-shrink-0">
        {/* Selected Image Thumbnail Preview Chip (if uploaded) */}
        {selectedImage && (
          <div className="mb-2 p-2 rounded-2xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-xl flex items-center justify-between gap-3 max-w-sm animate-in fade-in duration-200 shadow-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={selectedImage} 
                alt="Selected preview" 
                className="w-12 h-12 rounded-xl object-cover border border-cyan-400/30 bg-black/40 flex-shrink-0 cursor-pointer"
                onClick={() => setPreviewModalImage(selectedImage)}
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-cyan-200 flex items-center gap-1">
                  <ImageIcon size={12} />
                  <span>Image Attached</span>
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Will identify celebrity, character, or episode scene
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedImage(null)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all flex-shrink-0"
              title="Remove Image"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
          {[
            'Generate 2 options of a cyberpunk neon city (16:9)',
            'Find Taarak Mehta Ep 1291 on different channels',
            'Generate 4 options of studio portrait character (3:4)',
            'Switch theme to OLED',
          ].map((suggestion, sIdx) => (
            <button
              key={sIdx}
              onClick={() => handleSendMessage(suggestion)}
              className="flex-shrink-0 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-white transition-all whitespace-nowrap active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className={`relative flex items-center p-1.5 rounded-3xl border backdrop-blur-2xl transition-all shadow-2xl ${
            isLight
              ? 'bg-white/95 border-slate-300/80 shadow-slate-300/60 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20'
              : 'bg-slate-950/80 border-cyan-500/30 hover:border-cyan-500/50 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 shadow-cyan-950/30'
          }`}
        >
          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-2xl text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all flex-shrink-0 active:scale-95"
            title="Upload character, celebrity, or episode thumbnail"
          >
            <ImagePlus size={18} />
          </button>

          {/* Toggle Studio inside input */}
          <button
            type="button"
            onClick={() => setShowImageStudio(prev => !prev)}
            className={`p-2 rounded-2xl transition-all flex-shrink-0 active:scale-95 ${
              showImageStudio
                ? 'text-pink-400 bg-pink-500/20 border border-pink-500/30'
                : 'text-slate-400 hover:text-pink-300 hover:bg-white/[0.06]'
            }`}
            title="Image Generator Studio & Options"
          >
            <Palette size={17} />
          </button>

          <input
            ref={inputRef}
            id="vintora-agent-input"
            type="text"
            onPaste={handlePaste}
            placeholder={
              selectedImage 
                ? "Add a note or hit Send to identify this image..." 
                : "Ask Vintora, upload celebrity photo, or generate 2-4 reference images..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className={`flex-1 bg-transparent border-none outline-none text-xs sm:text-sm py-2 px-2 min-w-0 ${
              isLight ? 'text-slate-900 placeholder-slate-400' : 'text-slate-100 placeholder-slate-400'
            }`}
          />

          <button
            type="submit"
            id="vintora-send-btn"
            disabled={(!inputValue.trim() && !selectedImage) || isLoading}
            className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-cyan-500/30 active:scale-95 flex-shrink-0 ml-1"
            title="Send message"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
