import { Component, OnInit, signal } from '@angular/core';
import { AuditLogsService } from '../../../services/audit-logs.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExcelExportService } from '../../../services/excel-export.service';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './entity-audit-logs.component.html',
  imports: [DatePipe, NgFor, NgIf, FormsModule],
})
export class AuditLogsComponent implements OnInit {
  entityLogs: any[] = [];
  selectedLog: any = null;

  pageSize = signal(5);
  currentPage = signal(1);
  Math = Math;

  qValue = '';
  dateFilter = '';

  constructor(private auditLogsService: AuditLogsService, private excelExport: ExcelExportService) {}

  ngOnInit(): void {
    this.loadEntityLogs();
  }

  loadEntityLogs(): void {
    this.auditLogsService.getAllLogs().subscribe({
      next: (res) => {
        this.entityLogs = res.entityLogs || res.EntityLogs || [];
      },
      error: (err) => console.error('Error loading entity logs:', err),
    });
  }

  filtered = () => {
    const query = this.qValue.toLowerCase();
    const date = this.dateFilter;

    return this.entityLogs.filter((log) => {
      const matchesText =
        log.userName?.toLowerCase().includes(query) ||
        log.action?.toLowerCase().includes(query) ||
        log.entityName?.toLowerCase().includes(query);

      const matchesDate = date
        ? new Date(log.timestamp).toISOString().slice(0, 10) === date
        : true;

      return matchesText && matchesDate;
    });
  };

  page = () => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  };

  nextPage(): void {
    if (this.currentPage() * this.pageSize() < this.filtered().length) {
      this.currentPage.update((v) => v + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((v) => v - 1);
    }
  }

  viewEntityLog(log: any): void {
    this.selectedLog = log;
    const modalElement = document.getElementById('auditLogModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  exportAuditLogs(){
    const dataToExport = this.filtered().map(log => ({
      User: log.userName,
      Action: log.action,
      Entity: log.entityName,
      changedcoloumns: log.changedColumns,
      oldvalues: log.oldValues,
      newvalues: log.newValues
    }));
    this.excelExport.exportToExcel(dataToExport, 'Entity_Audit_Logs');
  }
}
