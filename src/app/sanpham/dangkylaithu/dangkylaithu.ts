import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DangKyLaiThuService } from './dangkylaithu-service';

declare var bootstrap: any;

@Component({
  selector: 'app-dangkylaithu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dangkylaithu.html',
})
export class DangKyLaiThuComponent {
  @Input() product: any;
  @ViewChild('modal') modalRef!: ElementRef;

  constructor(private dangKyService: DangKyLaiThuService) {}

  submitForm(form: NgForm) {
    if (!form.valid) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const data = {
      product_name: this.product.name,
      product_image: this.product.image_url,
      fullname: form.value.fullname,
      phone: form.value.phone,
      city: form.value.city,
      dealer: form.value.dealer,
      date_schedule: form.value.date,
      has_license: form.value.license || false,
      agree_info: form.value.agreeInfo || false,
      policy_agreed: form.value.policy || false,
    };

    this.dangKyService.registerTestDrive(data).subscribe({
      next: (res) => {
        alert(res.message);
        form.resetForm();

        const modalEl = this.modalRef.nativeElement;
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
      },
      error: (err) => {
        alert(err.error.message || 'Có lỗi xảy ra.');
      },
    });
  }
}
