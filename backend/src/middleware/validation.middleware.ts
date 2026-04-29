import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    });
    return;
  }
  next();
};

// Auth validators
export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').matches(/\d/).withMessage('Password must contain a number'),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Product validators
export const productValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ min: 2, max: 100 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 10, max: 2000 }),
  body('price').isFloat({ min: 0, max: 9999999999.99 }).withMessage('Price must be between 0 and 9,999,999,999.99'),
  body('originalPrice')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0, max: 9999999999.99 })
    .withMessage('Original price must be between 0 and 9,999,999,999.99'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0, max: 2147483647 }).withMessage('Stock must be a non-negative integer'),
];

// Order validators
export const orderValidator = [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
];

// Cart validators
export const cartItemValidator = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

export const cartUpdateValidator = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

export const orderStatusValidator = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
];

// Pagination validators
export const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
];

export const idValidator = [
  param('id').notEmpty().withMessage('ID is required'),
];

export const reviewValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional({ values: 'falsy' }).isLength({ max: 1000 }).withMessage('Comment must be at most 1000 characters'),
];
