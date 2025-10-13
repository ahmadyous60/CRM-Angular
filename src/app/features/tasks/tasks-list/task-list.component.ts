import { Component, computed, signal } from '@angular/core';
import { DataService} from '../../../services/data.service';
import { Task } from '../../../models/task.model';
import { Modal } from 'bootstrap';
import { Input } from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core'; 
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HasPermissionDirective } from '../../../Directive/hasPermission.directive';

@Component({
  standalone: true,
  selector: 'app-tasks-list',
  styleUrls: ['./task-list.scss'],
  imports: [CommonModule, FormsModule, RouterModule, HasPermissionDirective],
  templateUrl: `task-list.component.html`
})
export class TasksListComponent implements OnChanges {
  @Input() entityType: string = 'Lead';
  @Input() entityId!: string;
  @Input() mode: 'full' | 'compact' = 'full';  
  
  tasks = signal<Task[]>([]);
  q = signal('');
  page = signal(1);
  editing = signal(false);
  deleting = signal(false);

  readonly pageSize = 5;

  editTask: Task | null = null;
  selectedId: string | null = null;
  selectedTask: Task | null = null;

  filtered = computed(() => {
    const query = this.q().toLowerCase();
    const result = this.tasks().filter(task =>
      task.title?.toLowerCase().includes(query)
    );
    const maxPage = Math.max(1, Math.ceil(result.length / this.pageSize));
    if (this.page() > maxPage) this.page.set(maxPage);
    return result;
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize))
  );

  paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  constructor(private ds: DataService ,private cdRef: ChangeDetectorRef) {}

 
  ngOnInit() {
    if (this.entityId) {
      this.loadTasks(); // entity-based
    } else {
      console.log('Loading all tasks...');
      this.ds.getAllTasks().subscribe(tasks => {
        this.tasks.set(tasks);
      });
    }
  }

  // pagination helpers...
  currentPage = () => this.page();
  startIndex = () =>
    this.filtered().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1;
  endIndex = () =>
    Math.min(this.currentPage() * this.pageSize, this.filtered().length);
  prevPage = () => {
    if (this.page() > 1) this.page.update(v => v - 1);
  };
  nextPage = () => {
    if (this.page() < this.totalPages()) this.page.update(v => v + 1);
  };

  // Delete flow
  confirmDelete(id: string) {
    this.selectedId = id;
    this.deleting.set(true);
  }
  cancelDelete() {
    this.selectedId = null;
    this.deleting.set(false);
  }
  deleteConfirmed() {
    if (!this.selectedId) return;
    this.ds.deleteTask(this.selectedId).subscribe(() => {
      this.selectedId = null;
      this.deleting.set(false);
      this.loadTasks();
    });
  }

  // Edit flow
  edit(task: Task) {
    this.editTask = { ...task };
    this.editing.set(true);
  }
  cancelEdit() {
    this.editing.set(false);
    this.editTask = null;
  }
  update() {
    if (!this.editTask) return;
    this.ds.updateTask(this.editTask).subscribe(() => {
      this.editing.set(false);
      this.editTask = null;
      this.loadTasks();
    });
  }

  // View flow
  view(task: Task) {
    this.selectedTask = task;
    const modalEl = document.getElementById('viewTaskModal');
    if (modalEl) {
      document.body.appendChild(modalEl);
      const modal = new Modal(modalEl);
      modal.show();
    }
  }


private loadTasks() {
  if (this.entityId) {
    console.log('Making API call for:', this.entityType, this.entityId);
    this.ds.getTasks(this.entityType, this.entityId).subscribe({
      next: (tasks) => {
        console.log('Tasks received:', tasks);
        this.tasks.set(tasks);
      },
      error: (error) => {
        console.error('API Error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.tasks.set([]);
      }
    });
  }
}
ngOnChanges(changes: SimpleChanges) {
  console.log('Input changes:', changes);
  
  if (changes['entityId'] && this.entityId) {
    console.log('Loading tasks for entity:', this.entityId);
    this.loadTasks();
  } else if (changes['entityId'] && !this.entityId) {
    console.log('Entity ID cleared');
    this.tasks.set([]);
  }
  this.cdRef.detectChanges(); 
}
 
}