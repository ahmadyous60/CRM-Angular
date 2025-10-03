import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { SharedModule } from '../../../core/sahred.module';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './note-form.component.html'
})
export class NoteFormComponent {
  f: FormGroup;

  constructor(private fb: FormBuilder, private ds: DataService, public router: Router) {
    this.f = this.fb.group({
      content: ['', Validators.required],
      entityType: ['Lead', Validators.required],
      entityId: ['', Validators.required]
    });
  }

  save() {
    if (this.f.valid) {
      this.ds.addNote(this.f.value).subscribe({
        next: () => {
          this.router.navigateByUrl('/notes');
        },
        error: (err) => console.error(err)
      });
    }
  }
}