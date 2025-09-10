import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../core/data.service';
import { NgIf } from '@angular/common';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="mb-0">Create Contact</h3>
  </div>
  <div class="card p-3">
    <form [formGroup]="f" (ngSubmit)="save()">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label text-white">First Name</label>
          <input class="form-control" formControlName="firstName" placeholder="First Name">
          <div class="text-danger small" *ngIf="f.controls['firstName'].touched && f.controls['firstName'].invalid">First name is required</div>
        </div>
        <div class="col-md-6">
          <label class="form-label text-white">Last Name</label>
          <input class="form-control" formControlName="lastName" placeholder="Last Name">
          <div class="text-danger small" *ngIf="f.controls['lastName'].touched && f.controls['lastName'].invalid">Last name is required</div>
        </div>
        <div class="col-md-6">
          <label class="form-label text-white">Email</label>
          <input class="form-control" formControlName="email" placeholder="Contact Email">
          <div class="text-danger small" *ngIf="f.controls['email'].touched && f.controls['email'].invalid">Valid email required</div>
        </div>
        <div class="col-md-6">
          <label class="form-label text-white">Phone</label>
          <input class="form-control" formControlName="phone" placeholder="+923001234567">
        </div>
      </div>
      <div class="d-flex gap-2 mt-4">
        <button class="btn btn-primary" [disabled]="f.invalid">
          <i class="bi bi-check2"></i> Save
        </button>
        <button type="button" class="btn btn-outline-light" (click)="router.navigateByUrl('/contacts')">Cancel</button>
      </div>
    </form>
  </div>
  `
})
export class ContactFormComponent {
  f: ReturnType<FormBuilder['group']>;

  constructor(private fb: FormBuilder, private ds: DataService, public router: Router){
    this.f = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(EMAIL_RX)]],
      phone: ['']
    });
  }

  save(){
    if(this.f.invalid) return;
    this.ds.add('contacts', this.f.value).subscribe(() => {
      this.router.navigateByUrl('/contacts');
    });
  }
}
