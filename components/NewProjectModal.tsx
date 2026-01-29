
import React, { useState } from 'react';
import { Platform } from '../types';

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (project: any) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onCreate }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'YouTube Shorts' as Platform,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
    videosPerDay: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      onCreate(formData);
    }
  };

  const dayDiff = Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
  const totalVideos = dayDiff * formData.videosPerDay;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New Project</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="flex gap-2 mb-8 justify-center">
              {[1, 2].map(s => (
                <div key={s} className={`h-1.5 w-12 rounded-full transition-all ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
              ))}
            </div>

            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Project Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    placeholder="e.g., Summer Consistency Challenge"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Target Platform</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['YouTube Shorts', 'Instagram Reels', 'TikTok'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, platform: p as Platform })}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                          formData.platform === p ? 'bg-blue-50 border-blue-500 text-blue-600 ring-1 ring-blue-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Start Date</label>
                    <input 
                      required
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase mb-2">End Date</label>
                    <input 
                      required
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Upload Frequency</label>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={formData.videosPerDay}
                      onChange={(e) => setFormData({ ...formData, videosPerDay: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="font-bold text-blue-600 whitespace-nowrap">{formData.videosPerDay} video/day</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <h4 className="text-xs font-bold text-blue-700 uppercase mb-2">Project Summary</h4>
                   <div className="flex justify-between text-sm">
                      <span className="text-blue-600/70">Total Project Duration:</span>
                      <span className="font-bold text-blue-800">{dayDiff} Days</span>
                   </div>
                   <div className="flex justify-between text-sm mt-1">
                      <span className="text-blue-600/70">Total Videos Planned:</span>
                      <span className="font-bold text-blue-800">{totalVideos} Videos</span>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
            {step > 1 && (
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
            )}
            <button 
              type="submit"
              className="flex-[2] py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              {step === 1 ? 'Next Step' : 'Generate Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
