import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { LeadsListComponent } from './features/leads/leads-list/leads-list.component';
import { LeadFormComponent } from './features/leads/lead-form/lead-form.component';
import { DealsListComponent } from './features/deals/deals-list/deals-list.component';
import { DealFormComponent } from './features/deals/deal-form/deal-form.component';
import { ContactsListComponent } from './features/contacts/contacts-list/contacts-list.component';
import { ContactFormComponent } from './features/contacts/contact-form/contact-form.component';
import { CompaniesListComponent } from './features/companies/companies-list/companies-list.component';
import { CompanyFormComponent } from './features/companies/company-form/company-form.component';
import { NoDirectAccessGuard } from './core/NoDirectAccessGuard';
import { TasksListComponent } from './features/Tasks/tasks-list/task-list.component';
import { TaskFormComponent } from './features/Tasks/tasks-form/task-form.component';
import { NotesListComponent } from './features/Notes/notes-list/note-list.component';
import { NoteFormComponent } from './features/Notes/notes-form/note-form.component';
import { EventsListComponent } from './features/Events/events-list/event-list.component';
import { EventFormComponent } from './features/Events/events-form/event-form.component';

export const routes: Routes = [
  {path: 'login' , loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)},
  {path: 'signup' , loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent)}, 
{ 
  path: 'forgot-password', 
  loadComponent: () => import('./features/auth/forgotpassword/forgotpassword.component')
    .then(m => m.ForgotPasswordComponent), 
  canActivate: [NoDirectAccessGuard] 
},
{ 
  path: 'reset-password', 
  loadComponent: () => import('./features/auth/resetpassword/resetpassword.component')
    .then(m => m.ResetPasswordComponent), 
  canActivate: [NoDirectAccessGuard] 
},
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'leads', pathMatch: 'full' },
      { path: 'leads', component: LeadsListComponent, title: 'Leads' },
      { path: 'leads/new', component: LeadFormComponent, title: 'Create Lead' },

      { path: 'deals', component: DealsListComponent, title: 'Deals' },
      { path: 'deals/new', component: DealFormComponent, title: 'Create Deal' },

      { path: 'contacts', component: ContactsListComponent, title: 'Contacts' },
      { path: 'contacts/new', component: ContactFormComponent, title: 'Create Contact' },

      { path: 'companies', component: CompaniesListComponent, title: 'Companies' },
      { path: 'companies/new', component: CompanyFormComponent, title: 'Create Company' },
      {path: 'tasks' , component: TasksListComponent, title: 'Tasks'},
      {path: 'tasks/new', component: TaskFormComponent, title: 'Create Task' },
      {path: 'notes' , component: NotesListComponent, title: 'Notes' },
      {path: 'notes/new', component: NoteFormComponent, title: 'Create Note' },
      {path: 'events', component: EventsListComponent, title: 'Events' },
      {path: 'events/new', component: EventFormComponent, title: 'Create Event' },
      


    ]
  },
  { path: '**', redirectTo: '/login' }
];
