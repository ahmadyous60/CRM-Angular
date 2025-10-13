import { Component, computed, signal } from '@angular/core';
import { DataService } from '../../../services/data.service';
import type { Lead} from '../../../models/lead.model';
import type { Task } from '../../../models/task.model';
import type { Note } from '../../../models/note.model';
import type { Event } from '../../../models/event.model';
import { Modal } from 'bootstrap';
import { productOptions } from '../../../models/product-options.const';
import { TasksListComponent } from '../../tasks/tasks-list/task-list.component';
import { NotesListComponent } from "../../notes/notes-list/note-list.component";
import { EventsListComponent } from "../../events/events-list/event-list.component";
import { ExcelExportService } from '../../../services/excel-export.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HasPermissionDirective } from '../../../Directive/hasPermission.directive';

@Component({
  selector: 'app-leads-list',
  standalone: true,
  styleUrls: ['./lead-list.scss'],
  imports: [CommonModule, FormsModule, RouterModule, HasPermissionDirective, TasksListComponent, NotesListComponent, EventsListComponent],
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

  constructor(public ds: DataService , private excelExport: ExcelExportService) {
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
  exportLeads() {
    const data = this.filtered().map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Status: lead.status,
      Source: lead.source,
      Product: lead.product
    }));
    this.excelExport.exportToExcel(data, 'Leads');
  }

  // -------------------
  // View Lead + Load Related
  // -------------------
  view(lead: Lead): void {
    this.selectedLead = lead;

    if (lead.id) {
      this.ds.getNotes("Lead", lead.id).subscribe(res => this.notes = res);
      this.ds.getEvents("Lead", lead.id).subscribe(res => this.events = res);
      this.ds.getTasks("Lead", lead.id).subscribe(res => this.tasks = res);
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