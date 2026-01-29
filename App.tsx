
import React, { useState, useEffect, useMemo } from 'react';
import { Project, ContentItem, Platform, AppState, Topic } from './types';
import { PlusIcon, DownloadIcon, LayoutIcon, FileTextIcon, CalendarIcon } from './components/Icons';
import Dashboard from './components/Dashboard';
import ProjectDetails from './components/ProjectDetails';
import NewProjectModal from './components/NewProjectModal';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('creatorflow_state');
    if (saved) return JSON.parse(saved);
    return {
      projects: [],
      contentItems: [],
      activeProjectId: null,
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'topics'>('dashboard');
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('creatorflow_state', JSON.stringify(state));
  }, [state]);

  const activeProject = useMemo(() => 
    state.projects.find(p => p.id === state.activeProjectId), 
    [state.projects, state.activeProjectId]
  );

  const pendingUploads = useMemo(() => 
    state.contentItems.filter(item => item.status !== 'Uploaded').length,
    [state.contentItems]
  );

  const createProject = (newProject: Omit<Project, 'id' | 'isFinished' | 'references' | 'futureTopics'>) => {
    const id = crypto.randomUUID();
    const project: Project = {
      ...newProject,
      id,
      isFinished: false,
      references: [],
      futureTopics: [],
    };

    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    
    const items: ContentItem[] = [];
    for (let day = 0; day < dayDiff; day++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + day);
      
      for (let v = 0; v < project.videosPerDay; v++) {
        items.push({
          id: crypto.randomUUID(),
          projectId: id,
          dayIndex: day + 1,
          date: currentDate.toISOString(),
          title: `Video #${items.length + 1}`,
          script: '',
          status: 'Planned',
          tasks: [
            { id: 't1', label: 'Write Script', isCompleted: false },
            { id: 't2', label: 'Record Video', isCompleted: false },
            { id: 't3', label: 'Edit Video', isCompleted: false },
            { id: 't4', label: 'Upload Video', isCompleted: false },
          ]
        });
      }
    }

    setState(prev => ({
      ...prev,
      projects: [...prev.projects, project],
      contentItems: [...prev.contentItems, ...items],
      activeProjectId: id,
    }));
    setIsModalOpen(false);
    setActiveTab('dashboard');
  };

  const updateContentItem = (updatedItem: ContentItem) => {
    setState(prev => {
      const newItems = prev.contentItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      );

      const finalItems = newItems.map(item => {
        if (item.id === updatedItem.id && item.script.trim() !== '') {
          const writeTask = item.tasks.find(t => t.label === 'Write Script');
          if (writeTask && !writeTask.isCompleted) {
             return {
               ...item,
               tasks: item.tasks.map(t => t.label === 'Write Script' ? { ...t, isCompleted: true } : t)
             };
          }
        }
        return item;
      });

      return { ...prev, contentItems: finalItems };
    });
  };

  const handleSelectContent = (id: string) => {
    setSelectedContentId(id);
    setActiveTab('dashboard');
  };

  const addTopic = (projectId: string, text: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? {
        ...p,
        futureTopics: [...p.futureTopics, { id: crypto.randomUUID(), text, dateAdded: new Date().toISOString() }]
      } : p)
    }));
  };

  const deleteTopic = (projectId: string, topicId: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? {
        ...p,
        futureTopics: p.futureTopics.filter(t => t.id !== topicId)
      } : p)
    }));
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `creatorflow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const sortedProjects = useMemo(() => {
    const active = state.projects.filter(p => !p.isFinished);
    const finished = state.projects.filter(p => p.isFinished);
    return { active, finished };
  }, [state.projects]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const projectsToFinish = state.projects.filter(p => !p.isFinished && p.endDate < today);
    if (projectsToFinish.length > 0) {
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => projectsToFinish.some(f => f.id === p.id) ? { ...p, isFinished: true } : p)
      }));
    }
  }, [state.projects]);

  return (
    <div className="flex h-screen text-slate-800 overflow-hidden">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
          >
            <PlusIcon />
            New Project
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Main</h3>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutIcon />
              Dashboard
            </button>
          </div>

          <div>
            <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Projects</h3>
            <div className="space-y-1">
              {sortedProjects.active.map(project => (
                <button
                  key={project.id}
                  onClick={() => {
                    setState(prev => ({ ...prev, activeProjectId: project.id }));
                    setActiveTab('dashboard');
                    setSelectedContentId(null);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all border border-transparent ${state.activeProjectId === project.id ? 'bg-white border-slate-100 shadow-sm ring-1 ring-blue-500/10' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="font-semibold truncate">{project.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>{project.platform}</span>
                  </div>
                </button>
              ))}
              {sortedProjects.active.length === 0 && (
                <p className="px-3 text-xs text-slate-400 italic">No active projects</p>
              )}
            </div>
          </div>

          {sortedProjects.finished.length > 0 && (
            <div>
              <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Archive</h3>
              <div className="space-y-1 opacity-60">
                {sortedProjects.finished.map(project => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setState(prev => ({ ...prev, activeProjectId: project.id }));
                      setSelectedContentId(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${state.activeProjectId === project.id ? 'bg-slate-100 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <div className="truncate">{project.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200">
           <button 
             onClick={exportData}
             className="w-full flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors py-2 px-3 rounded-md hover:bg-slate-50"
           >
             <DownloadIcon />
             Backup Data
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CreatorFlow</h1>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <p className="text-sm font-medium text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-100">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              {pendingUploads} Pending Uploads
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-200">
              JD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pt-6">
          {!activeProject ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <LayoutIcon />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to CreatorFlow</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">Plan, script, and manage your social media content in one unified dashboard. Create your first project to get started.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                <PlusIcon />
                Create New Project
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-1 mb-6 p-1 bg-slate-200/50 rounded-xl w-fit">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('planner')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'planner' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Content Planner
                </button>
                <button 
                  onClick={() => setActiveTab('topics')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'topics' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Future Topics
                </button>
              </div>

              {activeTab === 'dashboard' && (
                <Dashboard 
                  project={activeProject} 
                  contentItems={state.contentItems.filter(i => i.projectId === activeProject.id)}
                  updateContent={updateContentItem}
                  selectedContentId={selectedContentId}
                  setSelectedContentId={setSelectedContentId}
                />
              )}
              {activeTab === 'planner' && (
                <ProjectDetails 
                  project={activeProject} 
                  contentItems={state.contentItems.filter(i => i.projectId === activeProject.id)}
                  updateContent={updateContentItem}
                  onSelectContent={handleSelectContent}
                />
              )}
              {activeTab === 'topics' && (
                <FutureTopicsView 
                  project={activeProject} 
                  onAddTopic={(text) => addTopic(activeProject.id, text)}
                  onDeleteTopic={(id) => deleteTopic(activeProject.id, id)}
                />
              )}
            </>
          )}
        </div>
      </main>

      {isModalOpen && (
        <NewProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onCreate={createProject} 
        />
      )}
    </div>
  );
};

const FutureTopicsView: React.FC<{ 
  project: Project; 
  onAddTopic: (t: string) => void;
  onDeleteTopic: (id: string) => void;
}> = ({ project, onAddTopic, onDeleteTopic }) => {
  const [newTopic, setNewTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.trim()) {
      onAddTopic(newTopic.trim());
      setNewTopic('');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-4">Future Topics Planner</h2>
        <p className="text-slate-500 mb-6">Jot down video ideas to fill into your content slots later. Keep the creative engine running!</p>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text" 
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Type a new video topic or hook idea..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <button className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
            Add Topic
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.futureTopics.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400">
            No topics planned yet. Start brainstorming!
          </div>
        ) : (
          project.futureTopics.map(topic => (
            <div key={topic.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start group">
              <div>
                <p className="font-medium text-slate-700">{topic.text}</p>
                <p className="text-[10px] text-slate-400 mt-1">Added {new Date(topic.dateAdded).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => onDeleteTopic(topic.id)}
                className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
