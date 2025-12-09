import React from 'react';
import { BookConfiguration } from '../types';
import { Eye, Layers } from 'lucide-react';

interface ControlsProps {
  config: BookConfiguration;
  setConfig: React.Dispatch<React.SetStateAction<BookConfiguration>>;
}

export const Controls: React.FC<ControlsProps> = ({ config, setConfig }) => {
  const toggle = (key: keyof BookConfiguration) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md p-6 border-r border-slate-700 h-full w-80 flex flex-col gap-6 overflow-y-auto text-sm font-mono text-slate-200">
      
      <div className="border-b border-slate-700 pb-4">
        <h1 className="text-xl font-bold text-sky-400 mb-1">BIBLIO_TECH</h1>
        <p className="text-xs text-slate-500">v1.1.0 // HARDCOVER_ANATOMY</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sky-300 uppercase tracking-widest text-xs font-bold">
            <Layers size={14} /> Components
        </div>
        
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="group-hover:text-white transition-colors">Dust Jacket</span>
            <input 
                type="checkbox" 
                checked={config.hasDustJacket} 
                onChange={() => toggle('hasDustJacket')}
                className="accent-sky-500"
            />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
            <span className="group-hover:text-white transition-colors">Head/Tail Bands</span>
            <input 
                type="checkbox" 
                checked={config.hasHeadbands} 
                onChange={() => toggle('hasHeadbands')}
                className="accent-sky-500"
            />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
            <span className="group-hover:text-white transition-colors">Bookmark Ribbon</span>
            <input 
                type="checkbox" 
                checked={config.hasBookmark} 
                onChange={() => toggle('hasBookmark')}
                className="accent-sky-500"
            />
        </label>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sky-300 uppercase tracking-widest text-xs font-bold">
            <Eye size={14} /> Visualization
        </div>
        
        <button 
            onClick={() => toggle('explodeView')}
            className={`w-full py-2 border rounded font-bold transition-all ${
                config.explodeView 
                ? 'bg-red-500/20 border-red-500 text-red-100' 
                : 'border-slate-600 hover:bg-slate-800'
            }`}
        >
            {config.explodeView ? 'COLLAPSE VIEW' : 'EXPLODE VIEW'}
        </button>

        <button 
            onClick={() => toggle('showEndpapers')}
            className={`w-full py-2 border rounded transition-all ${
                config.showEndpapers
                ? 'bg-purple-500/20 border-purple-500 text-purple-100' 
                : 'border-slate-600 hover:bg-slate-800'
            }`}
        >
            {config.showEndpapers ? 'HIDE X-RAY' : 'X-RAY COVER'}
        </button>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-700">
        <p className="text-xs text-slate-500">
            Click on any part of the 3D model to analyze its function.
        </p>
      </div>
    </div>
  );
};