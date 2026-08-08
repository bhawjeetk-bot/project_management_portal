import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Comment, Task, TaskStatus, User } from '../../../models/models';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail-modal.component.html',
  styleUrls: ['./task-detail-modal.component.css', '../modal-shared.css']
})
export class TaskDetailModalComponent implements OnInit, OnChanges {
  @Input({ required: true }) task!: Task;
  @Input() members: User[] = [];
  @Input() incomingComment: { taskId: number; comment: Comment } | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() statusChange = new EventEmitter<{ taskId: number; status: TaskStatus }>();
  @Output() assigneeChange = new EventEmitter<{ taskId: number; assignedTo: number | null }>();
  @Output() deleteTask = new EventEmitter<number>();
  
  comments: Comment[] = [];
  commentText = '';
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadComments();

}
    
   

  ngOnChanges(changes: SimpleChanges) {
    if (changes['incomingComment'] && this.incomingComment) {
      const { taskId, comment } = this.incomingComment;
      if (taskId === this.task.id && !this.comments.some((c) => c.id === comment.id)) {
        this.comments = [...this.comments, comment];
      }
    }
  }

  async loadComments() {
    this.loading = true;
    const { comments } = await this.api.getComments(this.task.id);
    this.comments = comments;
    this.loading = false;
  }

  onStatusChange(status: TaskStatus) {
    this.statusChange.emit({ taskId: this.task.id, status });
  }

  onAssigneeChange(assignedTo: number | null) {
    this.assigneeChange.emit({ taskId: this.task.id, assignedTo });
  }
   

  async submitComment() {
    const text = this.commentText.trim();
    if (!text) return;
    this.commentText = '';
    await this.api.addComment(this.task.id, text);
  }
}
