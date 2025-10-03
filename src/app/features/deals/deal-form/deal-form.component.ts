import { Component } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { SharedModule } from '../../../core/sahred.module';

@Component({
  standalone:true,
  selector:'app-deal-form',
  imports:[SharedModule],
  templateUrl:'deal-form.component.html',
 
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
