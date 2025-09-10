import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/data.service';
import type { Lead, Task, Note, Event } from '../../../core/model';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Modal } from 'bootstrap';
import { productOptions} from "../../../core/model";
import { TasksListComponent } from '../../Tasks/tasks-list/task-list.component';
import { NotesListComponent } from "../../Notes/notes-list/note-list.component";
import { EventsListComponent } from "../../Events/events-list/event-list.component";

@Component({
  selector: 'app-leads-list',
  standalone: true,
  styleUrls: ['./lead-list.scss'],
  imports: [RouterLink, FormsModule, NgFor, DatePipe, NgIf, CommonModule, TasksListComponent, NotesListComponent, EventsListComponent],
  template: `
         <div class="d-flex justify-content-between align-items-center mb-3">
  <h3 class="mb-0">Leads</h3>
  <div>
    <button class="btn btn-success me-2" (click)="exportToExcel()">
      <i class="bi bi-file-earmark-excel"></i> Export
    </button>
    <a routerLink="/leads/new" class="btn btn-primary">
      <i class="bi bi-plus-lg"></i> New Lead
    </a>
  </div>
</div>

<div class="card p-3">
  <!-- Filters -->
<div class="row g-2 mb-3">
  <div class="col-md-10">
    <div class="input-group">
      <input type="text"
             class="form-control"
             placeholder="Search name or email"
             [ngModel]="q()"
             (ngModelChange)="q.set($event)">

      <button *ngIf="q()" 
              type="button" 
              class="btn btn-outline-secondary"
              (click)="q.set('')">
        <i class="bi bi-x-circle"></i>
      </button>
    </div>
  </div>
    <div class="col-md-2">
      <select class="form-select"
              [ngModel]="status()"
              (ngModelChange)="status.set($event)">
        <option value="">All Statuses</option>
        <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
      </select>
    </div>
  </div>

  <!-- Table -->
  
  <div class="table-responsive">
  <table class="table table-hover align-middle">
    <thead class="table-light">
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Status</th>
        <th>Source</th>
        <th>Product Category</th>
        <th>Product</th>
        <th (click)="sortBy('createdAt')" role="button" style="cursor: pointer;" aria-label="Sort by Created Date">
          Created <i class="bi bi-sort-down ms-1"></i>
        </th>
        <th class="text-end">Actions</th>
      </tr>
    </thead>

    <tbody>
      <tr *ngFor="let lead of page(); trackBy: trackByLead">
        <td class="text-truncate" style="max-width: 150px;">{{ lead.name }}</td>
        <td class="text-truncate" style="max-width: 200px;">{{ lead.email }}</td>
        <td>{{ lead.phone }}</td>
        <td>
          <span class="badge" [ngClass]="getStatusBadgeClass(lead.status)">
            {{ lead.status }}
          </span>
        </td>
        <td>{{ lead.source }}</td>
        <td>{{ lead.productCategory }}</td>
        <td>{{ lead.product }}</td>
        <td class="created-date-cell">{{ lead.createdAt | date: 'medium' }}</td>
        <td class="text-end">
          <div class="btn-group btn-group-sm" role="group" aria-label="Lead Actions">
            <button class="btn btn-outline-primary ms-2" (click)="edit(lead)" title="Edit Lead">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" (click)="confirmDelete(lead.id)" title="Delete Lead">
              <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-outline-info" (click)="view(lead)" title="View Lead">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </td>
      </tr>

      <tr *ngIf="page().length === 0">
        <td colspan="9" class="text-center text-muted py-4">
          <i class="bi bi-search fs-4 d-block mb-2"></i>
          No results found
        </td>
      </tr>
    </tbody>
  </table>
</div>


  <!-- Pagination -->
  <div class="d-flex justify-content-between align-items-center mt-3">
    <small class="text-secondary">
      Showing {{ (currentPage() - 1) * pageSize() + 1 }}–
      {{ Math.min(currentPage() * pageSize(), filtered().length) }}
      of {{ filtered().length }}
    </small>
    <div class="btn-group">
      <button class="btn btn-outline-light btn-sm"
              [disabled]="currentPage() === 1"
              (click)="prevPage()">Prev</button>
      <button class="btn btn-outline-light btn-sm"
              [disabled]="currentPage() * pageSize() >= filtered().length"
              (click)="nextPage()">Next</button>
    </div>
  </div>

  <!-- Edit Modal -->
<div class="modal fade show d-block" *ngIf="editing()" style="background: rgba(0,0,0,0.5);" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <form #editForm="ngForm" (ngSubmit)="update()">
        <div class="modal-header">
          <h5 class="modal-title">Update Lead</h5>
          <button type="button" class="btn-close" (click)="cancelEdit()"></button>
        </div>

        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input type="text" class="form-control" [(ngModel)]="editLead!.name" name="name" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" [(ngModel)]="editLead!.email" name="email" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input type="text" class="form-control" [(ngModel)]="editLead!.phone" name="phone">
          </div>

          <div class="mb-3">
            <label class="form-label">Status</label>
            <select class="form-select" [(ngModel)]="editLead!.status" name="status">
              <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Source</label>
            <select class="form-select" [(ngModel)]="editLead!.source" name="source">
              <option *ngFor="let s of sources" [value]="s">{{ s }}</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Product Category</label>
            <select class="form-select" [(ngModel)]="editLead!.productCategory" name="productCategory" 
                    (ngModelChange)="onCategoryChange($event)">
              <option *ngFor="let c of productCategories" [value]="c">{{ c }}</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Product</label>
            <select class="form-select" [(ngModel)]="editLead!.product" name="product">
              <option *ngFor="let p of availableProducts" [value]="p">{{ p }}</option>
            </select>
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
  <div class="modal fade show d-block" *ngIf="deleting()" style="background: rgba(0,0,0,0.5);" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm Delete</h5>
          <button type="button" class="btn-close" (click)="cancelDelete()"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this lead?
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="cancelDelete()">Cancel</button>
          <button class="btn btn-danger" (click)="deleteConfirmed()">Delete</button>
        </div>
      </div>
    </div>
  </div>
</div>

      <!-- View Lead Modal -->

  <div class="modal fade" id="viewLeadModal" tabindex="-1" aria-labelledby="viewLeadLabel" aria-hidden="true">
      
    <div class="modal-dialog modal-lg modal-dialog-centered custom-modal-width">
        <div class="modal-content border-0 rounded-4 shadow-lg">

          <!-- Header -->
          <div class="modal-header bg-primary text-white rounded-top-4 px-4 py-3">
            <h5 class="modal-title fw-semibold d-flex align-items-center" id="viewLeadLabel">
              <i class="bi bi-person-vcard-fill me-2 fs-5"></i> Lead Information
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <!-- Body -->
          <div class="modal-body bg-light px-4 py-4">

            <!-- Tabs Navigation -->
            <ul class="nav nav-tabs mb-4" id="leadTab" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active text-secondary" id="details-tab" data-bs-toggle="tab" data-bs-target="#details" type="button" role="tab">
                  <i class="bi bi-card-list me-1"></i> Details
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link text-secondary" id="tasks-tab" data-bs-toggle="tab" data-bs-target="#tasks" type="button" role="tab">
                  <i class="bi bi-check2-square me-1"></i> Tasks
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link text-secondary" id="notes-tab" data-bs-toggle="tab" data-bs-target="#notes" type="button" role="tab">
                  <i class="bi bi-journal-text me-1"></i> Notes
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link text-secondary" id="events-tab" data-bs-toggle="tab" data-bs-target="#events" type="button" role="tab">
                  <i class="bi bi-calendar-event me-1"></i> Events
                </button>
              </li>
            </ul>

            <!-- Tabs Content -->
            <div class="tab-content" id="leadTabContent">

              <!-- Details Tab -->
              <div class="tab-pane fade show active" id="details" role="tabpanel">
                <div class="row g-4">

                  <div class="col-md-6">
                    <label class="form-label fw-bold text-secondary small mb-1">Full Name</label>
                    <div class="p-3 rounded-3 bg-white shadow-sm border">
                      <i class="bi bi-person-fill text-primary me-2"></i> {{ selectedLead?.name }}
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold text-secondary small mb-1">Email Address</label>
                    <div class="p-3 rounded-3 bg-white shadow-sm border">
                      <i class="bi bi-envelope-fill text-danger me-2"></i> {{ selectedLead?.email }}
                    </div>
                  </div>  

                  <div class="col-md-6">
                    <label class="form-label fw-bold text-secondary small mb-1">Phone Number</label>
                    <div class="p-3 rounded-3 bg-white shadow-sm border">
                      <i class="bi bi-telephone-fill text-success me-2"></i> {{ selectedLead?.phone }}
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold text-secondary small mb-1">Status</label>
                    <div>
                      <span class="badge rounded-pill px-3 py-2 fs-6"
                        [ngClass]="{
                          'bg-success': selectedLead?.status === 'Won',
                          'bg-danger': selectedLead?.status === 'Lost',
                          'bg-warning text-dark': selectedLead?.status === 'Qualified',
                          'bg-secondary': selectedLead?.status === 'New'
                        }">
                        {{ selectedLead?.status }}
                      </span>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold text-secondary small mb-1">Lead Source</label>
                    <div class="p-3 rounded-3 bg-white shadow-sm border">
                      <i class="bi bi-globe2 text-info me-2"></i> {{ selectedLead?.source }}
                    </div>
                  </div>

                 <div class="col-md-6">
                    <label class="form-label fw-bold text-secondary small mb-1">Product Category</label>
                    <div class="p-3 rounded-3 bg-white shadow-sm border">
                      <i class="bi bi-box-seam text-warning me-2"></i> {{ selectedLead?.productCategory }}
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold text-secondary small mb-1">Product</label>
                    <div class="p-3 rounded-3 bg-white shadow-sm border">
                      <i class="bi bi-box text-info me-2"></i> {{ selectedLead?.product }}
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-bold text-secondary small mb-1">Created At</label>
                    <div class="p-3 rounded-3 bg-white shadow-sm border">
                      <i class="bi bi-calendar-event text-primary me-2"></i> {{ selectedLead?.createdAt | date:'medium' }}
                    </div>
                  </div>

                </div>
              </div>


            <!-- Tasks Tab -->
                  <div class="tab-pane fade" id="tasks" role="tabpanel">
                    <app-tasks-list
                      *ngIf="selectedLead?.id"
                      [entityType]="'Lead'" 
                      [entityId]="selectedLead?.id || ''"
                      mode="compact">
                    </app-tasks-list>
                  </div>
                <!-- Notes Tab -->
                <div class="tab-pane fade" id="notes" role="tabpanel">
                    <app-notes-list
                      *ngIf="selectedLead?.id"
                      [entityType]="'Lead'" 
                      [entityId]="selectedLead?.id || ''"
                      mode="compact">
                    </app-notes-list>
                  </div>

              <!-- Events Tab -->
              <div class="tab-pane fade" id="events" role="tabpanel">
                    <app-events-list
                      *ngIf="selectedLead?.id"
                      [entityType]="'Lead'" 
                      [entityId]="selectedLead?.id || ''"
                      mode="compact">
                    </app-events-list>
                  </div>

            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer bg-white rounded-bottom-4 px-4 py-3 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-1"></i> Close
            </button>
          </div>

        </div>
      </div>
    </div>
  `
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