import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  imports: [FormsModule, NgFor, NgIf, TitleCasePipe],
  standalone: true
})
export class RolePermissionsComponent implements OnInit {
  permissions: any[] = [];
  roles = ['superadmin', 'admin', 'user'];
  selectedRole = 'superadmin';
  loading = false;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.loadPermissions();
  }

  loadPermissions() {
    this.loading = true;
    this.auth.getAllPermissions().subscribe({
      next: perms => {
        this.permissions = perms.map(p => ({ ...p, assigned: false }));
        this.loadRolePermissions();
        this.loading = false;
      },
      error: err => {
        console.error('Error loading permissions:', err);
        this.loading = false;
      }
    });
  }

  loadRolePermissions() {
    if (!this.selectedRole) return;

    this.auth.getRolePermissions(this.selectedRole).subscribe({
      next: rolePerms => {
        this.permissions.forEach(perm => {
          perm.assigned = rolePerms.some(rp => rp.id === perm.id);
        });
      },
      error: err => console.error('Error loading role permissions:', err)
    });
  }

  togglePermission(role: string, permissionId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.auth.assignPermissions(role, [permissionId]).subscribe({
        next: () => this.setPermissionAssigned(permissionId, true),
        error: err => console.error('Error assigning permission:', err)
      });
    } else {
      this.auth.revokePermission(role, permissionId).subscribe({
        next: () => this.setPermissionAssigned(permissionId, false),
        error: err => console.error('Error revoking permission:', err)
      });
    }
  }

  setPermissionAssigned(permissionId: string, assigned: boolean) {
    const perm = this.permissions.find(p => p.id === permissionId);
    if (perm) perm.assigned = assigned;
  }
}


