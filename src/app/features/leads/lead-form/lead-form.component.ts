import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {Lead} from '../../../models/lead.model';
import { productOptions } from '../../../models/product-options.const';
import { DataService } from '../../../services/data.service';
import { SharedModule } from '../../../core/sahred.module';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PHONE_RX = /^\+?[1-9]\d{7,14}$/;

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './lead-form.component.html'
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
