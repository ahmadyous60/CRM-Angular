import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../core/data.service';

@Component({
  standalone:true,
  selector:'app-deal-form',
  imports:[ReactiveFormsModule],
  template:`
  <h3 class="mb-3">Create Deal</h3>
  <div class="card p-3">
    <form [formGroup]="f" (ngSubmit)="save()">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label text-white">Title</label>
          <input class="form-control" formControlName="title" placeholder="Deal Title">
        </div>
        <div class="col-md-3">
          <label class="form-label text-white">Amount</label>
          <input type="number" class="form-control" formControlName="amount" min="0">
        </div>
        <div class="col-md-3">
          <label class="form-label text-white">Stage</label>
          <select class="form-select" formControlName="stage">
            <option>Prospecting</option><option>Proposal</option><option>Negotiation</option><option>Closed Won</option><option>Closed Lost</option>
          </select>
        </div>
        <div class="col-md-4">
  <label class="form-label text-white">Close Date</label>
  <input 
    type="date" 
    class="form-control" 
    formControlName="closeDate"
    [min]="today"
  >
</div>
      </div>
      <div class="mt-4 d-flex gap-2">
        <button class="btn btn-primary" [disabled]="f.invalid"><i class="bi bi-check2"></i> Save</button>
        <button class="btn btn-outline-light" type="button" (click)="router.navigateByUrl('/deals')">Cancel</button>
      </div>
    </form>
  </div>`
})
export class DealFormComponent{
  f;
  today: string;
  constructor(private fb:FormBuilder, private ds:DataService, public router:Router){
     // today in yyyy-MM-dd
    const now = new Date();
    this.today = now.toISOString().split('T')[0];

    this.f = this.fb.group({
      title: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      stage: ['Prospecting', Validators.required],
      closeDate: [this.today]   
    });
  }

  save(): void {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      return;
    }

    this.ds.add('deals', this.f.value).subscribe(() => {
      this.router.navigateByUrl('/deals');
    });
  }
}
