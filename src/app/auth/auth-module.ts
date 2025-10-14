import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing-module';

// Standalone components
import { Login } from './login/login';
import { Register } from './register/register';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AuthRoutingModule,
    Login,    // standalone component -> đưa vào imports
    Register  // standalone component -> đưa vào imports
  ]
})
export class AuthModule { }
