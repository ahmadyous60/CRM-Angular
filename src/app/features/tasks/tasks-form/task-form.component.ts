import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { SharedModule } from '../../../core/sahred.module';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent {
  f: FormGroup;

  constructor(private fb: FormBuilder, private ds: DataService, public router: Router) {
    this.f = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      isCompleted: [false],
      entityType: ['Lead', Validators.required],
      entityId: ['', Validators.required]
    });
  }

  save() {
    if (this.f.valid) {
    this.ds.addTask(this.f.value).subscribe({
      next: () => {
        this.router.navigateByUrl('/tasks');
      },
      error: (err) => console.error(err)
    });
  }
}
}
