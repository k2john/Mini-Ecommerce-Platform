import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../../shared/models';
import { AuthService } from './auth.service';

interface WishlistEntry {
  product: Product;
  addedAt: string;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly STORAGE_PREFIX = 'ec_wishlist_';
  private readonly _entries = signal<WishlistEntry[]>([]);
  private storageKey = '';

  readonly entries = this._entries.asReadonly();
  readonly products = computed(() => this._entries().map((entry) => entry.product));
  readonly count = computed(() => this._entries().length);

  constructor(private authService: AuthService) {
    effect(() => {
      const ownerId = this.authService.currentUser()?.id || 'guest';
      this.storageKey = `${this.STORAGE_PREFIX}${ownerId}`;
      this._entries.set(this.readEntries());
    });
  }

  isFavorite(productId: string): boolean {
    return this._entries().some((entry) => entry.product.id === productId);
  }

  toggle(product: Product): boolean {
    if (this.isFavorite(product.id)) {
      this.remove(product.id);
      return false;
    }

    this.add(product);
    return true;
  }

  add(product: Product): void {
    const existing = this._entries();
    const now = new Date().toISOString();
    const idx = existing.findIndex((entry) => entry.product.id === product.id);
    let next: WishlistEntry[];

    if (idx >= 0) {
      next = [...existing];
      next[idx] = { ...next[idx], product };
    } else {
      next = [{ product, addedAt: now }, ...existing];
    }

    this._entries.set(next);
    this.persistEntries(next);
  }

  remove(productId: string): void {
    const next = this._entries().filter((entry) => entry.product.id !== productId);
    this._entries.set(next);
    this.persistEntries(next);
  }

  syncProduct(product: Product): void {
    const existing = this._entries();
    const idx = existing.findIndex((entry) => entry.product.id === product.id);
    if (idx === -1) return;

    const next = [...existing];
    next[idx] = { ...next[idx], product };
    this._entries.set(next);
    this.persistEntries(next);
  }

  syncProducts(products: Product[]): void {
    if (!products.length) return;
    const byId = new Map(products.map((p) => [p.id, p]));
    let changed = false;

    const next = this._entries().map((entry) => {
      const updated = byId.get(entry.product.id);
      if (!updated) return entry;
      changed = true;
      return { ...entry, product: updated };
    });

    if (changed) {
      this._entries.set(next);
      this.persistEntries(next);
    }
  }

  private readEntries(): WishlistEntry[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as WishlistEntry[];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((entry) => entry?.product?.id)
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    } catch {
      return [];
    }
  }

  private persistEntries(entries: WishlistEntry[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  }
}
