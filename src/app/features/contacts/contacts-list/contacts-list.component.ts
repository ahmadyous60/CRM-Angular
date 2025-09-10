import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/data.service';
import { NgFor, DatePipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../core/model';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NgFor, DatePipe, NgIf],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="mb-0">Contacts</h3>
    <a routerLink="/contacts/new" class="btn btn-primary">
      <i class="bi bi-plus-lg"></i> New Contact
    </a>
  </div>

  <div class="card p-3">
 <div class="mb-3">
    <div class="row g-2">
      <div class="col-12">
        <div class="input-group">
          <input type="text" class="form-control" 
                 placeholder="Search name or email"
                 [ngModel]="q()" 
                 (ngModelChange)="q.set($event)">
          <button *ngIf="q()" class="btn btn-outline-secondary" type="button" (click)="q.set('')">
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Created</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let contact of page()">
            <td>{{contact.firstName}} {{contact.lastName}}</td>
            <td>{{contact.email}}</td>
            <td>{{contact.phone || '-'}}</td>
            <td>{{contact.createdAt | date:'medium'}}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-primary me-0" (click)="edit(contact)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger ms-2" (click)="confirmDelete(contact.id)">
                <i class="bi bi-trash"></i>
              </button>
              <button class="btn btn-sm btn-outline-info ms-2" (click)="view(contact)">
              <i class="bi bi-eye"></i>
            </button>
            </td>
          </tr>
          <tr *ngIf="page().length===0">
            <td colspan="5" class="text-center text-muted py-4">No results</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-between align-items-center">
      <small class="text-secondary">
        Showing {{(currentPage()-1)*pageSize()+1}}–{{Math.min(currentPage()*pageSize(), filtered().length)}} 
        of {{filtered().length}}
      </small>
      <div class="btn-group">
        <button class="btn btn-outline-light btn-sm" [disabled]="currentPage()===1" (click)="prevPage()">Prev</button>
        <button class="btn btn-outline-light btn-sm" [disabled]="currentPage()*pageSize()>=filtered().length" (click)="nextPage()">Next</button>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal fade show d-block" *ngIf="editing()" style="background: rgba(0,0,0,0.5);" tabindex="-1" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Update Contact</h5>
            <button type="button" class="btn-close" (click)="cancelEdit()"></button>
          </div>
          <div class="modal-body">
            <form #editForm="ngForm" (ngSubmit)="update()">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" [(ngModel)]="editContact.firstName" name="firstName" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" [(ngModel)]="editContact.email" name="email">
              </div>
              <div class="mb-3">
                <label class="form-label">Phone</label>
                <input type="text" class="form-control" [(ngModel)]="editContact.phone" name="phone">
              </div>
              <div class="d-flex justify-content-end">
                <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid">Save Changes</button>
                <button type="button" class="btn btn-secondary ms-2" (click)="cancelEdit()">Cancel</button>
              </div>
            </form>
          </div>
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
            Are you sure you want to delete this Company?
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cancelDelete()">Cancel</button>
            <button class="btn btn-danger" (click)="deleteConfirmed()">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- View Contact Modal -->
<div class="modal fade" id="viewContactModal" tabindex="-1" aria-labelledby="viewContactLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 rounded-4 shadow-lg">
      
      <!-- Header -->
      <div class="modal-header bg-primary text-white rounded-top-4 px-4 py-3">
        <h5 class="modal-title fw-semibold d-flex align-items-center" id="viewContactLabel">
          <i class="bi bi-person-lines-fill me-2 fs-5"></i> Contact Information
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <!-- Body -->
      <div class="modal-body bg-light px-4 py-4">
        <div *ngIf="selectedcontact" class="row g-4">
          
          <!-- Name -->
          <div class="col-md-6">
            <label class="form-label fw-bold text-secondary small mb-1">Full Name</label>
            <div class="p-3 rounded-3 bg-white shadow-sm border">
              <i class="bi bi-person-fill text-primary me-2"></i> {{ selectedcontact.firstName }} {{ selectedcontact.lastName }}
            </div>
          </div>

          <!-- Email -->
          <div class="col-md-6">
            <label class="form-label fw-bold text-secondary small mb-1">Email Address</label>
            <div class="p-3 rounded-3 bg-white shadow-sm border">
              <i class="bi bi-envelope-fill text-danger me-2"></i> {{ selectedcontact.email }}
            </div>
          </div>

          <!-- Phone -->
          <div class="col-md-6">
            <label class="form-label fw-bold text-secondary small mb-1">Phone Number</label>
            <div class="p-3 rounded-3 bg-white shadow-sm border">
              <i class="bi bi-telephone-fill text-success me-2"></i> {{ selectedcontact.phone }}
            </div>
          </div>

          <!-- Created -->
          <div class="col-md-6">
            <label class="form-label fw-bold text-secondary small mb-1">Created At</label>
            <div class="p-3 rounded-3 bg-white shadow-sm border">
              <i class="bi bi-calendar-event text-primary me-2"></i> 
              {{ selectedcontact.createdAt | date:'medium' }}
            </div>
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
export class ContactsListComponent {
  editing = signal(false);
  deleting = signal(false);
  editContact: any = null;
  q = signal('');
  pageSize = signal(5);
  currentPage = signal(1);
  selectedId: string | null = null;
  selectedcontact: Contact | null = null;
  Math = Math;

  contacts: () => any[];

  constructor(public ds: DataService) {
    this.contacts = this.ds.list<any>('contacts');
  }

  // 🔍 Filtering + Searching
  filtered = computed(() => {
    const term = this.q().toLowerCase().trim();
    const list = this.contacts();
    return list.filter((c: any) =>
      !term || 
      c.firstName.toLowerCase().includes(term) || 
      c.lastName.toLowerCase().includes(term) || 
      c.email.toLowerCase().includes(term)
    );
  });

  // 📄 Pagination
  page = computed(() => {
    const start = (this.currentPage()-1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  remove(id: string){ 
    this.ds.remove('contacts', id).subscribe(); 
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(v => v-1);
    }
  }

  nextPage() {
    if (this.currentPage() * this.pageSize() < this.filtered().length) {
      this.currentPage.update(v => v+1);
    }
  }

  // ✅ PageSize change hone par page reset
  changePageSize(size: number) {
    this.pageSize.set(+size);
    this.currentPage.set(1);
  }
  // --- Delete flow ---
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
      this.ds.remove('contacts', this.selectedId).subscribe(() => {
        this.selectedId = null;
        this.deleting.set(false);
      });
    }
  }

  //Edit Flow
  edit(contact: any) {
    this.editContact = { ...contact }; // clone object for safe editing ✅
    this.editing.set(true);
  }

  cancelEdit() {
    this.editing.set(false);
    this.editContact = null;
  }

  update() {
    if (!this.editContact) return;

    this.ds.update<any>('contacts', this.editContact.id, this.editContact) 
      .subscribe(() => {
        this.editing.set(false);
        this.editContact = null;
      });
  }
  // --- View flow ---
  view(contact: Contact): void {
    this.selectedcontact = contact;
  
    const modalEl = document.getElementById('viewContactModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }
}
