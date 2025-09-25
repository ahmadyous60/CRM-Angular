import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  imports: [FormsModule, NgFor],
  standalone: true // <-- if using Angular standalone components
})
export class RolePermissionsComponent implements OnInit {
  permissions: any[] = [];
  roles = ['admin', 'user'];
  selectedRole = 'admin';

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.getAllPermissions()
      .subscribe(perms => this.permissions = perms);
  }

  togglePermission(role: string, permissionId: string, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;

  if (checked) {
    // Assign permission
    this.auth.assignPermissions(role, [permissionId]).subscribe({
      next: () => console.log(`✅ Permission ${permissionId} assigned to ${role}`),
      error: err => console.error('Error assigning permission:', err)
    });
  } else {
    // Revoke permission
    this.auth.revokePermission(role, permissionId).subscribe({
      next: () => console.log(`❌ Permission ${permissionId} revoked from ${role}`),
      error: err => console.error('Error revoking permission:', err)
    });
  }
}

}
