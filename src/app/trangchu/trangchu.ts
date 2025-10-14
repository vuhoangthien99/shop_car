import { Component } from '@angular/core';
import { AuthRoutingModule } from "../auth/auth-routing-module";
@Component({
  selector: 'app-trangchu',
  imports: [AuthRoutingModule],
  templateUrl: './trangchu.html',
  styleUrl: './trangchu.css',
})
export class Trangchu {
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scroll(0, 0);
    }
  }
}
