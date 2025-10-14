import { Routes } from '@angular/router';
import { Trangchu } from './trangchu/trangchu';
import { Gioithieu } from './gioithieu/gioithieu';
import { Sanpham } from './sanpham/sanpham';
import { Lienhe } from './lienhe/lienhe';
import { Chitietsanpham } from './sanpham/chitietsanpham/chitietsanpham';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Admin } from './admin/admin';
import { Cart } from './auth/cart/cart';
import { AuthGuard } from './auth-guard';
import { Checkout } from './auth/checkout/checkout';
import { MyOrdersComponent } from './auth/my-orders/my-orders';
export const routes: Routes = [
  // { path: '', redirectTo: 'trangchu', pathMatch: 'full' },
  { path: '', component: Trangchu },
  { path: 'about', component: Gioithieu },
  { path: 'shop', component: Sanpham },
  { path: 'contact', component: Lienhe },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'cart', component: Cart, canActivate: [AuthGuard] },
  { path: 'checkout', component: Checkout, canActivate: [AuthGuard] },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [AuthGuard] },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadComponent: () => import('./admin/admin').then((m) => m.Admin),
    children: [
      {
        path: 'products',
        loadComponent: () => import('./admin/products/products').then((m) => m.Products),
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin/orders/orders').then((m) => m.Orders),
      },
      { path: 'users', loadComponent: () => import('./admin/users/users').then((m) => m.Users) },
      {
        path: 'test-drive',
        loadComponent: () =>
          import('./admin/test-drive/test-drive').then((m) => m.AdminTestDriveComponent),
      },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },
  { path: 'chitietsanpham', component: Chitietsanpham },
  { path: 'chitietsanpham/:id', component: Chitietsanpham },
  { path: 'auth', loadChildren: () => import('./auth/auth-module').then((m) => m.AuthModule) },
];
