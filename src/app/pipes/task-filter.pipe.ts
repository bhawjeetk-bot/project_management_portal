import { Pipe, PipeTransform } from '@angular/core';
import { Task, TaskStatus } from '../models/models';

@Pipe({
  name: 'taskFilter',
  standalone: true
})
export class TaskFilterPipe implements PipeTransform {
  transform(tasks: Task[], status: TaskStatus): Task[] {
    return tasks.filter((t) => t.status === status);
  }
}
