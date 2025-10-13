import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
// import type { Task, Note, Event } from './model'; 
import { Task } from '../models/task.model';
import { Note } from '../models/note.model';
import { Event } from '../models/event.model';
import { environment } from '../../environments/environment';

type Key = 'leads' | 'deals' | 'contacts' | 'companies';

@Injectable({ providedIn: 'root' })
export class DataService {
  // private baseUrl = 'https://localhost:7298/api';
    private baseUrl = `${environment.apiUrl}`;

  //  Reactive signals
  tasksSignal = signal<Task[]>([]);
  notesSignal = signal<Note[]>([]);
  eventsSignal = signal<Event[]>([]);

  private sig = {
    leads: signal<any[]>([]),
    deals: signal<any[]>([]),
    contacts: signal<any[]>([]),
    companies: signal<any[]>([]),
  };

  private endpointMap: Record<Key, string> = {
    leads: 'Leads',
    deals: 'Deals',
    contacts: 'Contacts',
    companies: 'Companies'
  };

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  // ========== Generic CRUD for core entities ==========
  private loadAll() {
    (Object.keys(this.sig) as Key[]).forEach(key => {
      this.loadCollection(key);
    });
  }

  private loadCollection(key: Key) {
    this.http.get<any[]>(`${this.baseUrl}/${this.endpointMap[key]}`)
      .subscribe(data => this.sig[key].set(data));
  }

  list<T>(key: Key) {
    return this.sig[key];
  }

  add<T>(key: Key, partial: Partial<T>): Observable<T> {
    const now = new Date().toISOString();
    const item = { createdAt: now, ...partial };

    return this.http.post<T>(`${this.baseUrl}/${this.endpointMap[key]}`, item).pipe(
      tap(() => this.loadCollection(key))
    );
  }

  update<T extends { id: string }>(key: Key, id: string, patch: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${this.endpointMap[key]}/${id}`, patch).pipe(
      tap(() => this.loadCollection(key))
    );
  }

  remove(key: Key, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpointMap[key]}/${id}`).pipe(
      tap(() => this.loadCollection(key))
    );
  }

  get<T>(key: Key, id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${this.endpointMap[key]}/${id}`);
  }

  // ====================================================
  // ================= Activity: Tasks ==================
  // ====================================================

  // Get tasks for a specific entity
  getTasks(entityType: string, entityId: string) {
    return this.http.get<Task[]>(`${this.baseUrl}/Activity/${entityType}/${entityId}/tasks`).pipe(
      tap(tasks => this.tasksSignal.set(tasks))
    );
  }

  getAllTasks() {
    return this.http.get<Task[]>(`${this.baseUrl}/Activity/tasks`).pipe(
      tap(tasks => this.tasksSignal.set(tasks))
    );
  }

  addTask(task: Task) {
    if (!task.id) task.id = crypto.randomUUID(); // generate GUID
    return this.http.post<Task>(`${this.baseUrl}/Activity/task`, task).pipe(
      tap(() => this.getAllTasks().subscribe())
    );
  }

  updateTask(task: Task) {
    return this.http.put<Task>(`${this.baseUrl}/Activity/task/${task.id}`, task).pipe(
      tap(() => this.getAllTasks().subscribe())
    );
  }

  deleteTask(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/Activity/task/${id}`).pipe(
      tap(() => this.getAllTasks().subscribe())
    );
  }

  // ====================================================
  // ================= Activity: Notes ==================
  // ====================================================

  getNotes(entityType: string, entityId: string) {
    return this.http.get<Note[]>(`${this.baseUrl}/Activity/${entityType}/${entityId}/notes`).pipe(
      tap(notes => this.notesSignal.set(notes))
    );
  }

  getAllNotes() {
    return this.http.get<Note[]>(`${this.baseUrl}/Activity/notes`).pipe(
      tap(notes => this.notesSignal.set(notes))
    );
  }

 addNote(note: Note) {
  return this.http.post<Note>(`${this.baseUrl}/Activity/notes`, note).pipe(
    tap(() => this.getAllNotes().subscribe())
  );
}

 updateNote(note: Note) {
  return this.http.put<Note>(`${this.baseUrl}/Activity/notes/${note.id}`, note).pipe(
    tap(() => this.getAllNotes().subscribe())
  );
}

 deleteNote(id: string) {
  return this.http.delete(`${this.baseUrl}/Activity/notes/${id}`).pipe(
    tap(() => this.getAllNotes().subscribe())
  );
}

  // ====================================================
  // ================= Activity: Events =================
  // ====================================================

  getEvents(entityType: string, entityId: string) {
    return this.http.get<Event[]>(`${this.baseUrl}/Activity/${entityType}/${entityId}/events`).pipe(
      tap(events => this.eventsSignal.set(events))
    );
  }

  getAllEvents() {
    return this.http.get<Event[]>(`${this.baseUrl}/Activity/events`).pipe(
      tap(events => this.eventsSignal.set(events))
    );
  }

  addEvent(event: Event) {
    if (!event.id) event.id = crypto.randomUUID();
    return this.http.post<Event>(`${this.baseUrl}/Activity/event`, event).pipe(
      tap(() => this.getAllEvents().subscribe())
    );
  }

  updateEvent(event: Event) {
    return this.http.put<Event>(`${this.baseUrl}/Activity/event/${event.id}`, event).pipe(
      tap(() => this.getAllEvents().subscribe())
    );
  }

  deleteEvent(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/Activity/event/${id}`).pipe(
      tap(() => this.getAllEvents().subscribe())
    );
  }
}