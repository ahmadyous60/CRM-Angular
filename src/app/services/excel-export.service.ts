import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  exportToExcel(data: any[], filename: string = 'export.xlsx'): void {
    if (!data || data.length === 0) {
      console.warn('No data to export!');
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const finalFilename = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), finalFilename);
  }
}
