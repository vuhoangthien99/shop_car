// admin.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
  AdminService,
  User,
  Product,
  Order,
  DetailedOrder,
  ProductDetail,
  ProductImage,
  ProductAttributes,
  OrderStatus, // <-- [QUAN TRỌNG] Import OrderStatus
} from './admin-service';
// Phải có đường dẫn đúng đến AuthService của bạn
import { AuthService } from '../auth/auth';
import { Orders } from './orders/orders';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin implements OnInit {
  // Tabs
  activeTab: 'users' | 'products' | 'orders' | 'testDrive' = 'users';

  // USERS
  users: User[] = [];
  userForm!: FormGroup;
  editingUser: User | null = null;

  // PRODUCTS
  products: Product[] = [];
  productForm!: FormGroup;
  editingProduct: Product | null = null;

  // PRODUCT ATTRIBUTES
  selectedProductForDetails: Product | null = null;
  productDetails: ProductDetail | null = null;
  productImages: ProductImage[] = [];
  detailsForm!: FormGroup;
  imageForm!: FormGroup;

  // ORDERS
  orders: Order[] = [];
  selectedOrder: DetailedOrder | null = null;

  // TEST DRIVE
  testDriveList: any[] = [];

  // searching thử lái
  searchTestDrive: string = '';
  filterStatus: string = '';
  filterDate: string = '';
  filteredTestDriveList: any[] = [];
  // searching sản phẩm
  searchProduct: string = '';
  filterCategory: string = '';
  filterSeats: string = '';
  filterBody: string = '';
  filterOrigin: string = '';
  filterPrice: string = '';
  filteredProducts: Product[] = [];
  // searching người dùng
  searchUser: string = '';
  filterRole: string = '';
  filteredUsers: User[] = [];
  // searching đơn hàng
  searchOrder: string = '';
  filterPhone: string = '';
  filterStatusOrder: string = '';
  filterDateOrders: string = '';
  filteredOrders:  Order[] = [];
  // <-- [ĐÃ SỬA]: Thêm AuthService vào constructor
  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private authService: AuthService // <-- [ĐÃ THÊM]
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadProducts();
    this.loadOrders();
    this.initForms();
    this.loadTestDrives();
  }

  // ===================== FORMS =====================
  initForms() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['customer', Validators.required],
    });

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      category_id: [1, Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      image_url: ['', Validators.required],
      img_hover: [''],
      so_cho_ngoi: ['', Validators.required],
      kieu_dang: ['', Validators.required],
      nhien_lieu: ['', Validators.required],
      xuat_xu: ['', Validators.required],
      loai_xe: ['', Validators.required],
      description: [''],
      mo_ta_chi_tiet: [''],
      status: ['active', Validators.required],
    });

    this.detailsForm = this.fb.group({
      dong_co: [''],
      hop_so: [''],
      dung_tich_xi_lanh: [''],
      dai_rong_cao: [''],
      chieu_dai_co_so: [''],
      khoang_sang_gam_xe: [''],
      tieu_thu_tong_hop: [''],
      tieu_thu_do_thi: [''],
      tieu_thu_ngoai_do_thi: [''],
    });

    this.imageForm = this.fb.group({
      image_url: ['', Validators.required],
      is_main: [0],
    });
  }

  // ===================== USERS =====================
  // loadUsers() {
  //   this.adminService.getUsers().subscribe((res) => (this.users = res));
  // }
  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (data) => {
        console.log('Dữ liệu users:', data);
        this.users = data;
        this.filteredUsers = [...this.users];
      },
      error: (err) => {
        console.error('Lỗi khi tải người dùng:', err);
      },
    });
  }
  editUser(user: User) {
    this.editingUser = user;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  saveUser() {
    if (!this.userForm.valid) return;

    const formData = this.userForm.value;
    if (this.editingUser) {
      const payload: any = {
        id: this.editingUser.id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password) payload.password = formData.password;

      this.adminService.updateUser(payload).subscribe(() => {
        alert('Cập nhật người dùng thành công.');
        this.loadUsers();
        this.cancelEditUser();
      });
    } else {
      this.adminService.addUser(formData).subscribe(() => {
        alert('Thêm người dùng thành công.');
        this.loadUsers();
        this.userForm.reset({ role: 'customer' });
      });
    }

    this.userForm.get('password')?.setValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  deleteUser(user: User) {
    if (confirm(`Xác nhận xóa user "${user.name}"?`)) {
      this.adminService.deleteUser(user.id!).subscribe(() => {
        alert('Xóa người dùng thành công.');
        this.loadUsers();
      });
    }
  }

  cancelEditUser() {
    this.editingUser = null;
    this.userForm.reset({ role: 'customer', password: '' });
    this.userForm.get('password')?.setValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  // ===================== PRODUCTS =====================
  loadProducts() {
    this.adminService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...this.products];
      },
      error: (err) => {
        console.error('Lỗi khi tải sản phẩm:', err);
      },
    });
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.productForm.patchValue(product);
  }

  saveProduct() {
    if (!this.productForm.valid) return;

    if (this.editingProduct) {
      const updated: Product = { ...this.editingProduct, ...this.productForm.value };
      this.adminService.updateProduct(updated).subscribe(() => {
        alert('Cập nhật sản phẩm thành công.');
        this.loadProducts();
        this.cancelEditProduct();
      });
    } else {
      this.adminService.addProduct(this.productForm.value).subscribe(() => {
        alert('Thêm sản phẩm thành công.');
        this.loadProducts();
        this.productForm.reset({ category_id: 1, price: 0, stock: 0, status: 'active' });
      });
    }
  }

  deleteProduct(product: Product) {
    if (confirm(`Xác nhận xóa sản phẩm "${product.name}"?`)) {
      this.adminService.deleteProduct(product.id!).subscribe(() => {
        alert('Xóa sản phẩm thành công.');
        this.loadProducts();
      });
    }
  }

  cancelEditProduct() {
    this.editingProduct = null;
    this.productForm.reset({ category_id: 1, price: 0, stock: 0, status: 'active' });
  }

  // ===================== PRODUCT ATTRIBUTES =====================
  openProductAttributes(product: Product) {
    if (!product.id) {
      alert('Vui lòng thêm sản phẩm trước khi cập nhật chi tiết.');
      return;
    }
    this.selectedProductForDetails = product;
    this.loadProductAttributes(product.id);
  }

  loadProductAttributes(productId: number) {
    this.adminService.getProductAttributes(productId).subscribe({
      next: (data: ProductAttributes) => {
        this.productDetails = data.details;
        this.productImages = data.images;
        this.detailsForm.reset();
        if (data.details) this.detailsForm.patchValue(data.details);
      },
      error: (err) => console.error('Lỗi tải chi tiết sản phẩm:', err),
    });
  }

  saveDetails() {
    if (!this.selectedProductForDetails?.id) return;
    const payload: ProductDetail = {
      product_id: this.selectedProductForDetails.id,
      ...this.detailsForm.value,
    };

    this.adminService.saveProductDetails(payload).subscribe(() => {
      alert('Cập nhật chi tiết sản phẩm thành công.');
      this.loadProductAttributes(this.selectedProductForDetails!.id!);
    });
  }

  addImage() {
    if (!this.selectedProductForDetails || !this.imageForm.valid) return;
    const payload: ProductImage = {
      product_id: this.selectedProductForDetails.id!,
      ...this.imageForm.value,
    };

    this.adminService.addImage(payload).subscribe(() => {
      alert('Thêm hình ảnh thành công.');
      this.loadProductAttributes(this.selectedProductForDetails!.id!);
      this.imageForm.reset({ image_url: '', is_main: 0 });
    });
  }

  deleteImage(imageId: number) {
    if (confirm('Xác nhận xóa hình ảnh này?')) {
      this.adminService.deleteImage(imageId).subscribe(() => {
        alert('Xóa hình ảnh thành công.');
        this.loadProductAttributes(this.selectedProductForDetails!.id!);
      });
    }
  }

  closeProductAttributes() {
    this.selectedProductForDetails = null;
    this.productDetails = null;
    this.productImages = [];
    this.detailsForm.reset();
    this.imageForm.reset({ image_url: '', is_main: 0 });
  }

  // ===================== ORDERS =====================
  // loadOrders() {
  //   this.adminService.getOrders().subscribe((res) => (this.orders = res));
  // }
  loadOrders() {
    this.adminService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = [...this.orders];
      },
      error: (err) => {
        console.error('Lỗi khi tải sản phẩm:', err);
      },
    });
  }
  viewOrderDetails(order: Order) {
    this.adminService.getOrderDetail(order.id).subscribe({
      next: (detail) => {
        // Gán dữ liệu
        this.selectedOrder = detail as DetailedOrder;

        // <<< THÊM DÒNG NÀY ĐỂ BUỘC UPDATE GIAO DIỆN
        this.cdr.detectChanges();
      },
      error: () => alert('Không thể tải chi tiết đơn hàng.'),
    });
  }

  // <-- [ĐÃ SỬA] Sử dụng OrderStatus và thêm logic Admin ID
  updateOrderDetailsStatus(newStatus: OrderStatus) {
    if (!this.selectedOrder) return;

    // 1. Lấy thông tin Admin
    const adminUser = this.authService.getUser();
    const adminId = adminUser?.id;

    if (!adminId || adminUser.role !== 'admin') {
      alert('Bạn không có quyền quản trị để xác nhận đơn hàng.');
      return;
    }

    if (
      !confirm(`Xác nhận chuyển trạng thái đơn hàng #${this.selectedOrder.id} sang ${newStatus}?`)
    ) {
      return;
    }

    // 2. Gọi Service với adminId
    this.adminService.updateOrderStatus(this.selectedOrder.id, newStatus, adminId).subscribe({
      next: () => {
        alert(`Cập nhật trạng thái đơn hàng #${this.selectedOrder!.id} thành công.`);
        // Cập nhật trạng thái ngay trên UI
        this.selectedOrder!.status = newStatus;
        this.loadOrders(); // Tải lại danh sách để đồng bộ
      },
      error: (err) => {
        console.error('Lỗi cập nhật trạng thái:', err);
        alert('Cập nhật trạng thái thất bại.');
      },
    });
  }

  closeOrderDetails() {
    this.selectedOrder = null;
  }

  // ===================== TEST DRIVE =====================
  loadTestDrives() {
    this.adminService.getTestDriveList().subscribe({
      next: (data) => {
        this.testDriveList = data;
        this.filteredTestDriveList = [...this.testDriveList];
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách lái thử:', err);
      },
    });
  }
  updateTestDriveStatus(item: any) {
    this.adminService.updateTestDriveStatus(item.id, item.status).subscribe(
      (res: any) => {
        if (res.success) {
          alert(res.message);
          this.loadTestDrives();
        } else {
          alert('❌ ' + res.message);
        }
      },
      () => {
        alert('⚠️ Lỗi kết nối máy chủ!');
      }
    );
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'test_completed':
        return 'Đã lái thử';
      case 'rejected':
        return 'Từ chối';
      default:
        return 'Không xác định';
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'pending':
        return 'text-warning';
      case 'approved':
        return 'text-success';
      case 'test_completed':
        return 'text-primary';
      case 'rejected':
        return 'text-danger';
      default:
        return '';
    }
  }

  // ===================== TAB SWITCH =====================
  setTab(tab: 'users' | 'products' | 'orders' | 'testDrive') {
    this.activeTab = tab;
  }
  // searching đăng ký lái xe
  applyTestDriveFilter() {
    this.filteredTestDriveList = this.testDriveList.filter((item) => {
      const fullName = item.fullname ? item.fullname.toLowerCase() : '';
      const phone = item.phone ? item.phone.toLowerCase() : '';
      const productName = item.product_name ? item.product_name.toLowerCase() : '';

      const nameMatch =
        !this.searchTestDrive ||
        fullName.includes(this.searchTestDrive.toLowerCase()) ||
        phone.includes(this.searchTestDrive.toLowerCase()) ||
        productName.includes(this.searchTestDrive.toLowerCase());

      const statusMatch = !this.filterStatus || item.status === this.filterStatus;
      const dateMatch =
        !this.filterDate || (item.date_schedule && item.date_schedule.startsWith(this.filterDate));

      return nameMatch && statusMatch && dateMatch;
    });
  }

  resetTestDriveFilter() {
    this.searchTestDrive = '';
    this.filterStatus = '';
    this.filterDate = '';
    this.filteredTestDriveList = this.testDriveList;
  }

  // searching sản phẩm
  // ===================== PRODUCT FILTER =====================
  applyProductsFilter() {
    this.filteredProducts = this.products.filter((item) => {
      const nameMatch =
        !this.searchProduct || item.name.toLowerCase().includes(this.searchProduct.toLowerCase());

      const categoryMatch =
        !this.filterCategory || item.kieu_dang?.toLowerCase() === this.filterCategory.toLowerCase();

      const seatsMatch =
        !this.filterSeats || String(item.so_cho_ngoi).trim() === String(this.filterSeats).trim();

      const bodyMatch = !this.filterBody || item.kieu_dang === this.filterBody;

      const fuelMatch = !this.filterBody || item.nhien_lieu === this.filterBody;

      const originMatch = !this.filterOrigin || item.xuat_xu === this.filterOrigin;

      // Bộ lọc giá (phân loại theo khoảng cố định)
      let priceMatch = true;
      if (this.filterPrice) {
        const price = Number(item.price);
        switch (this.filterPrice) {
          case 'duoi500':
            priceMatch = price < 500000000;
            break;
          case '500to800':
            priceMatch = price >= 500000000 && price <= 800000000;
            break;
          case '800to1b':
            priceMatch = price > 800000000 && price <= 1000000000;
            break;
          case 'tren1b':
            priceMatch = price > 1000000000;
            break;
        }
      }

      return (
        nameMatch &&
        categoryMatch &&
        seatsMatch &&
        bodyMatch &&
        fuelMatch &&
        originMatch &&
        priceMatch
      );
    });
  }

  resetProductsFilter() {
    this.searchProduct = '';
    this.filterCategory = '';
    this.filterSeats = '';
    this.filterBody = '';
    this.filterOrigin = '';
    this.filterPrice = '';
    this.filteredProducts = this.products;
  }

  // searching người dùng
  applyUsersFilter() {
    const searchValue = this.searchUser?.toLowerCase().trim() || '';
    const roleValue = this.filterRole?.trim() || '';

    this.filteredUsers = this.users.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const role = (item.role || '').toString().trim();

      const nameMatch = !searchValue || name.includes(searchValue);
      const roleMatch = !roleValue || role === roleValue;

      return nameMatch && roleMatch;
    });
  }
  resetUsersFilter() {
    this.searchUser = '';
    this.filterRole = '';
    this.filteredUsers = this.users;
  }
  // searching đơn hàng
  appleOrderFilter(){
    this.filteredOrders = this.orders.filter((item) => {
      const fullName = item.user_name ? item.user_name.toLowerCase() : '';
      

      const nameMatch =
        !this.searchOrder ||
        fullName.includes(this.searchOrder.toLowerCase());

      const statusMatch = !this.filterStatusOrder || item.status === this.filterStatusOrder;
      const dateMatch =
        !this.filterDateOrders || (item.order_date && item.order_date.startsWith(this.filterDateOrders));

      return nameMatch && statusMatch && dateMatch;
    });
  }
  
  showProductForm: boolean = false;
  toggleProductForm(product?: any) {
    if (product) {
      this.editingProduct = { ...product };
    } else {
      this.editingProduct = null;
    }
    this.showProductForm = !this.showProductForm;
  }

  cancelProductForm() {
    this.showProductForm = false;
    this.editingProduct = null;
  }
}
