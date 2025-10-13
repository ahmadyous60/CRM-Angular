import { Component, OnInit, effect } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarRoute } from '../../models/sidebar.model';

const SIDEBAR_ROUTES: SidebarRoute[] = [
  { path: '/leads', label: 'Leads', icon: 'bi-person-lines-fill', permissions: ['Leads.View'] },
  { path: '/deals', label: 'Deals', icon: 'bi-cash-coin', permissions: ['Deals.View'] },
  { path: '/contacts', label: 'Contacts', icon: 'bi-people', permissions: ['Contacts.View'] },
  { path: '/companies', label: 'Companies', icon: 'bi-buildings', permissions: ['Companies.View'] },
  { path: '/tasks', label: 'Tasks', icon: 'bi-list-task', permissions: ['Tasks.View'] },
  { path: '/notes', label: 'Notes', icon: 'bi-sticky', permissions: ['Notes.View'] },
  { path: '/events', label: 'Events', icon: 'bi-calendar-event', permissions: ['Events.View'] },
  {
    path: '',
    label: 'Audit Logs',
    icon: 'bi-journal-text',
    permissions: ['AuditLogs.View'],
    children: [
      { path: '/requestaudit-logs', label: 'Request Audit Logs', icon: 'bi-box-arrow-in-right', permissions: ['AuditLogs.Request.View'] },
      { path: '/entityaudit-logs', label: 'Entity Audit Logs', icon: 'bi-diagram-3', permissions: ['AuditLogs.Entity.View'] }
    ]
  },
  { path: '/users', label: 'Users', icon: 'bi-person-badge', permissions: ['Users.View'] },
  { path: '/role-permissions', label: 'Manage Permissions', icon: 'bi-shield-lock', permissions: ['RolePermissions.Manage'] }
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIf, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  visibleMenu: SidebarRoute[] = [];
  activeSubmenu: string | null = null;

  constructor(public auth: AuthService, private router: Router) {
    effect(() => this.filterMenu());
  }

  ngOnInit(): void {
    this.filterMenu();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeSubmenu = null;
      }
    });
  }

  /** Filters menu items based on user permissions */
  private filterMenu(): void {
    const user = this.auth.currentUser();
    if (!user) {
      this.visibleMenu = [];
      return;
    }

    this.visibleMenu = SIDEBAR_ROUTES
      .filter(route => this.canAccess(route))
      .map(route => ({
        ...route,
        children: route.children?.filter(child => this.canAccess(child)) || []
      }));

    console.log('Filtered visibleMenu:', this.visibleMenu);
  }

  /** Checks if user has access to a route */
  private canAccess(route: SidebarRoute): boolean {
    if (!route.permissions?.length) return true;
    const hasPermission = route.permissions.some(p => this.auth.hasPermission(p));
    console.log(`Permission check for "${route.label}":`, hasPermission, route.permissions);
    return hasPermission;
  }

  /** Toggles submenu visibility */
  toggleSubmenu(label: string): void {
    console.log('Toggling submenu:', label);
    this.activeSubmenu = this.activeSubmenu === label ? null : label;
  }

  /** Logs out the user */
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
