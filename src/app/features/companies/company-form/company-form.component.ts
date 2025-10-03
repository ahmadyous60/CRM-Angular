import { Component } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { SharedModule } from '../../../core/sahred.module';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './company-form.component.html',
})
export class CompanyFormComponent {
  f: ReturnType<FormBuilder['group']>;

  constructor(private fb: FormBuilder, private ds: DataService, public router: Router){
    this.f = this.fb.group({
      name: ['', Validators.required],
      industry: [''],
      website: ['']
    });
  }

  save(){
    if(this.f.invalid) return;
    this.ds.add('companies', this.f.value).subscribe(() => {
      this.router.navigateByUrl('/companies');
    });
  }
}
