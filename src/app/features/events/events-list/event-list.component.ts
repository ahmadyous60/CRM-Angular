import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Event } from '../../../models/event.model';
import { signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HasPermissionDirective } from "../../../Directive/hasPermission.directive";

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HasPermissionDirective],
  templateUrl: `./event-list.component.html`
})
export class EventsListComponent implements OnInit, OnChanges {
  @Input() entityType: string = 'Lead';
  @Input() entityId?: string;
  @Input() mode: 'full' | 'compact' = 'full';

  events = signal<Event[]>([]);
  q = signal('');
  page = signal(1);
  editing = signal(false);
  deleting = signal(false);

  readonly pageSize = 5;
  editEvent: Event | null = null;
  selectedId: string | null = null;

  constructor(private ds: DataService) {}

  ngOnInit() {
    this.loadEvents();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['entityId'] || changes['entityType']) {
      this.loadEvents();
    }
  }

 private loadEvents() {
  const source$ = this.entityId
    ? this.ds.getEvents(this.entityType, this.entityId)
    : this.ds.getAllEvents();

  source$.subscribe({
    next: events => {
      console.log('Fetched events:', events);
      this.events.set(events);
    },
    error: err => {
      console.error('Error loading events:', err);
      this.events.set([]);
    }
  });
}

    filtered = computed(() => {
    const query = this.q().trim().toLowerCase();
    return this.events().filter(event =>
      event.subject?.toLowerCase().includes(query)
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
  edit(event: Event) {
    this.editEvent = { ...event };
    this.editing.set(true);
  }

  cancelEdit() {
    this.editEvent = null;
    this.editing.set(false);
  }

  update() {
    if (!this.editEvent) return;

    this.ds.updateEvent(this.editEvent).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadEvents();
      },
      error: err => console.error('Update failed:', err)
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

    this.ds.deleteEvent(this.selectedId).subscribe({
      next: () => {
        this.cancelDelete();
        this.loadEvents();
      },
      error: err => console.error('Delete failed:', err)
    });
  }

 
}
