import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Comment, Project, Task, TaskStatus, User } from '../../models/models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { WebsocketService } from '../../services/websocket.service';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { BoardComponent } from '../board/board.component';
import { ToastComponent } from '../toast/toast.component';
import { NewProjectModalComponent } from '../modals/new-project-modal/new-project-modal.component';
import { AddMemberModalComponent } from '../modals/add-member-modal/add-member-modal.component';
import { NewTaskModalComponent } from '../modals/new-task-modal/new-task-modal.component';
import { TaskDetailModalComponent } from '../modals/task-detail-modal/task-detail-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    BoardComponent,
    ToastComponent,
    NewProjectModalComponent,
    AddMemberModalComponent,
    NewTaskModalComponent,
    TaskDetailModalComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  projects: Project[] = [];
  currentProject: Project | null = null;
  tasks: Task[] = [];
  activeTask: Task | null = null;
  incomingComment: { taskId: number; comment: Comment } | null = null;

  showNewProject = false;
  showAddMember = false;
  showNewTask = false;

  toastMessage: string | null = null;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private ws: WebsocketService
  ) {}

  async ngOnInit() {
    // The auth guard already ensured a token exists before we got here;
    // this just fetches (or re-verifies) the current user for display.
    this.user = await this.auth.ensureAuthenticated();
    await this.loadProjects();

    this.ws.events$.subscribe((event) => this.handleSocketEvent(event));
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => (this.toastMessage = null), 2500);
  }

  async loadProjects() {
    const { projects } = await this.api.getProjects();
    this.projects = projects;
  }

  async selectProject(id: number) {
    const { project, tasks } = await this.api.getProject(id);
    this.currentProject = project;
    this.tasks = tasks;
    if (this.auth.token) {
      this.ws.connect(id, this.auth.token);
    }
  }

  async createProject(payload: { name: string; description: string }) {
    const { project } = await this.api.createProject(payload);
    this.projects = [project, ...this.projects];
    this.showNewProject = false;
    this.selectProject(project.id);
  }

  async addMember(email: string) {
    if (!this.currentProject) return;
    await this.api.addMember(this.currentProject.id, email);
    this.showAddMember = false;
    const { project } = await this.api.getProject(this.currentProject.id);
    this.currentProject = project;
    this.showToast('Member added');
  }

  async createTask(payload: {
    title: string;
    description: string;
    assignedTo: number | null;
    dueDate: string | null;
  }) {
    if (!this.currentProject) return;
    await this.api.createTask(this.currentProject.id, payload);
    this.showNewTask = false;
  }

  openTask(taskId: number) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) this.activeTask = task;
  }

  async onStatusChange(event: { taskId: number; status: TaskStatus }) {
    await this.api.updateTask(event.taskId, { status: event.status });
  }

  async onAssigneeChange(event: { taskId: number; assignedTo: number | null }) {
    await this.api.updateTask(event.taskId, { assignedTo: event.assignedTo });
  }

  async onDeleteTask(taskId: number) {
    if (!confirm('Delete this task?')) return;
    await this.api.deleteTask(taskId);
    this.activeTask = null;
  }
//
async onDeleteProject(projectId: number) {
  try {
    await this.api.deleteProject(projectId);

    // this.ws.disconnect();

    this.projects = this.projects.filter(p => p.id !== projectId);
    this.currentProject = null;

    this.showToast('Project deleted');
  } catch (err) {
    console.error('Delete failed', err);
  }
}
//

  private handleSocketEvent(event: { type: string; payload: any }) {
    const cp = this.currentProject;
    if (!cp) return;

    switch (event.type) {
      case 'task:created': {
        const task: Task = event.payload;
        if (task.project === cp.id) {
          this.tasks = [...this.tasks, task];
          this.showToast(`New task added: ${task.title}`);
        }
        break;
      }
      case 'task:updated': {
        const task: Task = event.payload;
        if (task.project === cp.id) {
          this.tasks = this.tasks.map((t) => (t.id === task.id ? task : t));
          if (this.activeTask && this.activeTask.id === task.id) this.activeTask = task;
        }
        break;
      }
      case 'task:deleted': {
        const { taskId, projectId } = event.payload;
        if (projectId === cp.id) {
          this.tasks = this.tasks.filter((t) => t.id !== taskId);
          if (this.activeTask && this.activeTask.id === taskId) this.activeTask = null;
        }
        break;
      }
      case 'comment:created': {
        this.incomingComment = event.payload;
        break;
      }
      case 'project:memberAdded': {
        const { projectId, member } = event.payload;
        if (projectId === cp.id) {
          this.currentProject = { ...cp, members: [...cp.members, member] };
          this.showToast(`${member.username} joined the project`);
        }
        break;
      }
    }
  }
}
