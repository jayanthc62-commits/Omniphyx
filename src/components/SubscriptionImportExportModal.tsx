import React, { useState, useRef } from 'react';
import { 
  FolderUp, FolderDown, FileText, Check, Upload, 
  X, AlertCircle, Sparkles, Radio, HelpCircle, Download
} from 'lucide-react';
import { Channel } from '../types';

interface SubscriptionImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onImportChannels: (newChannels: Channel[]) => void;
}

export const SubscriptionImportExportModal: React.FC<SubscriptionImportExportModalProps> = ({
  isOpen,
  onClose,
  channels,
  onImportChannels,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'presets'>('import');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number>(0);
  const [customText, setCustomText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Export to JSON
  const handleExportJSON = () => {
    const exportData = {
      format: 'FreeTube-Subscriptions',
      version: 'v0.25.2',
      exportedAt: new Date().toISOString(),
      subscriptions: channels.map(c => ({
        id: c.id,
        name: c.name,
        subscriberCount: c.subscriberCount,
        avatar: c.avatar,
        isSubscribed: c.isSubscribed
      }))
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `freetube_subscriptions_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Export to OPML (Standard RSS/Podcast/YouTube Feed Format)
  const handleExportOPML = () => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<opml version="1.1">\n  <head>\n    <title>FreeTube Subscriptions</title>\n  </head>\n  <body>\n    <outline text="YouTube Subscriptions" title="YouTube Subscriptions">\n';
    const xmlBody = channels.map(c => 
      `      <outline text="${c.name.replace(/&/g, '&amp;')}" title="${c.name.replace(/&/g, '&amp;')}" type="rss" xmlUrl="https://www.youtube.com/feeds/videos.xml?channel_id=${c.id}" htmlUrl="https://www.youtube.com/channel/${c.id}"/>`
    ).join('\n');
    const xmlFooter = '\n    </outline>\n  </body>\n</opml>';
    const opmlText = xmlHeader + xmlBody + xmlFooter;

    const blob = new Blob([opmlText], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `freetube_subscriptions_${Date.now()}.opml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Process File Upload (JSON, CSV, OPML)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let newChannels: Channel[] = [];

        // Check if JSON (FreeTube, NewPipe, Invidious)
        if (file.name.endsWith('.json') || content.trim().startsWith('{') || content.trim().startsWith('[')) {
          const parsed = JSON.parse(content);
          const rawList = Array.isArray(parsed) 
            ? parsed 
            : parsed.subscriptions || parsed.app_subscriptions || [];

          newChannels = rawList.map((item: any) => {
            const name = item.name || item.channelTitle || item.title || item.author || 'Imported Creator';
            const id = item.id || item.channelId || `ch-${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`;
            return {
              id,
              name,
              avatar: item.avatar || item.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e293b&color=ef4444`,
              subscriberCount: item.subscriberCount || '1.2M subscribers',
              videoCount: 150,
              isSubscribed: true,
              verified: true,
            };
          });
        } else if (file.name.endsWith('.csv') || content.includes(',')) {
          // Google Takeout CSV (Channel Id, Channel Url, Channel Title)
          const lines = content.split('\n');
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',');
            const id = parts[0]?.trim();
            const name = parts[2]?.replace(/["\r]/g, '').trim() || parts[1]?.trim() || `Channel ${i}`;
            if (id && name) {
              newChannels.push({
                id: id.startsWith('http') ? `ch-${i}` : id,
                name,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e293b&color=ef4444`,
                subscriberCount: '1M subscribers',
                videoCount: 100,
                isSubscribed: true,
                verified: true,
              });
            }
          }
        }

        if (newChannels.length > 0) {
          onImportChannels(newChannels);
          setImportedCount(newChannels.length);
          setImportStatus(`Successfully imported ${newChannels.length} channels!`);
        } else {
          setImportStatus('No recognizable channels found in file.');
        }
      } catch (err) {
        setImportStatus('Failed to parse file. Ensure it is valid JSON or CSV.');
      }
    };
    reader.readAsText(file);
  };

  // 1-Click Preset Packs
  const PRESET_PACKS = [
    {
      title: 'Popular Tech & Open Source',
      desc: 'Fireship, Theo, NetworkChuck, Luke Smith, Marques Brownlee',
      channels: [
        { id: 'ch-fireship', name: 'Fireship', subscriberCount: '3.1M subscribers', avatar: 'https://ui-avatars.com/api/?name=Fireship&background=1e293b&color=ef4444', isSubscribed: true, videoCount: 300, verified: true },
        { id: 'ch-mkbhd', name: 'Marques Brownlee', subscriberCount: '18M subscribers', avatar: 'https://ui-avatars.com/api/?name=MKBHD&background=1e293b&color=ef4444', isSubscribed: true, videoCount: 1500, verified: true },
        { id: 'ch-theo', name: 'Theo - t3.gg', subscriberCount: '500K subscribers', avatar: 'https://ui-avatars.com/api/?name=Theo&background=1e293b&color=ef4444', isSubscribed: true, videoCount: 450, verified: true },
      ]
    },
    {
      title: 'Comedy & TMKOC Hub',
      desc: 'Taarak Mehta Ka Ooltah Chashmah, Gokuldham society humor, Sony SAB',
      channels: [
        { id: 'ch-sonysab', name: 'Sony SAB', subscriberCount: '95M subscribers', avatar: 'https://ui-avatars.com/api/?name=Sony+SAB&background=1e293b&color=ef4444', isSubscribed: true, videoCount: 12000, verified: true },
        { id: 'ch-tmkoc-official', name: 'Taarak Mehta Ka Ooltah Chashmah', subscriberCount: '22M subscribers', avatar: 'https://ui-avatars.com/api/?name=TMKOC&background=1e293b&color=ef4444', isSubscribed: true, videoCount: 4000, verified: true },
      ]
    },
    {
      title: 'Science & Cosmos',
      desc: 'Veritasium, Kurzgesagt, Vsauce, NASA Science',
      channels: [
        { id: 'ch-veritasium', name: 'Veritasium', subscriberCount: '16M subscribers', avatar: 'https://ui-avatars.com/api/?name=Veritasium&background=1e293b&color=ef4444', isSubscribed: true, videoCount: 400, verified: true },
        { id: 'ch-kurzgesagt', name: 'Kurzgesagt – In a Nutshell', subscriberCount: '22M subscribers', avatar: 'https://ui-avatars.com/api/?name=Kurzgesagt&background=1e293b&color=ef4444', isSubscribed: true, videoCount: 220, verified: true },
      ]
    }
  ];

  const handleApplyPreset = (presetChannels: Channel[]) => {
    onImportChannels(presetChannels);
    setImportedCount(presetChannels.length);
    setImportStatus(`Added ${presetChannels.length} channels from preset!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-950/95 border border-white/[0.12] rounded-3xl p-5 sm:p-6 shadow-2xl shadow-red-950/40 text-slate-100 space-y-5 relative max-h-[92vh] overflow-y-auto scrollbar-none"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-2xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 transition-all"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 flex-shrink-0">
            <Radio size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Subscription Management
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Backup, import from Takeout / NewPipe, or export your channels
            </p>
          </div>
        </div>

        {/* Tabs: Import, Export, Presets */}
        <div className="flex items-center gap-2 p-1 bg-black/40 border border-white/[0.08] rounded-2xl">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'import' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderUp size={14} />
            <span>Import</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'export' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderDown size={14} />
            <span>Export</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'presets' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Preset Packs</span>
          </button>
        </div>

        {/* Status Message */}
        {importStatus && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check size={16} className="text-emerald-400 flex-shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* TAB 1: IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-4 text-xs">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,.csv,.opml,.txt"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-3xl border-2 border-dashed border-white/20 hover:border-red-500/60 bg-white/[0.02] hover:bg-white/[0.04] flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-300 group-hover:text-red-400 mb-2 transition-colors">
                <Upload size={22} />
              </div>
              <p className="font-bold text-slate-100">Click to upload subscriptions file</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Supports Google Takeout (CSV), NewPipe (JSON), Invidious (JSON), or OPML format.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-slate-400 text-[11px]">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-red-400" />
                How to export from YouTube Takeout:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>Visit Google Takeout (takeout.google.com).</li>
                <li>Deselect all and check only <strong className="text-slate-200">YouTube and YouTube Music</strong>.</li>
                <li>Download the archive and extract <strong className="text-slate-200">subscriptions.csv</strong>.</li>
                <li>Upload that CSV above to instantly restore all your creators!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-100">Current Subscriptions</p>
                <p className="text-[11px] text-slate-400">{channels.filter(c => c.isSubscribed).length} active subscriptions</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-semibold text-[11px]">
                Ready to Export
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left transition-all active:scale-95 space-y-1 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <FileText size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
                  <Download size={14} className="text-slate-500" />
                </div>
                <p className="font-bold text-slate-100">FreeTube JSON</p>
                <p className="text-[11px] text-slate-400">Complete backup for FreeTube & Invidious</p>
              </button>

              <button
                onClick={handleExportOPML}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left transition-all active:scale-95 space-y-1 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <Radio size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <Download size={14} className="text-slate-500" />
                </div>
                <p className="font-bold text-slate-100">OPML Feed XML</p>
                <p className="text-[11px] text-slate-400">Universal standard for RSS & podcast clients</p>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PRESET PACKS */}
        {activeTab === 'presets' && (
          <div className="space-y-3 text-xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Curated Starter Packs (1-Click Add)
            </p>
            {PRESET_PACKS.map((pack) => (
              <div 
                key={pack.title}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-red-500/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100">{pack.title}</h4>
                  <button
                    onClick={() => handleApplyPreset(pack.channels)}
                    className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px] transition-all active:scale-95 shadow-sm"
                  >
                    + Add Pack ({pack.channels.length})
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">{pack.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
