import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { AuditLogsService } from '../../../services/audit-logs.service';

declare var bootstrap: any;

@Component({
  selector: 'app-request-audit-logs',
  templateUrl: './request-audit-logs.component.html',
  standalone: true,
  imports: [FormsModule, DatePipe, NgFor, NgIf, CommonModule]
})
export class RequestAuditLogsComponent implements OnInit {
  logs: any[] = [];
  selectedLog: any = null;
  searchText: string = '';
  dateFilter: string = '';
  Math = Math;

  pageSizeValue: number = 10;
  currentPageValue: number = 1;

  constructor(private auditLogsService: AuditLogsService) {}

  ngOnInit(): void {
    this.loadRequestLogs();
  }

  loadRequestLogs(): void {
    this.auditLogsService.getAllLogs().subscribe({
      next: (res: any) => {
        this.logs = res.requestLogs || res || [];
      },
      error: (err) => {
        console.error('Error loading request logs:', err);
      }
    });
  }

  filtered(): any[] {
    let filteredLogs = this.logs;

    if (this.searchText) {
      const q = this.searchText.toLowerCase();
      filteredLogs = filteredLogs.filter(
        log =>
          (log.userName && log.userName.toLowerCase().includes(q)) ||
          (log.url && log.url.toLowerCase().includes(q))
      );
    }

    if (this.dateFilter) {
      const selectedDate = new Date(this.dateFilter).toDateString();
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp).toDateString();
        return logDate === selectedDate;
      });
    }

    return filteredLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  page(): any[] {
    const start = (this.currentPageValue - 1) * this.pageSizeValue;
    return this.filtered().slice(start, start + this.pageSizeValue);
  }

  currentPage(): number {
    return this.currentPageValue;
  }

  pageSize(): number {
    return this.pageSizeValue;
  }

  nextPage(): void {
    if (this.currentPageValue * this.pageSizeValue < this.filtered().length) {
      this.currentPageValue++;
    }
  }

  prevPage(): void {
    if (this.currentPageValue > 1) {
      this.currentPageValue--;
    }
  }

  viewRequestLog(log: any): void {
    this.selectedLog = log;
    const modalElement = document.getElementById('requestLogModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}
