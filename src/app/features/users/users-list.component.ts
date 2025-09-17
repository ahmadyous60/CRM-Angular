import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  imports: [NgFor]
})
export class UsersListComponent implements OnInit {
  users: any[] = [];
  apiUrl = `${environment.apiUrl}/Users`;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(res => {
      this.users = res;
    });
  }

  editUser(userId: string) {
    this.router.navigate(['/users', userId]);
  }
}
