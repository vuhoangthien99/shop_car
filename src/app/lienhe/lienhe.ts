import { Component } from '@angular/core';

@Component({
  selector: 'app-lienhe',
  standalone: true,
  imports: [],
  templateUrl: './lienhe.html',
  styleUrl: './lienhe.css',
})
export class Lienhe {
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scroll(0, 0);
    }
  }
}
