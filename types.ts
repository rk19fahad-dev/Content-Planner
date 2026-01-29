
export type Platform = 'YouTube Shorts' | 'Instagram Reels' | 'TikTok';

export type ContentStatus = 'Planned' | 'Pending' | 'Scheduled' | 'Uploaded';

export interface Task {
  id: string;
  label: string;
  isCompleted: boolean;
}

export interface Reference {
  id: string;
  title: string;
  url: string;
}

export interface Topic {
  id: string;
  text: string;
  dateAdded: string;
}

export interface ContentItem {
  id: string;
  projectId: string;
  dayIndex: number; // Day 1, Day 2, etc.
  date: string; // ISO String
  title: string;
  script: string;
  tasks: Task[];
  status: ContentStatus;
  uploadDate?: string;
  videoUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  platform: Platform;
  startDate: string;
  endDate: string;
  videosPerDay: number;
  isFinished: boolean;
  references: Reference[];
  futureTopics: Topic[];
}

export interface AppState {
  projects: Project[];
  contentItems: ContentItem[];
  activeProjectId: string | null;
}
