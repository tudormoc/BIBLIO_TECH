import React, { useEffect, useState } from 'react';
import { BookPart, AnatomyInfo } from '../types';
import { getBookPartDescription } from '../services/geminiService';
import { X, Loader2, Cpu } from 'lucide-react';

interface InfoPanelProps {
  selectedPart: BookPart | null;
  onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ selectedPart, onClose }) => {
  const [info, setInfo] = useState<AnatomyInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPart) {
      setLoading(true);
      setInfo(null);
      getBookPartDescription(selectedPart)
        .then((data) => {
            setInfo({ ...data, loading: false });
        })
        .catch(() => {
            setInfo({ 
                title: "Error", 
                description: "Could not retrieve data.", 
                loading: false 
            });
        })
        .finally(() => setLoading(false));
    }
  }, [selectedPart]);

  if (!selectedPart) return null;

  return (
    <div className="absolute top-6 right-6 w-80 z-20 pointer-events-none">
       {/* Frame Effect */}
       <div className="pointer-events-auto relative bg-slate-900/95 border-2 border-sky-500/50 backdrop-blur-xl p-1 shadow-[0_0_30px_rgba(14,165,233,0.3)] rounded-sm overflow-hidden animate-in fade-in slide-in-from-right-10 duration-300">
            {/* Scanline decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]" />
            
            <div className="relative z-10 p-5">
                <div className="flex justify-between items-start mb-4 border-b border-sky-900/50 pb-2">
                    <div className="flex items-center gap-2 text-sky-400">
                        <Cpu size={16} className={loading ? "animate-spin" : ""} />
                        <span className="font-mono text-xs font-bold tracking-widest">ANALYSIS_MODULE</span>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="py-8 flex flex-col items-center justify-center text-sky-500 gap-2">
                        <Loader2 className="animate-spin" size={32} />
                        <span className="font-mono text-xs animate-pulse">QUERYING_DATABASE...</span>
                    </div>
                ) : (
                    info && (
                        <div className="space-y-3 font-mono">
                            <h2 className="text-2xl font-bold text-white uppercase break-words">{info.title}</h2>
                            <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-sky-500 pl-3">
                                {info.description}
                            </p>
                            
                            {info.historicalNote && (
                                <div className="mt-4 bg-sky-900/20 p-3 rounded border border-sky-800/50">
                                    <span className="text-xs text-sky-400 font-bold block mb-1">DATA_ARCHIVE_NOTE:</span>
                                    <p className="text-xs text-slate-400 italic">
                                        {info.historicalNote}
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-sky-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-sky-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-sky-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-sky-400"></div>
       </div>
    </div>
  );
};