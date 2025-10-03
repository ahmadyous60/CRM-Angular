import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { HasPermissionDirective } from '../Directive/hasPermission.directive';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';

@NgModule({
  imports: [
    MatButtonModule,
    MatDialogModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgIf,
    NgFor,
    TitleCasePipe,
    HasPermissionDirective,
    RouterOutlet,
    RouterLinkActive
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgIf,
    NgFor,
    TitleCasePipe,
    HasPermissionDirective,
    MatButtonModule,
    MatDialogModule,
    RouterOutlet,
    RouterLinkActive
  ],
  providers: [DatePipe],
})
export class SharedModule {}
