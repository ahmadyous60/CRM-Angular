import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-link-sent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reset-link-sent.component.html',
  styleUrls: ['./reset-link-sent.component.scss']
})
export class ResetLinkSentComponent implements OnInit {
  countdown = 10; 

  ngOnInit(): void {
    const interval = setInterval(() => {
      this.countdown--;

      if (this.countdown === 0) {
        clearInterval(interval);
        window.location.href = '/'; 
      }
    }, 1000);
  }
}
