// import { Component } from '@angular/core';
// import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
// import { Router } from '@angular/router';
// import { DataService } from '../../../core/data.service';
// import { NgIf } from '@angular/common';

// const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
// // E.164 general phone (e.g., +923001234567). If you want local PK mobile: /^03\d{9}$/
// const PHONE_RX = /^\+?[1-9]\d{7,14}$/;

// @Component({
//   selector: 'app-lead-form',
//   standalone: true,
//   imports: [ReactiveFormsModule , NgIf],
//   template: `
//   <div class="d-flex justify-content-between align-items-center mb-3">
//     <h3 class="mb-0">Create Lead</h3>
//   </div>
//   <div class="card p-3">
//     <form [formGroup]="f" (ngSubmit)="save()">
//       <div class="row g-3">
//         <div class="col-md-6">
//           <label class="form-label text-white">Name</label>
//           <input class="form-control" formControlName="name" placeholder="Lead Name">
//           <div class="text-danger small" *ngIf="f.controls['name'].touched && f.controls['name'].invalid">Name is required</div>
//         </div>
//         <div class="col-md-6">
//           <label class="form-label text-white">Email</label>
//           <input class="form-control" formControlName="email" placeholder="Lead Email">
//           <div class="text-danger small" *ngIf="f.controls['email'].touched && f.controls['email'].invalid">Valid email required</div>
//         </div>
//         <div class="col-md-6">
//           <label class="form-label text-white">Phone</label>
//           <input class="form-control" formControlName="phone" placeholder="+923001234567">
//           <div class="text-danger small" *ngIf="f.controls['phone'].touched && f.controls['phone'].invalid">Enter a valid phone</div>
//         </div>
//         <div class="col-md-3">
//           <label class="form-label text-white">Status</label>
//           <select class="form-select" formControlName="status">
//             <option>New</option><option>Qualified</option><option>Won</option><option>Lost</option>
//           </select>
//         </div>
//         <div class="col-md-3">
//           <label class="form-label text-white">Source</label>
//           <select class="form-select" formControlName="source">
//             <option>Website</option><option>Referral</option><option>Email</option><option>Cold Call</option>
//           </select>
//         </div>
//           <div class="col-mb-3">
//             <label class="form-label text-white">Product Category</label>
//             <select class="form-select" formControlName="product">
//               <option>Software License</option><option>Website Development</option><option>Mobile App Development</option><option>SEO Package</option><option>Cloud Hosting</option><option>Digital Marketing</option><option>E-commerce Solution</option><option>CRM Subscription</option>
//             </select>
//           </div>
//       </div>
//       <div class="d-flex gap-2 mt-4">
//         <button class="btn btn-primary" [disabled]="f.invalid">
//           <i class="bi bi-check2"></i> Save
//         </button>
//         <button type="button" class="btn btn-outline-light" (click)="router.navigateByUrl('/leads')">Cancel</button>
//       </div>
//     </form>
//   </div>
//   `
// })
// export class LeadFormComponent {
//   f: ReturnType<FormBuilder['group']>;

//   constructor(private fb: FormBuilder, private ds: DataService, public router: Router){
//     this.f = this.fb.group({
//       name: ['', Validators.required],
//       email: ['', [Validators.required, Validators.pattern(EMAIL_RX)]],
//       phone: ['', [Validators.required, Validators.pattern(PHONE_RX)]],
//       status: ['New', Validators.required],
//       source: ['Website', Validators.required],
//       product:['Software License', Validators.required]
//     });
//   }

//   save(){
//     if(this.f.invalid) return;
  //   this.ds.add('leads', this.f.value).subscribe(() => {
  //     this.router.navigateByUrl('/leads');
  //   });
  // }
// }
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Lead, productOptions } from '../../../core/model';
import { DataService } from '../../../core/data.service';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PHONE_RX = /^\+?[1-9]\d{7,14}$/;

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="card p-3">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-white">Name</label>
            <input class="form-control" formControlName="name" placeholder="Lead Name">
          </div>

          <div class="col-md-6">
            <label class="form-label text-white">Email</label>
            <input class="form-control" formControlName="email" placeholder="Lead Email">
          </div>

          <div class="col-md-6">
            <label class="form-label text-white">Phone</label>
            <input class="form-control" formControlName="phone" placeholder="+923001234567">
          </div>

          <div class="col-md-3">
            <label class="form-label text-white">Status</label>
            <select class="form-select" formControlName="status">
              <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label text-white">Source</label>
            <select class="form-select" formControlName="source">
              <option *ngFor="let s of sources" [value]="s">{{ s }}</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label text-white">Product Category</label>
            <select class="form-select" formControlName="productCategory">
              <option *ngFor="let category of productCategories; trackBy: trackByCategory" [value]="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label text-white">Product</label>
            <select class="form-select" formControlName="product">
              <option *ngFor="let product of availableProducts; trackBy: trackByProduct" [value]="product">
                {{ product }}
              </option>
            </select>
          </div>
        </div>

        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-primary" [disabled]="form.invalid">Save</button>
          <button type="button" class="btn btn-outline-light" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>
  `
})
export class LeadFormComponent {
  form: FormGroup;
  productCategories: string[] = Object.keys(productOptions);
  availableProducts: string[] = [];
  statuses: Lead['status'][] = ['New', 'Qualified', 'Won', 'Lost'];
  sources: Lead['source'][] = ['Website', 'Referral', 'Email', 'Cold Call'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ds: DataService // Inject DataService
  ) {
    const defaultCategory = this.productCategories[0] ?? '';
    this.availableProducts = this.getProductsForCategory(defaultCategory);

    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(EMAIL_RX)]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_RX)]],
      status: [this.statuses[0], Validators.required],
      source: [this.sources[0], Validators.required],
      productCategory: [defaultCategory, Validators.required],
      product: [this.availableProducts[0] ?? '', Validators.required]
    });

    this.form.get('productCategory')?.valueChanges.subscribe(category => {
      this.availableProducts = this.getProductsForCategory(category);
      this.form.get('product')?.setValue(this.availableProducts[0] ?? '');
    });
  }

  getProductsForCategory(category: string): string[] {
    return [...(productOptions[category as keyof typeof productOptions] ?? [])];
  }

  trackByCategory(index: number, category: string): string {
    return category;
  }

  trackByProduct(index: number, product: string): string {
    return product;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    // Use DataService to save the lead
    this.ds.add<Lead>('leads', this.form.value).subscribe({
      next: () => this.router.navigateByUrl('/leads'),
      error: err => console.error('Error saving lead:', err)
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/leads');
  }
}
