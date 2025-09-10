import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService} from '../../../core/data.service';
import { FormsModule } from '@angular/forms';
import { NgFor, DatePipe, NgIf, CommonModule } from '@angular/common';
import { Task } from '../../../core/model';
import { Modal } from 'bootstrap';
import { Input } from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core'; 
import { ChangeDetectorRef } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-tasks-list',
  styleUrls: ['./task-list.scss'],
  imports: [RouterLink, FormsModule, NgFor, DatePipe, NgIf, CommonModule ],
  template: `

<ng-container *ngIf="mode === 'full'">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Tasks</h3>
      <a routerLink="/tasks/new" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i> New Task
      </a>
    </div>

    <!-- Search -->
    <div class="card p-3 mb-3">
      <div class="input-group">
        <input type="text" class="form-control"
               placeholder="Search title"
               [ngModel]="q()"
               (ngModelChange)="q.set($event)">
        <button *ngIf="q()" class="btn btn-outline-secondary" type="button" (click)="q.set('')">
          <i class="bi bi-x-circle"></i>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Entity</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of paginated()">
            <td class="truncate" [attr.title]="t.title">{{ t.title }}</td>
            <td class="truncate" [attr.title]="t.description">{{ t.description }}</td>
            <td>{{ t.dueDate | date:'mediumDate' }}</td>
            <td>
              <span class="badge" [ngClass]="t.isCompleted ? 'bg-success' : 'bg-warning text-dark'">
                {{ t.isCompleted ? 'Completed' : 'Pending' }}
              </span>
            </td>
            <td>{{ t.entityType }} ({{ t.entityId }})</td>
            <td class="text-end">
              <div class="d-flex justify-content-end align-items-center gap-1 action-buttons">
                <button class="btn btn-sm btn-outline-primary" title="Edit" (click)="edit(t)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Delete" (click)="confirmDelete(t.id)">
                  <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" title="View" (click)="view(t)">
                  <i class="bi bi-eye"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr *ngIf="paginated().length === 0">
            <td colspan="6" class="text-center text-muted">No tasks found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-2">
      <small class="text-secondary">
        Showing {{startIndex()}}–{{endIndex()}} of {{filtered().length}}
      </small>
      <div class="btn-group">
        <button class="btn btn-outline-light btn-sm"
                [disabled]="currentPage()===1"
                (click)="prevPage()">Prev</button>
        <button class="btn btn-outline-light btn-sm"
                [disabled]="currentPage()*pageSize>=filtered().length"
                (click)="nextPage()">Next</button>
      </div>
    </div>
  </ng-container>

  <!-- COMPACT MODE -->
  <ng-container *ngIf="mode === 'compact'">
    <div *ngIf="tasks().length === 0" class="text-muted fst-italic">No tasks yet.</div>
    <ul *ngIf="tasks().length > 0" class="list-group overflow-auto" style="max-height: 300px;">
      <li *ngFor="let t of tasks()" class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>{{ t.title }}</strong><br>
          <span class="text-secondary">{{ t.description }}</span><br>
          <small class="text-muted">{{ t.dueDate | date:'short' }}</small>
        </div>
        <div class="d-flex gap-2 align-items-center">
          <span [class]="t.isCompleted ? 'badge bg-success' : 'badge bg-warning text-dark'">
            {{ t.isCompleted ? 'Done' : 'Pending' }}
          </span>
          <button class="btn btn-sm btn-outline-primary" (click)="edit(t)" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(t.id)" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
          <button class="btn btn-sm btn-outline-info" (click)="view(t)" title="View">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </li>
    </ul>
  </ng-container>




  <!-- View Task Modal -->
  <div class="modal-backdrop fade show" *ngIf="selectedTask" style="z-index: 2000;"></div>
  <div class="modal fade show d-block" *ngIf="selectedTask" style="z-index: 2001;" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 rounded-4 shadow-lg">
        <div class="modal-header bg-primary text-white rounded-top-4 px-4 py-3">
          <h5 class="modal-title"><i class="bi bi-clipboard-check me-2 fs-5"></i> Task Information</h5>
          <button type="button" class="btn-close btn-close-white" (click)="selectedTask=null"></button>
        </div>
        <div class="modal-body bg-light px-4 py-4">
          <div class="row g-4">
            <div class="col-md-6"><label class="form-label fw-bold small">Title</label>
              <div class="p-3 rounded-3 bg-white border">{{ selectedTask.title }}</div>
            </div>
            <div class="col-md-6"><label class="form-label fw-bold small">Description</label>
              <div class="p-3 rounded-3 bg-white border">{{ selectedTask.description }}</div>
            </div>
            <div class="col-md-6"><label class="form-label fw-bold small">Due Date</label>
              <div class="p-3 rounded-3 bg-white border">{{ selectedTask.dueDate | date:'medium' }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold small">Status</label><br>
              <span class="badge px-3 py-2"
                    [ngClass]="selectedTask.isCompleted ? 'bg-success' : 'bg-warning text-dark'">
                {{ selectedTask .isCompleted ? 'Completed' : 'Pending' }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer bg-white">
          <button type="button" class="btn btn-outline-secondary" (click)="selectedTask=null">
            <i class="bi bi-x-circle me-1"></i> Close
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div class="modal-backdrop fade show" *ngIf="editing()" style="z-index: 2000;"></div>
  <div class="modal fade show d-block" *ngIf="editing()" style="z-index: 2001;" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <form #editForm="ngForm" (ngSubmit)="update()">
          <div class="modal-header">
            <h5 class="modal-title">Update Task</h5>
            <button type="button" class="btn-close" (click)="cancelEdit()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3"><label class="form-label">Title</label>
              <input type="text" class="form-control" [(ngModel)]="editTask!.title" name="title" required>
            </div>
            <div class="mb-3"><label class="form-label">Description</label>
              <textarea class="form-control" [(ngModel)]="editTask!.description" name="description"></textarea>
            </div>
            <div class="mb-3"><label class="form-label">Due Date</label>
              <input type="date" class="form-control" [(ngModel)]="editTask!.dueDate" name="dueDate">
            </div>
            <div class="form-check"><input type="checkbox" class="form-check-input" [(ngModel)]="editTask!.isCompleted" name="isCompleted">
              <label class="form-check-label">Completed</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid">Save</button>
            <button type="button" class="btn btn-secondary" (click)="cancelEdit()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Delete Modal -->
  <div class="modal-backdrop fade show" *ngIf="deleting()" style="z-index: 2000;"></div>
  <div class="modal fade show d-block" *ngIf="deleting()" style="z-index: 2001;" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">Confirm Delete</h5>
          <button type="button" class="btn-close" (click)="cancelDelete()"></button>
        </div>
        <div class="modal-body">Are you sure you want to delete this task?</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="cancelDelete()">Cancel</button>
          <button class="btn btn-danger" (click)="deleteConfirmed()">Delete</button>
        </div>
      </div>
    </div>
  </div>
  `
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

  // ngOnInit() {
  //   if (this.entityId) {
  //     this.loadTasks();
  //   }
  // }
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
  // private loadTasks() {
  //   this.ds.getTasks(this.entityType, this.entityId).subscribe(tasks => {
  //     this.tasks.set(tasks);
  //   });
  // }

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
  this.cdRef.detectChanges(); // Ensure view updates after changes
}
}