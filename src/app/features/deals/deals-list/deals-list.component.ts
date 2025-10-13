import { Component, computed, signal } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Deal } from '../../../models/deal.model';
import { Modal } from 'bootstrap';
import { AuthService } from '../../../services/auth.service';
import { ExcelExportService } from '../../../services/excel-export.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HasPermissionDirective } from '../../../Directive/hasPermission.directive';

@Component({
  standalone: true,
  selector: 'app-deals-list',
  imports: [CommonModule, FormsModule, RouterModule, HasPermissionDirective],
  templateUrl: './deals-list.component.html',
})
export class DealsListComponent {
  editing = signal(false);
  editDeal: any = null; 
  selectedId: string | null = null;
  selecteddeal: Deal | null = null;

  q = signal('');
  page = signal(1);
  pageSize = 5;
  deleting = signal(false);

  deals: () => any[];
  filtered: () => any[];
  paginated: () => any[];
  totalPages: () => number;

  constructor(private ds: DataService, public auth: AuthService, private excelExport: ExcelExportService) {
    this.deals = this.ds.list<any>('deals');

    this.filtered = computed(() => {
      const res = this.deals().filter(d =>
        d.title.toLowerCase().includes(this.q().toLowerCase())
      );
      const maxPage = Math.max(1, Math.ceil(res.length / this.pageSize));
      if (this.page() > maxPage) this.page.set(maxPage);
      return res;
    });

    this.totalPages = computed(() =>
      Math.max(1, Math.ceil(this.filtered().length / this.pageSize))
    );

    this.paginated = computed(() => {
      const start = (this.page() - 1) * this.pageSize;
      return this.filtered().slice(start, start + this.pageSize);
    });
  }

  currentPage() { return this.page(); }
  startIndex() { return this.filtered().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1; }
  endIndex() { return Math.min(this.currentPage() * this.pageSize, this.filtered().length); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages()) this.page.set(p); }
  prevPage() { if (this.page() > 1) this.page.update(v => v - 1); }
  nextPage() { if (this.page() < this.totalPages()) this.page.update(v => v + 1); }

  rm(id: string) {
    this.ds.remove('deals', id).subscribe(() => {
      if (this.paginated().length === 0 && this.page() > 1) {
        this.page.update(v => v - 1);
      }
    });
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
      this.ds.remove('deals', this.selectedId).subscribe(() => {
        this.selectedId = null;
        this.deleting.set(false);
      });
    }
  }

 //Edit
  edit(deal: any) {
    this.editDeal = { ...deal }; 
    this.editing.set(true);
  }

  cancelEdit() {
    this.editing.set(false);
    this.editDeal = null;
  }

  update() {
    if (!this.editDeal) return;
    this.ds.update<any>('deals', this.editDeal.id, this.editDeal) 
      .subscribe(() => {
        this.editing.set(false);
        this.editDeal = null;
      });
  }

// --- View flow ---
view(deal: Deal): void {
  this.selecteddeal = deal;

  const modalEl = document.getElementById('viewDealModal');
  if (modalEl) {
    const modal = new Modal(modalEl);
    modal.show();
  }
}
exportDeals(){
  const dataToExport = this.filtered().map(deal => ({
    Title: deal.title,
    Amount: deal.amount,
    Stage: deal.stage
  }));
  this.excelExport.exportToExcel(dataToExport, 'deals');

}
  
}
