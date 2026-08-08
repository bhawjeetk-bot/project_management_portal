import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-member-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-member-modal.component.html',
  styleUrls: ['./add-member-modal.component.css', '../modal-shared.css']
})
export class AddMemberModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() add = new EventEmitter<string>();

  email = '';

  submit() {
    if (!this.email.trim()) return;
    this.add.emit(this.email.trim());
    this.email = '';
  }
}
