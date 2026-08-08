import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Project } from '../../models/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() projects: Project[] = [];
  @Input() currentProject: Project | null = null;
  @Output() selectProject = new EventEmitter<number>();
  @Output() newProject = new EventEmitter<void>();
}
