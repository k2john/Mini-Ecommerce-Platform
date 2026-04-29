import { v4 as uuidv4 } from 'uuid';
import { supabase, storageBucket } from '../config/supabase';
import { Product, PaginationQuery, ProductReview, ProductReviewOverview } from '../types';
import { AppError } from '../middleware/error.middleware';

const PRODUCTS_TABLE = 'products';
const USERS_TABLE = 'users';
const REVIEWS_TABLE = 'product_reviews';
const DEFAULT_PRODUCT_IMAGE = '/assets/images/placeholders/product.svg';
let supportsCreatedByColumn: boolean | null = null;

const toNumber = (value: unknown, fallback: number = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toInteger = (value: unknown, fallback: number = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);
};

const mapProductRow = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: toNumber(row.price, 0),
  originalPrice: row.original_price === null || row.original_price === undefined ? undefined : toNumber(row.original_price, 0),
  category: row.category,
  subcategory: row.subcategory ?? undefined,
  stock: toInteger(row.stock, 0),
  imageUrl: row.image_url || DEFAULT_PRODUCT_IMAGE,
  images: toStringArray(row.images),
  tags: toStringArray(row.tags),
  rating: toNumber(row.rating, 0),
  reviewCount: toInteger(row.review_count, 0),
  createdBy: row.created_by ?? undefined,
  featured: row.featured ?? false,
  active: row.active ?? true,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const mapReviewRow = (row: any): ProductReview => ({
  id: row.id,
  productId: row.product_id,
  userId: row.user_id,
  rating: row.rating,
  comment: row.comment ?? undefined,
  userName: row.users?.name || 'User',
  userAvatar: row.users?.avatar ?? undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export class ProductService {
  private isMissingCreatedByColumn(error: unknown): boolean {
    const message = (error as any)?.message;
    if (typeof message !== 'string') return false;
    const normalized = message.toLowerCase();
    return normalized.includes('created_by') && (normalized.includes('column') || normalized.includes('schema cache'));
  }

  private compactUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as Partial<T>;
  }

  private async insertProductRow(payload: Record<string, any>): Promise<void> {
    const withCreatedBy = supportsCreatedByColumn !== false;
    const insertPayload = withCreatedBy ? payload : this.compactUndefined({ ...payload, created_by: undefined });

    const { error } = await supabase.from(PRODUCTS_TABLE).insert(insertPayload);
    if (!error) {
      supportsCreatedByColumn = withCreatedBy ? true : supportsCreatedByColumn;
      return;
    }

    if (withCreatedBy && this.isMissingCreatedByColumn(error)) {
      supportsCreatedByColumn = false;
      const fallbackPayload = this.compactUndefined({ ...payload, created_by: undefined });
      const { error: fallbackError } = await supabase.from(PRODUCTS_TABLE).insert(fallbackPayload);
      if (fallbackError) throw new AppError(fallbackError.message, 500);
      return;
    }

    throw new AppError(error.message, 500);
  }

  private async updateProductRow(id: string, payload: Record<string, any>): Promise<void> {
    const withCreatedBy = supportsCreatedByColumn !== false;
    const updatePayload = withCreatedBy ? payload : this.compactUndefined({ ...payload, created_by: undefined });

    const { error } = await supabase.from(PRODUCTS_TABLE).update(updatePayload).eq('id', id);
    if (!error) {
      supportsCreatedByColumn = withCreatedBy ? true : supportsCreatedByColumn;
      return;
    }

    if (withCreatedBy && this.isMissingCreatedByColumn(error)) {
      supportsCreatedByColumn = false;
      const fallbackPayload = this.compactUndefined({ ...payload, created_by: undefined });
      const { error: fallbackError } = await supabase.from(PRODUCTS_TABLE).update(fallbackPayload).eq('id', id);
      if (fallbackError) throw new AppError(fallbackError.message, 500);
      return;
    }

    throw new AppError(error.message, 500);
  }

  async createProduct(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'poster'>,
    imageBuffer?: Buffer,
    imageName?: string,
    galleryImages: Array<{ buffer: Buffer; name: string }> = [],
    createdBy?: string,
  ): Promise<Product> {
    const productId = uuidv4();
    let imageUrl = data.imageUrl || DEFAULT_PRODUCT_IMAGE;
    const uploadedGallery: string[] = [];

    if (imageBuffer && imageName) {
      imageUrl = await this.uploadImage(imageBuffer, imageName, productId);
      uploadedGallery.push(imageUrl);
    }

    for (const img of galleryImages) {
      const url = await this.uploadImage(img.buffer, img.name, productId);
      if (!uploadedGallery.includes(url)) uploadedGallery.push(url);
    }

    const now = new Date();
    const product: Product = {
      ...data,
      id: productId,
      imageUrl,
      rating: 0,
      reviewCount: 0,
      active: data.active ?? true,
      featured: data.featured ?? false,
      tags: data.tags || [],
      images: uploadedGallery.length ? uploadedGallery : (data.images || []),
      createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await this.insertProductRow({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.originalPrice ?? null,
      category: product.category,
      subcategory: product.subcategory ?? null,
      stock: product.stock,
      image_url: product.imageUrl,
      images: product.images ?? [],
      tags: product.tags,
      rating: product.rating,
      review_count: product.reviewCount,
      created_by: product.createdBy ?? null,
      featured: product.featured,
      active: product.active,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
    });
    const [withPoster] = await this.attachPoster([product]);
    return withPoster || product;
  }

  async getProducts(query: PaginationQuery): Promise<{ products: Product[]; total: number }> {
    let dbQuery = supabase.from(PRODUCTS_TABLE).select('*');
    if (!query.includeInactive) dbQuery = dbQuery.eq('active', true);

    if (query.category) dbQuery = dbQuery.eq('category', query.category);

    const { data, error } = await dbQuery;
    if (error) throw new AppError(error.message, 500);
    let products = (data || []).map(mapProductRow);

    // Search
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    // Price filter
    if (query.minPrice !== undefined) {
      products = products.filter((p) => p.price >= (query.minPrice as number));
    }
    if (query.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= (query.maxPrice as number));
    }

    // Sort
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    products.sort((a: any, b: any) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    const total = products.length;
    const page = query.page || 1;
    const limit = query.limit || 12;
    const start = (page - 1) * limit;
    const paginated = products.slice(start, start + limit);

    const withPoster = await this.attachPoster(paginated);
    return { products: withPoster, total };
  }

  async getProductById(id: string): Promise<Product> {
    const { data, error } = await supabase.from(PRODUCTS_TABLE).select('*').eq('id', id).single();
    if (error || !data) throw new AppError('Product not found', 404);
    const mapped = mapProductRow(data);
    const [withPoster] = await this.attachPoster([mapped]);
    return withPoster || mapped;
  }

  async updateProduct(
    id: string,
    updates: Partial<Product>,
    imageBuffer?: Buffer,
    imageName?: string,
    galleryImages: Array<{ buffer: Buffer; name: string }> = [],
  ): Promise<Product> {
    const { data: existing, error: existingError } = await supabase.from(PRODUCTS_TABLE).select('*').eq('id', id).single();
    if (existingError || !existing) throw new AppError('Product not found', 404);

    const { id: _id, createdAt, ...allowedUpdates } = updates;
    let mergedImages = [...(existing.images || [])];

    if (imageBuffer && imageName) {
      allowedUpdates.imageUrl = await this.uploadImage(imageBuffer, imageName, id);
      mergedImages = [allowedUpdates.imageUrl, ...mergedImages.filter((img: string) => img !== allowedUpdates.imageUrl)];
    }

    for (const img of galleryImages) {
      const url = await this.uploadImage(img.buffer, img.name, id);
      if (!mergedImages.includes(url)) mergedImages.push(url);
    }

    if (mergedImages.length > 0 && !allowedUpdates.images) {
      allowedUpdates.images = mergedImages;
    }

    const updatePayload = this.compactUndefined({
        name: allowedUpdates.name,
        description: allowedUpdates.description,
        price: allowedUpdates.price,
        original_price: allowedUpdates.originalPrice,
        category: allowedUpdates.category,
        subcategory: allowedUpdates.subcategory,
        stock: allowedUpdates.stock,
        image_url: allowedUpdates.imageUrl,
        images: allowedUpdates.images,
        tags: allowedUpdates.tags,
        rating: allowedUpdates.rating,
        review_count: allowedUpdates.reviewCount,
        created_by: allowedUpdates.createdBy,
        featured: allowedUpdates.featured,
        active: allowedUpdates.active,
        updated_at: new Date().toISOString(),
      });
    await this.updateProductRow(id, updatePayload);

    const { data: updated, error: fetchError } = await supabase.from(PRODUCTS_TABLE).select('*').eq('id', id).single();
    if (fetchError || !updated) throw new AppError('Product not found', 404);
    const mapped = mapProductRow(updated);
    const [withPoster] = await this.attachPoster([mapped]);
    return withPoster || mapped;
  }

  async deleteProduct(id: string): Promise<void> {
    const { data: existing, error: existingError } = await supabase.from(PRODUCTS_TABLE).select('id').eq('id', id).single();
    if (existingError || !existing) throw new AppError('Product not found', 404);

    const { error: reviewDeleteError } = await supabase.from(REVIEWS_TABLE).delete().eq('product_id', id);
    if (reviewDeleteError) throw new AppError(reviewDeleteError.message, 500);

    const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq('id', id);
    if (!error) return;

    // Fallback for constrained environments: keep CRUD operation functional via soft delete.
    const lowered = error.message.toLowerCase();
    const isConstraintError = lowered.includes('foreign key') || lowered.includes('violat');
    if (isConstraintError) {
      const { error: softDeleteError } = await supabase
        .from(PRODUCTS_TABLE)
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (softDeleteError) throw new AppError(softDeleteError.message, 500);
      return;
    }

    throw new AppError(error.message, 500);
  }

  async getCategories(): Promise<string[]> {
    const { data: snapshot, error } = await supabase.from(PRODUCTS_TABLE).select('category').eq('active', true);
    if (error) throw new AppError(error.message, 500);
    const categories = new Set<string>();
    (snapshot || []).forEach((row: any) => {
      if (row.category) categories.add(row.category);
    });
    return Array.from(categories).sort();
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .eq('active', true)
      .eq('featured', true)
      .limit(limit);
    if (error) throw new AppError(error.message, 500);
    const products = (data || []).map(mapProductRow);
    return this.attachPoster(products);
  }

  async getProductReviews(productId: string): Promise<{ reviews: ProductReview[]; overview: ProductReviewOverview }> {
    const { data, error } = await supabase
      .from(REVIEWS_TABLE)
      .select('*, users:user_id(name, avatar)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);

    const reviews = (data || []).map(mapReviewRow);
    return { reviews, overview: this.computeReviewOverview(reviews) };
  }

  async upsertProductReview(productId: string, userId: string, rating: number, comment?: string): Promise<ProductReview> {
    const { data: product, error: productError } = await supabase
      .from(PRODUCTS_TABLE)
      .select('id')
      .eq('id', productId)
      .single();
    if (productError || !product) throw new AppError('Product not found', 404);

    const payload = {
      product_id: productId,
      user_id: userId,
      rating,
      comment: comment || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from(REVIEWS_TABLE)
      .upsert(payload, { onConflict: 'product_id,user_id' });
    if (error) throw new AppError(error.message, 500);

    await this.refreshProductRating(productId);

    const { data: saved, error: fetchError } = await supabase
      .from(REVIEWS_TABLE)
      .select('*, users:user_id(name, avatar)')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();
    if (fetchError || !saved) throw new AppError('Review not found', 404);
    return mapReviewRow(saved);
  }

  private async uploadImage(buffer: Buffer, originalName: string, productId: string): Promise<string> {
    const ext = originalName.split('.').pop();
    const fileName = `products/${productId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(storageBucket).upload(fileName, buffer, {
      contentType: `image/${ext}`,
      upsert: true,
    });
    if (error) throw new AppError(error.message, 500);

    const { data } = supabase.storage.from(storageBucket).getPublicUrl(fileName);
    return data.publicUrl;
  }

  private async attachPoster(products: Product[]): Promise<Product[]> {
    const userIds = Array.from(new Set(products.map((p) => p.createdBy).filter(Boolean))) as string[];
    if (!userIds.length) return products;

    const { data, error } = await supabase.from(USERS_TABLE).select('id,name,avatar').in('id', userIds);
    if (error) return products;

    const map = new Map((data || []).map((u: any) => [u.id, u]));
    return products.map((p) => ({
      ...p,
      poster: p.createdBy && map.has(p.createdBy)
        ? { id: p.createdBy, name: map.get(p.createdBy).name, avatar: map.get(p.createdBy).avatar ?? undefined }
        : undefined,
    }));
  }

  private computeReviewOverview(reviews: ProductReview[]): ProductReviewOverview {
    const breakdown: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    let total = 0;
    for (const r of reviews) {
      breakdown[String(r.rating)] = (breakdown[String(r.rating)] || 0) + 1;
      total += r.rating;
    }
    const averageRating = reviews.length ? Number((total / reviews.length).toFixed(2)) : 0;
    return { averageRating, totalReviews: reviews.length, ratingBreakdown: breakdown };
  }

  private async refreshProductRating(productId: string): Promise<void> {
    const { data, error } = await supabase.from(REVIEWS_TABLE).select('rating').eq('product_id', productId);
    if (error) throw new AppError(error.message, 500);

    const rows = data || [];
    const reviewCount = rows.length;
    const avg = reviewCount ? rows.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / reviewCount : 0;

    const { error: updateError } = await supabase
      .from(PRODUCTS_TABLE)
      .update({
        rating: Number(avg.toFixed(2)),
        review_count: reviewCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);
    if (updateError) throw new AppError(updateError.message, 500);
  }
}

export const productService = new ProductService();
