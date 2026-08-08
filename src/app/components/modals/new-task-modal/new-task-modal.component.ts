import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/models';

@Component({
  selector: 'app-new-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-task-modal.component.html',
  styleUrls: ['./new-task-modal.component.css', '../modal-shared.css']
})
export class NewTaskModalComponent {
  @Input() members: User[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{
    title: string;
    description: string;
    assignedTo: number | null;
    dueDate: string | null;
    issueDate: string | null;
  }>();

  title = '';
  description = '';
  assignedTo: number | null = null;
  dueDate = '';
  issueDate = '';

  submit() {
    if (!this.title.trim()) return;
    this.create.emit({
      title: this.title.trim(),
      description: this.description.trim(),
      assignedTo: this.assignedTo,
      dueDate: this.dueDate || null,
      issueDate: this.issueDate || null
    });
    this.title = '';
    this.description = '';
    this.assignedTo = null;
    this.dueDate = '';
    this.issueDate = '';
  }
}
