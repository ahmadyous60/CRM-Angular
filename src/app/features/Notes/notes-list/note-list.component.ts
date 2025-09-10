import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { DataService } from '../../../core/data.service';
import { Note } from '../../../core/model';
import { TruncatePipe } from './truncate.pipe';
import { signal, computed } from '@angular/core';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NgFor, DatePipe, NgIf, CommonModule, TruncatePipe],
  template: `
    <!-- FULL MODE -->
    <ng-container *ngIf="mode === 'full'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>Notes</h3>
        <a routerLink="/notes/new" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i> New Note
        </a>
      </div>

      <!-- Search -->
      <div class="card p-3 mb-3">
        <div class="input-group">
          <input type="text" class="form-control"
                 placeholder="Search content"
                 [ngModel]="q()"
                 (ngModelChange)="q.set($event)">
          <button *ngIf="q()" class="btn btn-outline-secondary" type="button" (click)="q.set('')">
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      </div>

      <!-- Notes Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>Content</th>
              <th>Entity</th>
              <th>Created At</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let note of paginated()">
              <td class="truncate" [attr.title]="note.content">{{ note.content | truncate:100 }}</td>
              <td>{{ note.entityType }} ({{ note.entityId }})</td>
              <td>{{ note.createdAt | date:'medium' }}</td>
              <td class="text-end">
                <div class="d-flex gap-1 justify-content-end">
                  <button class="btn btn-sm btn-outline-primary" (click)="edit(note)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(note.id)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="paginated().length === 0">
              <td colspan="4" class="text-center text-muted">No notes found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-2">
        <small class="text-secondary">
          Showing {{ startIndex() }}–{{ endIndex() }} of {{ filtered().length }}
        </small>
        <div class="btn-group">
          <button class="btn btn-outline-light btn-sm" [disabled]="currentPage()===1" (click)="prevPage()">Prev</button>
          <button class="btn btn-outline-light btn-sm" [disabled]="currentPage()*pageSize>=filtered().length" (click)="nextPage()">Next</button>
        </div>
      </div>
    </ng-container>

    <!-- COMPACT MODE -->
    <ng-container *ngIf="mode === 'compact'">
      <div *ngIf="notes().length === 0" class="text-muted fst-italic">No notes yet.</div>
      <ul *ngIf="notes().length > 0" class="list-group overflow-auto" style="max-height:300px;">
        <li *ngFor="let note of notes()" class="list-group-item">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <p class="mb-1">{{ note.content }}</p>
              <small class="text-muted">{{ note.createdAt | date:'short' }}</small>
            </div>
            <div class="d-flex gap-2 align-items-center">
              <button class="btn btn-sm btn-outline-primary" (click)="edit(note)" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(note.id)" title="Delete">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </ng-container>

    <!-- EDIT MODAL -->
    <div class="modal-backdrop fade show" *ngIf="editing()" style="z-index:2000;"></div>
    <div class="modal fade show d-block" *ngIf="editing()" style="z-index:2001;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form #editForm="ngForm" (ngSubmit)="update()">
            <div class="modal-header">
              <h5 class="modal-title">Update Note</h5>
              <button type="button" class="btn-close" (click)="cancelEdit()"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Content</label>
                <textarea class="form-control" rows="5" [(ngModel)]="editNote!.content" name="content" required></textarea>
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

    <!-- DELETE MODAL -->
    <div class="modal-backdrop fade show" *ngIf="deleting()" style="z-index:2000;"></div>
    <div class="modal fade show d-block" *ngIf="deleting()" style="z-index:2001;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close" (click)="cancelDelete()"></button>
          </div>
          <div class="modal-body">Are you sure you want to delete this note?</div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cancelDelete()">Cancel</button>
            <button class="btn btn-danger" (click)="deleteConfirmed()">Delete</button>
          </div>
        </div>
      </div>
    </div>
  
  `
})

export class NotesListComponent implements OnInit, OnChanges {
  @Input() entityType: string = 'Lead';
  @Input() entityId?: string;
  @Input() mode: 'full' | 'compact' = 'full';

  // Signals
  notes = signal<Note[]>([]);
  q = signal('');
  page = signal(1);
  editing = signal(false);
  deleting = signal(false);

  readonly pageSize = 5;
  editNote: Note | null = null;
  selectedId: string | null = null;

  constructor(private ds: DataService) {}

  // ---------------- Lifecycle ---------------- //
  ngOnInit() {
    this.loadNotes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['entityId'] || changes['entityType']) {
      this.loadNotes();
    }
  }

  // ---------------- Data Loading ---------------- //
  private loadNotes() {
    const source$ = this.entityId
      ? this.ds.getNotes(this.entityType, this.entityId)
      : this.ds.getAllNotes();

    source$.subscribe({
      next: notes => this.notes.set(notes),
      error: () => this.notes.set([]),
    });
  }

  // ---------------- Filtering & Pagination ---------------- //
  filtered = computed(() => {
    const query = this.q().trim().toLowerCase();
    return this.notes().filter(note =>
      note.content?.toLowerCase().includes(query)
    );
  });

  paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  currentPage = () => this.page();
  startIndex = () => this.filtered().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1;
  endIndex = () => Math.min(this.currentPage() * this.pageSize, this.filtered().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));

  prevPage = () => this.page.update(v => Math.max(1, v - 1));
  nextPage = () => this.page.update(v => Math.min(this.totalPages(), v + 1));

  // ---------------- Edit / Delete ---------------- //
  edit(note: Note) {
    this.editNote = { ...note };
    this.editing.set(true);
  }

  cancelEdit() {
    this.editNote = null;
    this.editing.set(false);
  }

  update() {
  if (!this.editNote) return;
  console.log('Updating note:', this.editNote);
  this.ds.updateNote(this.editNote!).subscribe({
  next: () => {
    this.cancelEdit();
    this.loadNotes();
  },
});
    
}

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

  this.ds.deleteNote(this.selectedId).subscribe({
    next: () => {
      this.cancelDelete();
      this.loadNotes();
    },
  });
}
}