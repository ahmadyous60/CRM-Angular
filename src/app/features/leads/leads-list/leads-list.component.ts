import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/data.service';
import type { Lead} from '../../../core/models/lead.model';
import type { Task } from '../../../core/models/task.model';
import type { Note } from '../../../core/models/note.model';
import type { Event } from '../../../core/models/event.model';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Modal } from 'bootstrap';
import { productOptions } from '../../../core/models/product-options.const';
import { TasksListComponent } from '../../Tasks/tasks-list/task-list.component';
import { NotesListComponent } from "../../Notes/notes-list/note-list.component";
import { EventsListComponent } from "../../Events/events-list/event-list.component";

@Component({
  selector: 'app-leads-list',
  standalone: true,
  styleUrls: ['./lead-list.scss'],
  imports: [RouterLink, FormsModule, NgFor, DatePipe, NgIf, CommonModule, TasksListComponent, NotesListComponent, EventsListComponent],
  templateUrl: './leads-list.component.html',
})
export class LeadsListComponent {
  statuses: Lead['status'][] = ['New', 'Qualified', 'Won', 'Lost'];
  sources: Lead['source'][] = ['Cold Call', 'Email', 'Referral', 'Website'];
  productCategories: string[] = Object.keys(productOptions);
  availableProducts: string[] = [];
  Math = Math;

  selectedId: string | null = null;
  selectedLead: Lead | null = null;

  tasks: Task[] = [];
  notes: Note[] = [];
  events: Event[] = [];

  editing = signal(false);
  deleting = signal(false);

  editLead: Lead | null = null;

  q = signal('');
  status = signal('');
  pageSize = signal(5);
  currentPage = signal(1);

  sortKey: keyof Lead = 'createdAt';
  sortDir: 'asc' | 'desc' = 'desc';

  leads: () => Lead[];

  constructor(public ds: DataService ) {
    this.leads = this.ds.list<Lead>('leads');
  
  }
  // -------------------
  // Filtering + Sorting
  // -------------------
  filtered = computed(() => {
    const term = this.q().toLowerCase().trim();
    let arr = this.leads().filter((l: Lead) =>
      (!term || l.name.toLowerCase().includes(term) || l.email.toLowerCase().includes(term)) &&
      (!this.status() || l.status === this.status() as any)
    );
    arr = arr.sort((a: any, b: any) => {
      const A = (a[this.sortKey] ?? '').toString().toLowerCase();
      const B = (b[this.sortKey] ?? '').toString().toLowerCase();
      return (A < B ? -1 : A > B ? 1 : 0) * (this.sortDir === 'asc' ? 1 : -1);
    });
    return arr;
  });

  page = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  sortBy(key: keyof Lead) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
  }

  // -------------------
  // Delete flow
  // -------------------
  confirmDelete(id: string) {
    this.selectedId = id;
    this.deleting.set(true);
  }

  cancelDelete() {
    this.selectedId = null;
    this.deleting.set(false);
  }

  deleteConfirmed() {
    if (this.selectedId) {
      this.ds.remove('leads', this.selectedId).subscribe(() => {
        this.selectedId = null;
        this.deleting.set(false);
      });
    }
  }

  // -------------------
  // Pagination
  // -------------------
  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(v => v - 1);
    }
  }

  nextPage() {
    if (this.currentPage() * this.pageSize() < this.filtered().length) {
      this.currentPage.update(v => v + 1);
    }
  }

  // -------------------
  // Edit flow
  // -------------------
edit(lead: Lead) {
  this.editLead = { ...lead };
  this.updateAvailableProducts(lead.productCategory);
  this.editing.set(true);
}

// Cancel edit
cancelEdit() {
  this.editLead = null;
  this.editing.set(false);
}

// Update lead
update() {
  if (!this.editLead) return;

  this.ds.update<Lead>('leads', this.editLead.id, this.editLead)
    .subscribe({
      next: () => {
        // Update local leads array so table reflects changes immediately
        const idx = this.leads().findIndex(l => l.id === this.editLead!.id);
        if (idx > -1) this.leads()[idx] = { ...this.editLead! };

        this.editing.set(false);
        this.editLead = null;
      },
      error: err => console.error('Update failed', err)
    });
}

// Handle product category change
onCategoryChange(category: string) {
  this.updateAvailableProducts(category);
  if (!this.availableProducts.includes(this.editLead!.product)) {
    this.editLead!.product = this.availableProducts[0] || '';
  }
}

updateAvailableProducts(category: string) {
  this.availableProducts = [...(productOptions[category as keyof typeof productOptions] || [])];
}


  // -------------------
  // Excel Export
  // -------------------
  exportToExcel() {
    const data = this.filtered().map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Status: lead.status,
      Source: lead.source,
      Product: lead.product,
      CreatedAt: new Date(lead.createdAt).toLocaleString()
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const filename = `leads_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename);
  }

  // -------------------
  // View Lead + Load Related
  // -------------------
  view(lead: Lead): void {
    this.selectedLead = lead;

    if (lead.id) {
      this.ds.getNotes("Lead", lead.id).subscribe(res => this.notes = res);
      this.ds.getEvents("Lead", lead.id).subscribe(res => this.events = res);
    }

    const modalEl = document.getElementById('viewLeadModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }

  trackByLead(index: number, lead: Lead): string {
  return lead.id;
}

getStatusBadgeClass(status: Lead['status']): string {
  switch (status) {
    case 'New': return 'bg-primary';
    case 'Qualified': return 'bg-success';
    case 'Won': return 'bg-info';
    case 'Lost': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

}