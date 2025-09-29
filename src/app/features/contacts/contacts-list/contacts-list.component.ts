import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/data.service';
import { NgFor, DatePipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../models/contact.model';
import { Modal } from 'bootstrap';
import { TasksListComponent } from "../../Tasks/tasks-list/task-list.component";
import { NotesListComponent } from "../../Notes/notes-list/note-list.component";
import { EventsListComponent } from "../../Events/events-list/event-list.component";
import { HasPermissionDirective } from '../../../Directive/hasPermission.directive';
import { ExcelExportService } from '../../../core/excel-export.service';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NgFor, DatePipe, NgIf, TasksListComponent, NotesListComponent, EventsListComponent, HasPermissionDirective],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactsListComponent {

 
  // 🔧 State
  editing = signal(false);
  deleting = signal(false);
  editContact: Contact | null = null;
  q = signal('');
  pageSize = signal(5);
  currentPage = signal(1);
  selectedId: string | null = null;
  selectedcontact: Contact | null = null;
  Math = Math;

  // Contacts data
  contacts: () => Contact[];

  constructor(public ds: DataService , private excelExport: ExcelExportService) {
    this.contacts = this.ds.list<Contact>('contacts');
  }

  // 🔍 Filtering + Searching
  filtered = computed(() => {
    const term = this.q().toLowerCase().trim();
    const list = this.contacts();
    return list.filter(
      (c: Contact) =>
        !term ||
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  });

  // 📄 Pagination
  page = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((v) => v - 1);
    }
  }

  nextPage() {
    if (this.currentPage() * this.pageSize() < this.filtered().length) {
      this.currentPage.update((v) => v + 1);
    }
  }

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

  // --- Edit flow ---
  edit(contact: Contact) {
    this.editContact = { ...contact }; // clone ✅
    this.editing.set(true);
  }

  cancelEdit() {
    this.editing.set(false);
    this.editContact = null;
  }

  update() {
    if (!this.editContact) return;

    this.ds.update<Contact>('contacts', this.editContact.id, this.editContact).subscribe(() => {
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
  exportContatcts(){
    const data = this.contacts().map(contact => ({
      'First Name': contact.firstName,
      'Last Name': contact.lastName,
      'Email': contact.email,
      'Mobile': contact.mobile,
      'Date of Birth': contact.dob ? new Date(contact.dob).toLocaleDateString() : '',
      'Reporting To': contact.reportingTo,
      'Mailing City': contact.mailingCity,
      'Mailing Country': contact.mailingCountry,
    }));
    this.excelExport.exportToExcel(data, 'Contacts');
  }
}
