import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="min-h-[70vh] bg-gradient-to-b from-violet-50 via-white to-indigo-50 py-8 sm:py-12">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl overflow-hidden border border-violet-100 shadow-xl shadow-violet-100/50 bg-white">
          <div class="bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 p-6 sm:p-8 text-white relative">
            <div class="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10"></div>
            <p class="text-xs uppercase tracking-[0.2em] text-violet-100 font-semibold">Account Center</p>
            <h1 class="text-2xl sm:text-3xl font-extrabold mt-2">My Profile</h1>
            <p class="text-violet-100 text-sm mt-2">Update your personal information and profile image.</p>
          </div>

          <div class="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <aside class="lg:col-span-1">
              <div class="bg-violet-50 border border-violet-100 rounded-2xl p-5 text-center">
                <div class="relative w-28 h-28 mx-auto">
                  <img [src]="previewImage || authService.currentUser()?.avatar || '/assets/images/placeholders/avatar.svg'"
                    class="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md">
                </div>
                <h2 class="mt-4 font-bold text-stone-900">{{ authService.currentUser()?.name }}</h2>
                <p class="text-xs text-stone-500">{{ authService.currentUser()?.email }}</p>
                <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                  [class.bg-indigo-100]="authService.currentUser()?.role === 'admin'"
                  [class.text-indigo-700]="authService.currentUser()?.role === 'admin'"
                  [class.bg-emerald-100]="authService.currentUser()?.role !== 'admin'"
                  [class.text-emerald-700]="authService.currentUser()?.role !== 'admin'">
                  {{ authService.currentUser()?.role === 'admin' ? 'Administrator' : 'Customer' }}
                </span>
                <label class="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-violet-200 text-violet-700 text-sm font-semibold cursor-pointer hover:bg-violet-100 transition-colors">
                  Change Photo
                  <input type="file" class="hidden" accept="image/*" (change)="onAvatarChange($event)">
                </label>
              </div>
            </aside>

            <div class="lg:col-span-2">
              @if (message) {
                <div class="mb-4 px-4 py-3 rounded-xl text-sm"
                  [class.bg-emerald-50]="messageType === 'success'"
                  [class.text-emerald-700]="messageType === 'success'"
                  [class.border]="true"
                  [class.border-emerald-200]="messageType === 'success'"
                  [class.bg-red-50]="messageType === 'error'"
                  [class.text-red-700]="messageType === 'error'"
                  [class.border-red-200]="messageType === 'error'">
                  {{ message }}
                </div>
              }

              <form [formGroup]="profileForm" (ngSubmit)="save()" class="space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="sm:col-span-2">
                    <label class="block text-sm font-semibold text-stone-700 mb-1.5">Full Name</label>
                    <input formControlName="name" type="text" class="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-sm font-semibold text-stone-700 mb-1.5">Email</label>
                    <input formControlName="email" type="email" class="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-stone-700 mb-1.5">Phone</label>
                    <input formControlName="phone" type="text" class="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-stone-700 mb-1.5">Country</label>
                    <input formControlName="country" type="text" class="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-sm font-semibold text-stone-700 mb-1.5">Street</label>
                    <input formControlName="street" type="text" class="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-stone-700 mb-1.5">City</label>
                    <input formControlName="city" type="text" class="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-stone-700 mb-1.5">State</label>
                    <input formControlName="state" type="text" class="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-stone-700 mb-1.5">ZIP</label>
                    <input formControlName="zip" type="text" class="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                  </div>
                </div>

                <button type="submit" [disabled]="saving"
                  class="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-sm font-semibold transition-colors">
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ProfileComponent implements OnInit {
  saving = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  avatarFile: File | null = null;
  previewImage = '';

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    street: [''],
    city: [''],
    state: [''],
    zip: [''],
    country: [''],
  });

  constructor(private fb: FormBuilder, public authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    this.profileForm.patchValue({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zip: user.address?.zip || '',
      country: user.address?.country || '',
    });
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.avatarFile = file;
    this.previewImage = URL.createObjectURL(file);
  }

  save(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.message = '';

    const formData = new FormData();
    const val = this.profileForm.value;
    formData.append('name', val.name || '');
    formData.append('email', val.email || '');
    formData.append('phone', val.phone || '');
    formData.append('address', JSON.stringify({
      street: val.street || '',
      city: val.city || '',
      state: val.state || '',
      zip: val.zip || '',
      country: val.country || '',
    }));
    if (this.avatarFile) formData.append('avatar', this.avatarFile);

    this.authService.updateProfile(formData).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Profile updated successfully.';
        this.messageType = 'success';
      },
      error: (err) => {
        this.saving = false;
        this.message = err?.error?.errors?.[0] || err?.error?.message || 'Failed to update profile.';
        this.messageType = 'error';
      },
    });
  }
}
