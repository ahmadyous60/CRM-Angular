import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Note } from '../../../models/note.model';
import { signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TruncatePipe } from './truncate.pipe';
import { HasPermissionDirective } from "../../../Directive/hasPermission.directive";

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TruncatePipe, HasPermissionDirective],
  templateUrl: './note-list.component.html',
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