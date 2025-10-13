import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class RolePermissionsComponent implements OnInit {
  permissions: any[] = [];
  roles: string[] = [];
  selectedRole = '';
  loading = false;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.getAllRoles().subscribe({
      next: roles => {
        this.roles = roles.map((r: any) => r.name);
        if (this.roles.length > 0) {
          this.selectedRole = this.roles[0]; 
          this.loadPermissions();
        }
      },
      error: err => console.error('Error loading roles:', err)
    });
  }

  /** Load all permissions first */
  loadPermissions() {
    this.loading = true;
    this.auth.getAllPermissions().subscribe({
      next: perms => {
        this.permissions = perms.map(p => ({
          ...p,
          assigned: false,
          disabled: false
        }));
        this.loadRolePermissions();
        this.loading = false;
      },
      error: err => {
        console.error('Error loading permissions:', err);
        this.loading = false;
      }
    });
  }

loadRolePermissions(role?: string) {
  const roleName = role || this.selectedRole;
  if (!roleName) return;

  this.loading = true;

  forkJoin({
    allPerms: this.auth.getAllPermissions(),
    role: this.auth.getRolePermissionsByName(roleName)
  }).subscribe({
    next: ({ allPerms, role }) => {
      this.permissions = allPerms.map(p => {
        const isRoleAssigned = role.some((r: any) => r.id === p.id);

        return {
          ...p,
          assigned: isRoleAssigned,
          disabled: false ,
        };
      });

      this.loading = false;
    },
    error: err => {
      console.error('Error loading role permissions:', err);
      this.loading = false;
    }
  });
}


  /** Assign or revoke permission */
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

  /** Update UI state for a permission */
  private setPermissionAssigned(permissionId: string, assigned: boolean) {
    const perm = this.permissions.find(p => p.id === permissionId);
    if (perm) perm.assigned = assigned;
  }
}
