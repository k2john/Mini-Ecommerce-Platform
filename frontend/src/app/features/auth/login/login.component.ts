import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50 flex items-center justify-center px-4 py-16">
      <div class="w-full max-w-md">
        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-10 text-center">
            <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-white">Welcome back</h1>
            <p class="text-amber-100 text-sm mt-1">Sign in to your Bazaar account</p>
          </div>

          <!-- Form -->
          <div class="px-8 py-8">
            @if (errorMessage) {
              <div class="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                {{ errorMessage }}
              </div>
            }

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
              <!-- Email -->
              <div>
                <label class="block text-sm font-semibold text-stone-700 mb-1.5">Email address</label>
                <input formControlName="email" type="email" placeholder="you@example.com"
                  class="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none
                    focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                    placeholder:text-stone-400 bg-stone-50 focus:bg-white"
                  [class.border-red-400]="f['email'].invalid && f['email'].touched"
                  [class.border-stone-200]="!(f['email'].invalid && f['email'].touched)">
                @if (f['email'].invalid && f['email'].touched) {
                  <p class="text-red-500 text-xs mt-1">Valid email is required.</p>
                }
              </div>

              <!-- Password -->
              <div>
                <label class="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
                <div class="relative">
                  <input formControlName="password" [type]="showPassword ? 'text' : 'password'" placeholder="••••••••"
                    class="w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none pr-10
                      focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                      placeholder:text-stone-400 bg-stone-50 focus:bg-white"
                    [class.border-red-400]="f['password'].invalid && f['password'].touched"
                    [class.border-stone-200]="!(f['password'].invalid && f['password'].touched)">
                  <button type="button" (click)="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        [attr.d]="showPassword
                          ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                          : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'"/>
                    </svg>
                  </button>
                </div>
                @if (f['password'].invalid && f['password'].touched) {
                  <p class="text-red-500 text-xs mt-1">Password is required.</p>
                }
              </div>

              <!-- Submit -->
              <button type="submit" [disabled]="loading"
                class="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold
                  py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                @if (loading) {
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                } @else {
                  Sign in
                }
              </button>
            </form>

            <p class="text-center text-sm text-stone-500 mt-6">
              Don't have an account?
              <a routerLink="/auth/register" class="text-amber-600 font-semibold hover:text-amber-700">Create one</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  errorMessage = '';
  showPassword = false;

  get f() { return this.loginForm.controls; }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.loginForm.value as any).subscribe({
      next: () => {
        this.cartService.loadCart().subscribe();
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Invalid email or password.';
        this.loading = false;
      },
    });
  }
}
