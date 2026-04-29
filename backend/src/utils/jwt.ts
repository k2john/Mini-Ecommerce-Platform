import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN as string;

// Generate Access Token
export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, {
  expiresIn: JWT_EXPIRES_IN as any,
});
};

// Generate Refresh Token
export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as any,
  });
};

// Verify Access Token
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};