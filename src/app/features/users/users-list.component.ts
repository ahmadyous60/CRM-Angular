import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { User } from '../../models/user.model';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  imports: [NgIf, NgFor, FormsModule]
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  newRoles: string[] = [];

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  openUserModal(user: User): void {
    this.selectedUser = user;
    this.newRoles = [...user.roles];
  }

  openDeleteModal(user: User): void {
    this.selectedUser = user;
  }

  confirmDelete(): void {
    if (!this.selectedUser) return;
    this.authService.deleteUser(this.selectedUser.id).subscribe(() => {
      this.loadUsers();
      this.selectedUser = null;
    });
  }

  updateRole(user: User): void {
    const newRole = user.roles[0];
    this.authService.updateUserRoles(user.id, [newRole]).subscribe({
      next: () => console.log(`Role updated for ${user.username} → ${newRole}`),
      error: (err) => {
        console.error('Error updating role', err);
        this.loadUsers();
      }
    });
  }
}
