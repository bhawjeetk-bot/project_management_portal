import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comment, Project, Task, TaskStatus } from '../models/models';

const BASE = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // ---------- Projects ----------
  getProjects() {
    return firstValueFrom(this.http.get<{ projects: Project[] }>(`${BASE}/projects/`));
  }

  createProject(payload: { name: string; description: string }) {
    return firstValueFrom(this.http.post<{ project: Project }>(`${BASE}/projects/`, payload));
  }

  getProject(id: number) {
    return firstValueFrom(
      this.http.get<{ project: Project; tasks: Task[] }>(`${BASE}/projects/${id}/`)
    );
  }

  addMember(projectId: number, email: string) {
    return firstValueFrom(
      this.http.post<{ message: string; project: Project }>(
        `${BASE}/projects/${projectId}/members/`,
        { email }
      )
    );
  }

  deleteProject(id: number) {
    return firstValueFrom(this.http.delete<{ message: string }>(`${BASE}/projects/${id}/`));
  }

  // ---------- Tasks ----------
  createTask(
    projectId: number,
    payload: { title: string; description: string; assignedTo: number | null; dueDate: string | null}
  ) {
    return firstValueFrom(
      this.http.post<{ task: Task }>(`${BASE}/tasks/project/${projectId}/`, payload)
    );
  }

  getTasks(taskId: number) {
  return firstValueFrom(
    this.http.get<{ tasks: Task[] }>(`${BASE}/tasks/project/${taskId}/`)
  );
}

  updateTask(
    taskId: number,
    payload: { status?: TaskStatus; assignedTo?: number | null; title?: string; description?: string; dueDate?: string | null }
  ) {
    return firstValueFrom(this.http.put<{ task: Task }>(`${BASE}/tasks/${taskId}/`, payload));
  }

  deleteTask(taskId: number) {
    return firstValueFrom(this.http.delete<{ message: string }>(`${BASE}/tasks/${taskId}/`));
  }

  // ---------- Comments ----------
  getComments(taskId: number) {
    return firstValueFrom(this.http.get<{ comments: Comment[] }>(`${BASE}/comments/task/${taskId}/`));
  }

  addComment(taskId: number, text: string) {
    return firstValueFrom(
      this.http.post<{ comment: Comment }>(`${BASE}/comments/task/${taskId}/`, { text })
    );
  }
}
