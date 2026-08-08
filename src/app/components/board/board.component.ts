import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Project, Task, TaskStatus } from '../../models/models';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskFilterPipe } from '../../pipes/task-filter.pipe';

interface Column {
  key: TaskStatus;
  label: string;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, TaskFilterPipe],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {
  @Input() project: Project | null = null;
  @Input() tasks: Task[] = [];
  @Output() addMember = new EventEmitter<void>();
  @Output() addTask = new EventEmitter<void>();
  @Output() openTask = new EventEmitter<number>();
  @Output() deleteProject = new EventEmitter<number>();


  columns: Column[] = [
    { key: 'todo', label: '🕒 To Do' },
    { key: 'inprogress', label: '⚙️ In Progress' },
    { key: 'done', label: '✅ Done' }
  ];

  memberNames(): string {
    return this.project ? this.project.members.map((m) => m.username).join(', ') : '';
  }

 onDelete() {
    if (this.project?.id) {
      this.deleteProject.emit(this.project.id);
    }
  }

}
