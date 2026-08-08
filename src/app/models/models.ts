export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: User;
  members: User[];
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: number;
  project: number;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: User | null;
  createdBy: User;
  dueDate: string | null;
  issueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  task: number;
  user: User;
  text: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
