// import { Component, effect } from '@angular/core';
// import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// import { AuthService } from '../../core/auth.service';
// import { CommonModule, NgIf } from '@angular/common';

// @Component({
//   selector: 'app-sidebar',
//   standalone: true,
//   imports: [RouterLink, RouterLinkActive, NgIf],
//   templateUrl: './sidebar.component.html',
// })
// export class SidebarComponent {
//   userRoles: string[] = [];

//   constructor(public auth: AuthService, private router: Router) {
//     effect(() => {
//       const user = this.auth.currentUser();
//       this.userRoles = user?.roles || [];
//     });
//   }

//   get isSuperAdmin(): boolean {
//     return this.userRoles.includes('superadmin');
//   }

//   logout() {
//     this.auth.logout();
//     this.router.navigate(['/login']);
//   }
// }
import { Component, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NgIf } from '@angular/common';

// Sidebar ke routes define kar lo ek constant me
const sidebarRoutes = [
  { path: '/leads', label: 'Leads', roles: ['admin', 'superadmin'], permissions: ['Leads.View'] },
  { path: '/deals', label: 'Deals', roles: ['admin', 'superadmin'], permissions: ['Deals.View'] },
  { path: '/contacts', label: 'Contacts', roles: ['user', 'admin', 'superadmin'], permissions: ['Contacts.View'] },
  { path: '/companies', label: 'Companies', roles: ['user', 'admin', 'superadmin'], permissions: ['Companies.View'] },
  { path: '/tasks', label: 'Tasks', roles: [], permissions: [] }, 
  { path: '/notes', label: 'Notes', roles: [], permissions: [] },
  { path: '/events', label: 'Events', roles: [], permissions: [] },
  { path: '/users', label: 'Users', roles: ['superadmin'], permissions: ['Users.View'] }
];
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  userRoles: string[] = [];
  visibleMenu: any[] = [];

  constructor(public auth: AuthService, private router: Router) {
    effect(() => {
      const user = this.auth.currentUser();
      this.userRoles = user?.roles || [];
    });
  }

  get isSuperAdmin(): boolean {
    return this.userRoles.includes('superadmin');
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    const currentUser = this.auth.currentUser();

    this.visibleMenu = sidebarRoutes.filter(item => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.some(role => currentUser?.roles?.includes(role));
    });
  }
}
