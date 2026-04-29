import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

function passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    confirm.setErrors({ mismatch: true });
  } else {
    confirm?.setErrors(null);
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50 flex items-center justify-center px-4 py-16">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
          <div class="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-10 text-center">
            <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-white">Create account</h1>
            <p class="text-amber-100 text-sm mt-1">Join Bazaar and start shopping</p>
          </div>

          <div class="px-8 py-8">
            @if (errorMessage) {
              <div class="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {{ errorMessage }}
              </div>
            }

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-stone-700 mb-1.5">Full Name</label>
                <input formControlName="name" type="text" placeholder="John Doe"
                  class="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                    focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                    placeholder:text-stone-400 bg-stone-50 focus:bg-white"
                  [class.border-red-400]="f['name'].invalid && f['name'].touched"
                  [class.border-stone-200]="!(f['name'].invalid && f['name'].touched)">
                @if (f['name'].errors?.['required'] && f['name'].touched) {
                  <p class="text-red-500 text-xs mt-1">Name is required.</p>
                }
                @if (f['name'].errors?.['minlength'] && f['name'].touched) {
                  <p class="text-red-500 text-xs mt-1">Name must be at least 2 characters.</p>
                }
              </div>

              <div>
                <label class="block text-sm font-semibold text-stone-700 mb-1.5">Email address</label>
                <input formControlName="email" type="email" placeholder="you@example.com"
                  class="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                    focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                    placeholder:text-stone-400 bg-stone-50 focus:bg-white"
                  [class.border-red-400]="f['email'].invalid && f['email'].touched"
                  [class.border-stone-200]="!(f['email'].invalid && f['email'].touched)">
                @if (f['email'].invalid && f['email'].touched) {
                  <p class="text-red-500 text-xs mt-1">Valid email is required.</p>
                }
              </div>

              <div>
                <label class="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
                <input formControlName="password" type="password" placeholder="Min 6 chars, include a number"
                  class="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                    focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                    placeholder:text-stone-400 bg-stone-50 focus:bg-white"
                  [class.border-red-400]="f['password'].invalid && f['password'].touched"
                  [class.border-stone-200]="!(f['password'].invalid && f['password'].touched)">
                @if (f['password'].errors?.['required'] && f['password'].touched) {
                  <p class="text-red-500 text-xs mt-1">Password is required.</p>
                }
                @if (f['password'].errors?.['minlength'] && f['password'].touched) {
                  <p class="text-red-500 text-xs mt-1">Password must be at least 6 characters.</p>
                }
                @if (f['password'].errors?.['pattern'] && f['password'].touched) {
                  <p class="text-red-500 text-xs mt-1">Password must contain at least one number.</p>
                }
              </div>

              <div>
                <label class="block text-sm font-semibold text-stone-700 mb-1.5">Confirm Password</label>
                <input formControlName="confirmPassword" type="password" placeholder="Repeat your password"
                  class="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                    focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                    placeholder:text-stone-400 bg-stone-50 focus:bg-white"
                  [class.border-red-400]="f['confirmPassword'].errors?.['mismatch'] && f['confirmPassword'].touched"
                  [class.border-stone-200]="!(f['confirmPassword'].errors?.['mismatch'] && f['confirmPassword'].touched)">
                @if (f['confirmPassword'].errors?.['mismatch'] && f['confirmPassword'].touched) {
                  <p class="text-red-500 text-xs mt-1">Passwords do not match.</p>
                }
              </div>

              <button type="submit" [disabled]="loading"
                class="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold
                  py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-2">
                @if (loading) {
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                } @else {
                  Create account
                }
              </button>
            </form>

            <p class="text-center text-sm text-stone-500 mt-6">
              Already have an account?
              <a routerLink="/auth/login" class="text-amber-600 font-semibold hover:text-amber-700">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/\d/)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  loading = false;
  errorMessage = '';
  get f() { return this.registerForm.controls; }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = '';
    const { name, email, password } = this.registerForm.value;
    this.authService.register({ name: name!, email: email!, password: password! }).subscribe({
      next: () => {
        this.cartService.loadCart().subscribe();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
