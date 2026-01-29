
import React, { useMemo } from 'react';
import { Project, ContentItem } from '../types';
import { CheckIcon, FileTextIcon, LinkIcon } from './Icons';

interface DashboardProps {
  project: Project;
  contentItems: ContentItem[];
  updateContent: (item: ContentItem) => void;
  selectedContentId: string | null;
  setSelectedContentId: (id: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  project, 
  contentItems, 
  updateContent, 
  selectedContentId, 
  setSelectedContentId 
}) => {
  const stats = useMemo(() => {
    const total = contentItems.length;
    const completed = contentItems.filter(i => i.status === 'Uploaded').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysContent = contentItems.filter(i => i.date.startsWith(todayStr));
    
    const missed = contentItems.filter(i => {
      const isPast = new Date(i.date) < new Date(todayStr);
      return isPast && i.status !== 'Uploaded' && i.status !== 'Scheduled';
    }).length;

    return { total, completed, progress, todaysContent, missed };
  }, [contentItems]);

  const selectedContent = useMemo(() => 
    contentItems.find(i => i.id === selectedContentId), 
    [contentItems, selectedContentId]
  );

  const handleTaskToggle = (taskId: string) => {
    if (!selectedContent) return;
    const updatedTasks = selectedContent.tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    
    let status = selectedContent.status;
    const allCompleted = updatedTasks.every(t => t.isCompleted);
    const someCompleted = updatedTasks.some(t => t.isCompleted);
    
    if (allCompleted) status = 'Uploaded';
    else if (someCompleted) status = 'Pending';
    else status = 'Planned';

    updateContent({
      ...selectedContent,
      tasks: updatedTasks,
      status: status
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">{project.platform}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm">{new Date(project.startDate).toLocaleDateString()} – {new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-600">{stats.progress}%</span>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Completion</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-1000 ease-out" 
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div className="p-3 bg-green-50 text-green-700 rounded-xl">
              <p className="text-xs font-bold uppercase mb-1">Uploaded</p>
              <p className="text-xl font-bold">{stats.completed}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <p className="text-xs font-bold uppercase mb-1">Daily Plan</p>
              <p className="text-xl font-bold">{project.videosPerDay}</p>
            </div>
            <div className="p-3 bg-red-50 text-red-700 rounded-xl">
              <p className="text-xs font-bold uppercase mb-1">Missed</p>
              <p className="text-xl font-bold">{stats.missed}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white shadow-blue-500/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            Today's Plan
          </h3>
          <div className="space-y-4">
             {stats.todaysContent.length === 0 ? (
               <p className="text-blue-100 italic py-8 text-center bg-white/10 rounded-xl border border-white/10">No videos scheduled for today.</p>
             ) : (
               stats.todaysContent.map(content => (
                 <div 
                  key={content.id} 
                  className={`bg-white/10 p-4 rounded-xl border border-white/20 flex justify-between items-center transition-transform hover:translate-x-1 cursor-pointer ${selectedContentId === content.id ? 'ring-2 ring-white' : ''}`}
                  onClick={() => setSelectedContentId(content.id)}
                 >
                   <div>
                     <p className="font-bold">{content.title}</p>
                     <p className="text-xs text-blue-200">
                        {content.tasks.filter(t => t.isCompleted).length} of {content.tasks.length} tasks done
                     </p>
                   </div>
                   <button className="bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50">
                     Open
                   </button>
                 </div>
               ))
             )}
          </div>
          {stats.missed > 0 && (
            <div className="mt-4 p-3 bg-red-500/20 rounded-xl border border-red-400/30 flex items-center gap-2">
               <span className="text-sm font-bold">⚠️ {stats.missed} Missed Uploads</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {selectedContent ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                    #{contentItems.indexOf(selectedContent) + 1}
                  </div>
                  <div>
                    <input 
                      className="text-xl font-bold outline-none focus:text-blue-600 transition-colors bg-transparent border-none"
                      value={selectedContent.title}
                      onChange={(e) => updateContent({ ...selectedContent, title: e.target.value })}
                    />
                    <p className="text-xs text-slate-400 font-medium">Planned for {new Date(selectedContent.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  selectedContent.status === 'Uploaded' ? 'bg-green-100 text-green-700' :
                  selectedContent.status === 'Scheduled' ? 'bg-cyan-100 text-cyan-700' :
                  selectedContent.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {selectedContent.status}
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                    <FileTextIcon /> Script Editor
                  </label>
                  <textarea 
                    className="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-300 leading-relaxed"
                    placeholder="Write your hook, core message, and call to action here..."
                    value={selectedContent.script}
                    onChange={(e) => updateContent({ ...selectedContent, script: e.target.value })}
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-500 uppercase mb-4 block">Task Pipeline</label>
                    <div className="space-y-2">
                      {selectedContent.tasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => handleTaskToggle(task.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-sm font-medium ${
                            task.isCompleted ? 'bg-green-50 border-green-100 text-green-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            task.isCompleted ? 'bg-green-500 text-white' : 'border-2 border-slate-200'
                          }`}>
                            {task.isCompleted && <CheckIcon />}
                          </div>
                          {task.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-sm font-bold text-slate-500 uppercase mb-3 block">Upload Details</label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateContent({ ...selectedContent, status: 'Scheduled' })}
                          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                            selectedContent.status === 'Scheduled' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Mark as Scheduled
                        </button>
                        <button 
                          onClick={() => updateContent({ ...selectedContent, status: 'Uploaded' })}
                          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                            selectedContent.status === 'Uploaded' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Mark as Uploaded
                        </button>
                      </div>
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500"
                        placeholder="Paste video URL (optional)..."
                        value={selectedContent.videoUrl || ''}
                        onChange={(e) => updateContent({ ...selectedContent, videoUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-400">
              Select a content piece from "Today's Plan" or the "Content Planner" to start working.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="font-bold mb-4 flex items-center gap-2">
               <LinkIcon />
               Reference Library
             </h3>
             <div className="space-y-3">
                {project.references.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No project references added. Add links for inspiration!</p>
                ) : (
                  project.references.map(ref => (
                    <a 
                      key={ref.id} 
                      href={ref.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors group"
                    >
                      <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 truncate">{ref.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{ref.url}</p>
                    </a>
                  ))
                )}
                <button className="w-full mt-2 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 border-dashed">
                  Add New Link
                </button>
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="font-bold mb-4">Quick Productivity</h3>
             <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                   <p className="text-xs font-bold text-blue-700 mb-1">Consistency Streak</p>
                   <p className="text-xl font-black text-blue-800">12 Days</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                   <p className="text-xs font-bold text-slate-500 mb-1">Next Milestone</p>
                   <p className="text-sm font-bold text-slate-700">50% Project Completion</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
