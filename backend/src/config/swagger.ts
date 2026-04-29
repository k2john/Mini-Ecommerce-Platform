import swaggerJsdoc from 'swagger-jsdoc';

const getProductionApiUrl = (): string => {
  const explicit = process.env.PUBLIC_API_URL?.trim();
  if (explicit) {
    return explicit.endsWith('/api') ? explicit : `${explicit.replace(/\/+$/, '')}/api`;
  }

  const renderExternalUrl = process.env.RENDER_EXTERNAL_URL?.trim();
  if (renderExternalUrl) {
    return `${renderExternalUrl.replace(/\/+$/, '')}/api`;
  }

  return 'https://final-ecommerce-33sd.onrender.com/api';
};

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini E-Commerce API',
      version: '1.0.0',
      description: 'RESTful API for Mini E-Commerce Platform built with Node.js, Express, TypeScript, and Supabase',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
      {
        url: getProductionApiUrl(),
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string' },
            stock: { type: 'integer' },
            imageUrl: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  quantity: { type: 'integer' },
                },
              },
            },
            total: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
            shippingAddress: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
