import { Component } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { SharedModule } from '../../../core/sahred.module';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './contact-form.component.html'
})
export class ContactFormComponent {
  f: ReturnType<FormBuilder['group']>;

  constructor(private fb: FormBuilder, private ds: DataService, public router: Router){
   this.f = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(EMAIL_RX)]],
      mobile: [''],
      dob: [''],
      reportingTo: [''],
      mailingStreet: [''],
      otherStreet: [''],
      mailingCity: [''],
      otherCity: [''],
      mailingState: [''],
      otherState: [''],
      mailingZip: [''],
      mailingCountry: ['']
    });
  }

  save(){
    if(this.f.invalid) return;
    this.ds.add('contacts', this.f.value).subscribe(() => {
      this.router.navigateByUrl('/contacts');
    });
  }
}
