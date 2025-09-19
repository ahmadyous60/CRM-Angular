// users-list.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { User } from '../../models/user.model';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  imports: [NgIf,NgFor]
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  newRoles: string[] = [];

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }
  openUserModal(user: any): void {
  this.selectedUser = user;
  this.newRoles = [...user.roles]; // clone roles to avoid direct mutation
}

  loadUsers(): void {
    this.authService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  editRoles(user: User): void {
    this.selectedUser = user;
    this.newRoles = [...user.roles]; // copy roles into editable array
  }

  toggleRole(role: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.newRoles.includes(role)) {
        this.newRoles.push(role);
      }
    } else {
      this.newRoles = this.newRoles.filter(r => r !== role);
    }
  }

  saveRoles(): void {
    if (!this.selectedUser) return;
    this.authService.updateUserRoles(this.selectedUser.id, this.newRoles).subscribe(() => {
      this.loadUsers(); // reload after update
      this.selectedUser = null;
    });
  }
  viewUser(user: User): void {
  alert(`Viewing user: ${user.username}\nEmail: ${user.email}\nRoles: ${user.roles.join(', ')}`);
}

deleteUser(user: User): void {
  if (confirm(`Are you sure you want to delete ${user.username}?`)) {
    this.authService.deleteUser(user.id).subscribe(() => {
      this.loadUsers(); // reload list after deletion
    });
  }
}
}
