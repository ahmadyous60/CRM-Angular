import { Component } from '@angular/core';
import { FormBuilder, Validators,FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { SharedModule } from '../../../core/sahred.module';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './event-form.component.html',
})
export class EventFormComponent {
  f: FormGroup;

  constructor(private fb: FormBuilder, private ds: DataService, public router: Router) {
    this.f = this.fb.group({
      subject: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      entityType: ['Lead', Validators.required],
      entityId: ['', Validators.required]
    });
  }

  save() {
    if (this.f.valid) {
      this.ds.addEvent(this.f.value).subscribe({
        next: () => {
          this.router.navigateByUrl('/events');
        },
        error: (err) => console.error(err)
      });
    }
  }
}
