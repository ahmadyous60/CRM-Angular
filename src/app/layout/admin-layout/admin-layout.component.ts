import { Component } from '@angular/core';
import { TopbarComponent } from '../topbar/topbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SharedModule } from '../../core/sahred.module';
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [SharedModule, TopbarComponent, SidebarComponent],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {}
