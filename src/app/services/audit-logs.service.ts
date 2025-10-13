import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditLogsService {
  private API_URL = `${environment.apiUrl}/AuditLogs`;

  constructor(private http: HttpClient) {}

  getAllLogs(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}`);
  }
}
