import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { PaginationQuery } from '../types';

const parseNumberInput = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const cleaned = String(value).replace(/[^\d.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseIntegerInput = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const cleaned = String(value).replace(/[^\d-]/g, '');
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = (req.files as { [fieldname: string]: Express.Multer.File[] } | undefined) || {};
      const primaryFile = files.image?.[0] || req.file;
      const galleryFiles = files.images || [];

      const data = {
        ...req.body,
        price: parseNumberInput(req.body.price),
        originalPrice: parseNumberInput(req.body.originalPrice),
        stock: parseIntegerInput(req.body.stock),
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map((t: string) => t.trim())) : [],
        featured: req.body.featured === 'true' || req.body.featured === true,
        active: req.body.active !== 'false' && req.body.active !== false,
      };
      const product = await productService.createProduct(
        data,
        primaryFile?.buffer,
        primaryFile?.originalname,
        galleryFiles.map((f) => ({ buffer: f.buffer, name: f.originalname })),
        req.user?.userId,
      );
      sendSuccess(res, 'Product created successfully', product, 201);
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 12,
        search: req.query.search as string,
        category: req.query.category as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        includeInactive: req.user?.role === 'admin' && req.query.includeInactive === 'true',
      };
      const { products, total } = await productService.getProducts(query);
      sendPaginated(res, products, total, query.page!, query.limit!, 'Products retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      sendSuccess(res, 'Product retrieved', product);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = (req.files as { [fieldname: string]: Express.Multer.File[] } | undefined) || {};
      const primaryFile = files.image?.[0] || req.file;
      const galleryFiles = files.images || [];

      const updates: any = { ...req.body };
      if (updates.price !== undefined) updates.price = parseNumberInput(updates.price);
      if (updates.originalPrice !== undefined) updates.originalPrice = parseNumberInput(updates.originalPrice);
      if (updates.stock !== undefined) updates.stock = parseIntegerInput(updates.stock);
      if (updates.tags && !Array.isArray(updates.tags)) {
        updates.tags = updates.tags.split(',').map((t: string) => t.trim());
      }
      if (updates.featured !== undefined) {
        updates.featured = updates.featured === 'true' || updates.featured === true;
      }
      if (updates.active !== undefined) {
        updates.active = updates.active === 'true' || updates.active === true;
      }
      const product = await productService.updateProduct(
        req.params.id,
        updates,
        primaryFile?.buffer,
        primaryFile?.originalname,
        galleryFiles.map((f) => ({ buffer: f.buffer, name: f.originalname })),
      );
      sendSuccess(res, 'Product updated', product);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await productService.deleteProduct(req.params.id);
      sendSuccess(res, 'Product deleted');
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await productService.getCategories();
      sendSuccess(res, 'Categories retrieved', categories);
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      const products = await productService.getFeaturedProducts(limit);
      sendSuccess(res, 'Featured products retrieved', products);
    } catch (error) {
      next(error);
    }
  }

  async getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productService.getProductReviews(req.params.id);
      sendSuccess(res, 'Product reviews retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  async upsertProductReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const rating = parseInt(req.body.rating, 10);
      const comment = req.body.comment as string | undefined;
      const review = await productService.upsertProductReview(req.params.id, userId, rating, comment);
      sendSuccess(res, 'Review submitted', review);
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
