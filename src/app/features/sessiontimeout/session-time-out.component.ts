import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-session-timeout-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './session-time-out.component.html'
})
export class SessionTimeoutDialogComponent implements OnDestroy {
  countdown: number;
  private sub: Subscription;

  constructor(
    private dialogRef: MatDialogRef<SessionTimeoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { timeoutMs: number }
  ) {
    // initialize countdown here (now 'data' is available)
    this.countdown = Math.ceil((this.data.timeoutMs ?? 30000) / 1000);

    // tick every 1 second
    this.sub = interval(1000).subscribe(() => {
      this.countdown = Math.max(0, this.countdown - 1);
      if (this.countdown <= 0) {
        this.sub.unsubscribe();
        this.dialogRef.close('logout');
      }
    });

    // safety auto-close
    setTimeout(() => {
      this.dialogRef.close('logout');
    }, this.data.timeoutMs ?? 30000);
  }

  continue() {
    this.sub.unsubscribe();
    this.dialogRef.close('continue');
  }

  logout() {
    this.sub.unsubscribe();
    this.dialogRef.close('logout');
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}

