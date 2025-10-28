import {
  Component,
  HostListener,
  AfterViewInit,
  ElementRef,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { NavigationEnd, RouterModule } from '@angular/router';
import { AuthService, UserData } from '../auth/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
declare var bootstrap: any;
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, AfterViewInit {
  // Thêm OnInit nếu chưa có
  cartItemCount = 0;
  isLoggedIn = false;
  user: UserData | null = null;

  constructor(
    private el: ElementRef,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeNavbar();
      }
    });
  }

  isShow = false;
  private topPosToStartShowing = 200;

  @HostListener('window:scroll')
  checkScroll() {
    const scrollPosition =
      window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    this.isShow = scrollPosition >= this.topPosToStartShowing;
  }

  backToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  ngAfterViewInit(): void {
    const carousel = document.querySelector('#carouselExampleIndicators') as HTMLElement;
    const counter = document.querySelector('#carousel-counter') as HTMLElement;
    const items = carousel.querySelectorAll('.carousel-item') as NodeListOf<HTMLElement>;
    const total = items.length;
    counter.textContent = `1 / ${total}`;
    carousel.addEventListener('slid.bs.carousel', () => {
      const itemsArray = Array.from(items);
      const activeIndex = itemsArray.findIndex((item) => item.classList.contains('active'));
      counter.textContent = `${activeIndex + 1} / ${total}`;
    });
  }
  ngOnInit() {
    // 1. Subscribe để nhận thông tin user (Login/Logout)
    this.authService.user$.subscribe((user) => {
      this.user = user;
      this.isLoggedIn = !!user;
      this.cdr.detectChanges();
    });

    // 2. THE FIX: Subscribe để lắng nghe số lượng giỏ hàng thay đổi TỪ BẤT CỨ ĐÂU
    // Khi AuthService.cart$ được .next() (thêm/xóa/cập nhật), đoạn code này sẽ chạy.
    this.authService.cart$.subscribe((cart) => {
      // cart.length là số lượng sản phẩm (unique items) trong giỏ hàng
      this.cartItemCount = cart.length;
      this.cdr.detectChanges(); // Bắt buộc Angular cập nhật giao diện ngay lập tức
    });
  }

  // HÀM loadCartCount CŨ KHÔNG CẦN THIẾT NỮA VÌ ĐÃ CÓ SUBSCRIPTION

  goToCart() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/cart']);
    }
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.user = null;
    this.router.navigate(['/']);
  }
  closeNavbar() {
    const navbar = document.getElementById('templatemo_main_nav');
    const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement;

    // Nếu menu đang mở thì đóng lại
    if (navbar?.classList.contains('show')) {
      navbar.classList.remove('show');
      navbarToggler?.classList.add('collapsed');
      navbarToggler?.setAttribute('aria-expanded', 'false');
    }
  }
}
