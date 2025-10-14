import { Component, OnInit } from '@angular/core';
import { ProductService } from './product-service';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],   // ← chỉ import CommonModule, DecimalPipe không để ở đây
  providers: [DecimalPipe],  // ← khai báo DecimalPipe trong providers
  templateUrl: './product.html',  // ← đúng tên file
  styleUrls: ['./product.css'],   // ← phải là styleUrls
})
export class ProductComponent implements OnInit {
  products: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
  this.productService.getProducts().subscribe({
    next: (data) => {
      console.log('Data từ backend:', data); // ← kiểm tra console
      this.products = data;
    },
    error: (err) => console.error('Lỗi gọi API:', err),
  });
}
}
