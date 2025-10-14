import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import { Footer } from "./footer/footer";
import { Trangchu } from "./trangchu/trangchu";
import { Gioithieu } from "./gioithieu/gioithieu";
import { Sanpham } from "./sanpham/sanpham";
import { Lienhe } from "./lienhe/lienhe";
import { ProductComponent } from "./product/product";
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Trangchu, Gioithieu, Sanpham, Lienhe, ProductComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('shop_car');
}
