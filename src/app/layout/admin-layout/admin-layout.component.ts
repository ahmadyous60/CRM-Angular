import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../topbar/topbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent],
  template: `
  <div class="d-flex min-vh-100">
    <app-sidebar class="sidebar p-3" style="width:260px"></app-sidebar>
    <div class="flex-grow-1 d-flex flex-column">
      <app-topbar></app-topbar>
      <main class="p-4">
        <router-outlet></router-outlet>
      </main>
    </div>
  </div>
  `
})
export class AdminLayoutComponent {}
