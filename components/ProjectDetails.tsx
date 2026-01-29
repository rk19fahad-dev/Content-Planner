
import React, { useMemo } from 'react';
import { Project, ContentItem } from '../types';
import { CalendarIcon } from './Icons';

interface ProjectDetailsProps {
  project: Project;
  contentItems: ContentItem[];
  updateContent: (item: ContentItem) => void;
  onSelectContent: (id: string) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, contentItems, updateContent, onSelectContent }) => {
  const groupedByDay = useMemo(() => {
    const groups: Record<number, { date: string, items: ContentItem[] }> = {};
    contentItems.forEach(item => {
      if (!groups[item.dayIndex]) {
        groups[item.dayIndex] = { date: item.date, items: [] };
      }
      groups[item.dayIndex].items.push(item);
    });
    return groups;
  }, [contentItems]);

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold mb-1">Content Strategy</h2>
          <p className="text-slate-500">Full timeline for <span className="text-slate-800 font-bold">{project.name}</span></p>
        </div>
        <div className="flex gap-4">
           <div className="text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Days</p>
             <p className="text-xl font-bold">{Object.keys(groupedByDay).length}</p>
           </div>
           <div className="w-[1px] bg-slate-200"></div>
           <div className="text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</p>
             <p className="text-xl font-bold">{contentItems.length}</p>
           </div>
        </div>
      </div>

      <div className="space-y-12">
        {(Object.entries(groupedByDay) as [string, { date: string, items: ContentItem[] }][]).map(([day, data]) => (
          <div key={day} className="relative">
            <div className="sticky top-[80px] z-10 bg-slate-50 py-2 flex items-center gap-4 mb-4">
              <div className="bg-slate-800 text-white px-3 py-1 rounded-lg text-sm font-bold">
                Day {day}
              </div>
              <div className="text-sm font-bold text-slate-400">
                {new Date(data.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex-1 h-[1px] bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.items.map((item, idx) => (
                <div 
                  key={item.id} 
                  className={`group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-blue-100 relative ${
                    item.status === 'Uploaded' ? 'bg-green-50/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold group-hover:text-blue-600 transition-colors">Video #{idx + 1}: {item.title}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Content Item #{contentItems.indexOf(item) + 1}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'Uploaded' ? 'bg-green-100 text-green-700' :
                      item.status === 'Scheduled' ? 'bg-cyan-100 text-cyan-700' :
                      item.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.status}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {item.tasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${
                            task.isCompleted ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${task.isCompleted ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                          {task.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <button 
                      onClick={() => onSelectContent(item.id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Open Editor
                    </button>
                    {item.script.trim() !== '' && (
                      <span className="text-[10px] font-bold text-slate-300 italic flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Scripted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;
