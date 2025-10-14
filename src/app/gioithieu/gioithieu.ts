import { Component } from '@angular/core';

@Component({
  selector: 'app-gioithieu',
  standalone: true,
  imports: [],
  templateUrl: './gioithieu.html',
  styleUrl: './gioithieu.css',
})
export class Gioithieu {
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scroll(0, 0);
    }
  }
}
