import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/data.service';
import { NgFor, DatePipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Company } from '../../../models/company.model';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NgFor, DatePipe, NgIf],
  templateUrl: './companies-list.component.html'
})
export class CompaniesListComponent {
  // signals
  q = signal('');
  pageSize = signal(5);
  currentPage = signal(1);
  deleting = signal(false);
  editing = signal(false);
  editCompany: any = null;
  Math = Math;
  selectedId: string | null = null;
  selectedcompany: Company | null = null;

  companies: () => any[];

  constructor(public ds: DataService) {
    this.companies = this.ds.list<any>('companies');
  }

  // --- ngModel friendly wrappers ---
  get qValue() { return this.q(); }
  set qValue(val: string) { this.q.set(val); this.currentPage.set(1); }

  get pageSizeValue() { return this.pageSize(); }
  set pageSizeValue(val: number) { this.pageSize.set(+val); this.currentPage.set(1); }

  // filtered list
  filtered = computed(() => {
    const term = this.q().toLowerCase().trim();
    return this.companies().filter((c: any) =>
      !term || 
      c.name.toLowerCase().includes(term) || 
      (c.industry && c.industry.toLowerCase().includes(term))
    );
  });

  // paginated list
  page = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  remove(id: string){ 
    this.ds.remove('companies', id).subscribe(); 
  }

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
      this.ds.remove('companies', this.selectedId).subscribe(() => {
        this.selectedId = null;
        this.deleting.set(false);
      });
    }
  }


//Edit flow
edit(company: any) {
  this.editCompany = { ...company }; // clone object for safe editing
  this.editing.set(true);
}

cancelEdit() {
  this.editing.set(false);
  this.editCompany = null;
}

update() {
  if (!this.editCompany) return;

  this.ds.update<any>('companies', this.editCompany.id, this.editCompany)
    .subscribe(() => {
      this.editing.set(false);
      this.editCompany = null;
    });
}
// --- View flow ---
  view(company: Company): void {
    this.selectedcompany = company;
  
    const modalEl = document.getElementById('viewCompanyModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }
}
