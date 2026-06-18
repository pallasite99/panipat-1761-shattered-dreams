import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Download, Upload, Trash2, FileJson, Info, AlertTriangle, Play } from 'lucide-react';
import { CampaignSave, getSavedCampaigns, saveCampaignToSlot, loadCampaignFromSlot, deleteCampaignSlot, exportSaveToFile } from '../utils/saveSystem';
import { CampaignStage, Screen } from '../types';

interface CampaignSaveLoadProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSuccess?: (stage: CampaignStage) => void;
  allowSave?: boolean;
}

export const CampaignSaveLoad: React.FC<CampaignSaveLoadProps> = ({
  isOpen,
  onClose,
  onLoadSuccess,
  allowSave = false,
}) => {
  const [saves, setSaves] = useState<CampaignSave[]>([]);
  const [newSaveName, setNewSaveName] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [infoText, setInfoText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSaves(getSavedCampaigns());
      setErrorText(null);
      setInfoText(null);
    }
  }, [isOpen]);

  const refreshSaves = () => {
    setSaves(getSavedCampaigns());
  };

  const handleCreateSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaveName.trim()) {
      setErrorText('Please enter a valid save game name.');
      return;
    }
    try {
      saveCampaignToSlot(newSaveName.trim());
      setNewSaveName('');
      refreshSaves();
      setInfoText('✓ Campaign saved successfully!');
      setErrorText(null);
    } catch (err: any) {
      setErrorText(`Error saving: ${err.message}`);
    }
  };

  const handleOverwriteSave = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to overwrite "${name}"?`)) {
      try {
        saveCampaignToSlot(name, id);
        refreshSaves();
        setInfoText('✓ Campaign slot updated successfully!');
      } catch (err: any) {
        setErrorText(`Error overwriting: ${err.message}`);
      }
    }
  };

  const handleLoadSave = (save: CampaignSave) => {
    try {
      loadCampaignFromSlot(save);
      setInfoText(`Loaded "${save.name}" successfully! redirecting...`);
      if (onLoadSuccess) {
        onLoadSuccess(save.stage);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorText(`Error loading save: ${err.message}`);
    }
  };

  const handleDeleteSave = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      deleteCampaignSlot(id);
      refreshSaves();
      setInfoText('✓ Save slot removed.');
    }
  };

  const handleExport = (save: CampaignSave) => {
    exportSaveToFile(save);
    setInfoText(`✓ Exported ${save.name} as JSON file.`);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const importedSave = JSON.parse(text) as CampaignSave;
        
        // Validation check for important properties
        if (!importedSave.id || !importedSave.name || !importedSave.stage || !importedSave.faction) {
          throw new Error('Invalid save file structure. Missing critical fields.');
        }

        const savesList = getSavedCampaigns();
        
        // Generate new ID to protect duplicates unless requested
        importedSave.id = `imported_${Date.now()}`;
        importedSave.name = `[Imported] ${importedSave.name}`;
        importedSave.date = new Date().toLocaleString();

        savesList.push(importedSave);
        localStorage.setItem('panipat_campaign_saves_slots', JSON.stringify(savesList));
        
        refreshSaves();
        setInfoText(`✓ Import successful: ${importedSave.name}`);
        setErrorText(null);
      } catch (err: any) {
        setErrorText(`Failed to import JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1010] bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="w-full max-w-4xl bg-stone-900 border border-stone-850 p-6 md:p-8 relative shadow-2xl overflow-hidden rounded-xs"
          >
            {/* Ancient Scroll Vignette styling */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF9933 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors z-20 cursor-pointer"
            >
              <X size={22} />
            </button>

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-saffron/10 border border-saffron/20 flex items-center justify-center rounded-sm">
                <Save size={24} className="text-saffron" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-serif text-white uppercase tracking-tight font-black">
                  Campaign Registry Center
                </h2>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest font-mono leading-none">
                  Save & Load Historical Expedition Progress
                </p>
              </div>
            </div>

            {/* NOTIFICATIONS */}
            {infoText && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs text-left rounded-sm font-mono flex items-center gap-2">
                <span>✓</span> {infoText}
              </div>
            )}
            {errorText && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-500/30 text-red-400 text-xs text-left rounded-sm font-mono flex items-center gap-2">
                <AlertTriangle size={14} /> {errorText}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
              {/* LEFT SIDE: SAVE FORM & ACTIONS */}
              <div className="lg:col-span-4 space-y-5 text-left">
                {allowSave && (
                  <form onSubmit={handleCreateSave} className="p-4 bg-stone-950 border border-stone-850 rounded-xs">
                    <h3 className="text-xs text-saffron uppercase font-mono font-black tracking-wider mb-3">
                      ✍️ Create New Save Slot
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newSaveName}
                        onChange={(e) => setNewSaveName(e.target.value)}
                        placeholder="Save Slot Name (e.g., Gwalior Advance)"
                        maxLength={32}
                        className="w-full bg-stone-900 border border-stone-800 text-xs p-2.5 rounded-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-saffron font-serif font-black"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-saffron to-amber-650 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-mono text-[10px] font-black uppercase tracking-wider rounded-xs cursor-pointer flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                      >
                        <Save size={13} /> Secure Current State
                      </button>
                    </div>
                  </form>
                )}

                {/* FILE BACKUP / IMPORT & EXPORT GUIDES */}
                <div className="p-4 bg-stone-950/80 border border-stone-850 rounded-xs space-y-4">
                  <div>
                    <h4 className="text-xs text-[#a78bfa] uppercase font-mono font-black tracking-widest flex items-center gap-1.5">
                      <Upload size={13} /> Import JSON Save Backup
                    </h4>
                    <p className="text-[10px] text-stone-400 font-sans mt-1.5 leading-relaxed">
                      Restore campaign save files exported from previous sessions or other browsers:
                    </p>
                    <label className="w-full mt-3 py-2 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 text-stone-300 font-mono text-[9px] font-semibold uppercase tracking-wider rounded-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                      <FileJson size={13} />
                      Choose Save JSON
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="border-t border-stone-900 pt-3 text-[10px] text-stone-500 font-serif leading-relaxed italic space-y-1">
                    <span className="text-stone-400 font-bold font-sans not-italic block uppercase text-[9px] tracking-widest">
                       Campaign Registry Manual:
                    </span>
                    <p>• Save slots are stored securely under local browser caches.</p>
                    <p>• Download slots as independent system JSON files to safely preserve achievements long-term.</p>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: LIST OF SAVED GAMES */}
              <div className="lg:col-span-8 flex flex-col min-h-[300px]">
                <div className="flex-1 overflow-y-auto max-h-[460px] space-y-3 pr-1">
                  <h3 className="text-xs text-stone-400 font-mono uppercase tracking-widest text-left font-black pb-2 border-b border-stone-800">
                    💾 STABILIZED EXPEDITION SLOTS ({saves.length})
                  </h3>

                  {saves.length === 0 ? (
                    <div className="h-48 border border-dashed border-stone-800 rounded-sm flex flex-col justify-center items-center text-stone-500">
                      <Save size={32} className="opacity-30 mb-2" />
                      <span className="text-xs font-mono uppercase tracking-widest">No Saved Campaigns Found</span>
                      <span className="text-[10px] italic mt-1 font-serif">Initiate a Campaign on Shaniwar Wada strategic map to log records.</span>
                    </div>
                  ) : (
                    saves.map((save) => {
                      const isMaratha = save.faction === 'maratha';
                      const formattedStageName = save.stage.replace(/_/g, ' ').toUpperCase();
                      
                      return (
                        <div
                          key={save.id}
                          className="p-4 bg-stone-950 hover:bg-stone-950/90 border border-stone-850/80 hover:border-[#8B5E3C]/45 transition-all rounded-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-[14px] font-serif font-black text-white uppercase tracking-tight">
                                {save.name}
                              </span>
                              <span className={`px-2 py-0.5 text-[8px] font-mono font-black uppercase rounded-sm ${
                                isMaratha ? 'bg-orange-950 text-saffron border border-saffron/20' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {isMaratha ? '★ confederacy' : '🌙 durrani empire'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-[10px] font-mono text-stone-400 leading-normal">
                              <div>
                                <span className="text-stone-600 block text-[8px] uppercase tracking-wide leading-none">STAGE</span>
                                <span className="text-white font-serif">{formattedStageName}</span>
                              </div>
                              <div>
                                <span className="text-stone-600 block text-[8px] uppercase tracking-wide leading-none">COMMANDER</span>
                                <span className="text-amber-500">{save.generalName}</span>
                              </div>
                              <div>
                                <span className="text-stone-600 block text-[8px] uppercase tracking-wide leading-none">TREASURY</span>
                                <span className="text-amber-200">{save.treasury.toLocaleString()} Mohurs</span>
                              </div>
                              <div>
                                <span className="text-stone-600 block text-[8px] uppercase tracking-wide leading-none">REGIMENT</span>
                                <span className="text-sky-450 text-[#38bdf8]">{save.recruitedTroops.length} Squads</span>
                              </div>
                            </div>
                            
                            <div className="text-[8.5px] font-mono text-stone-600">
                              Logged on: {save.date}
                            </div>
                          </div>

                          {/* ACTION BUTTONS FOR EACH SLOT */}
                          <div className="flex items-center gap-2 self-stretch sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleLoadSave(save)}
                              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-mono text-[9px] font-black uppercase tracking-wider rounded-sm cursor-pointer flex items-center justify-center gap-1.5 shadow"
                            >
                              <Play size={10} className="fill-current" /> Deploy
                            </button>
                            
                            {allowSave && (
                              <button
                                type="button"
                                title="Overwrite"
                                onClick={() => handleOverwriteSave(save.id, save.name)}
                                className="p-2.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-400 hover:text-saffron rounded-sm cursor-pointer transition-all"
                              >
                                <Save size={13} />
                              </button>
                            )}

                            <button
                              type="button"
                              title="Export to JSON text file"
                              onClick={() => handleExport(save)}
                              className="p-2.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-400 hover:text-white rounded-sm cursor-pointer transition-all"
                            >
                              <Download size={13} />
                            </button>

                            <button
                              type="button"
                              title="Delete Backup permanently"
                              onClick={() => handleDeleteSave(save.id, save.name)}
                              className="p-2.5 bg-stone-900 hover:bg-red-955 border border-stone-800 hover:border-red-500/20 text-stone-500 hover:text-red-400 rounded-sm cursor-pointer transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-800 flex justify-between items-center text-[9px] font-mono text-stone-600 uppercase">
              <span>Secure sandbox data storage protocols</span>
              <button
                type="button"
                onClick={onClose}
                className="text-saffron hover:underline h-full font-black tracking-widest cursor-pointer"
              >
                Dismiss Desk
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
