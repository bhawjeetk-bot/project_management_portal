import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-project-modal.component.html',
  styleUrls: ['./new-project-modal.component.css', '../modal-shared.css']
})
export class NewProjectModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{ name: string; description: string }>();

  name = '';
  description = '';

  submit() {
    if (!this.name.trim()) return;
    this.create.emit({ name: this.name.trim(), description: this.description.trim() });
    this.name = '';
    this.description = '';
  }
}
