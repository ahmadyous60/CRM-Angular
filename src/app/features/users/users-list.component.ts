import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { User } from '../../models/user.model';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { Permission } from '../../models/permission.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor]
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;

  constructor(public authService: AuthService, private http:HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe(users => this.users = users);
  }

  openUserModal(user: User): void {
    this.selectedUser = { ...user };
    this.authService.getUserPermissions(user.id).subscribe(perms => {
      this.selectedUser!.permissions = perms;
    });
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
      next: () => console.log(`✅ Role updated for ${user.username} → ${newRole}`),
      error: err => {
        console.error('Error updating role', err);
        this.loadUsers();
      }
    });
  }

togglePermission(roleId: string, perm: Permission, event: any) {
  if (!roleId || !perm?.id) return;

  if (event.target.checked) {
    this.authService.assignPermissions(roleId, [perm.id]).subscribe({
      next: () => console.log(`Permission ${perm.name} added to role ${roleId}`),
      error: (err) => console.error(err)
    });
  } else {
    this.authService.revokePermission(roleId, perm.id).subscribe({
      next: () => console.log(`Permission ${perm.name} removed from role ${roleId}`),
      error: (err) => console.error(err)
    });
  }
}








}
