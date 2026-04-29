import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabase, storageBucket } from '../config/supabase';
import { User, JwtPayload } from '../types';
import { AppError } from '../middleware/error.middleware';

const USERS_TABLE = 'users';

const mapUserRow = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  password: row.password,
  role: row.role,
  avatar: row.avatar ?? undefined,
  phone: row.phone ?? undefined,
  address: row.address ?? undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export class AuthService {
  async register(name: string, email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const { data: existingUser, error: existingUserError } = await supabase
      .from(USERS_TABLE)
      .select('id')
      .eq('email', email)
      .limit(1);

    if (existingUserError) throw new AppError(existingUserError.message, 500);
    if (existingUser && existingUser.length > 0) {
      throw new AppError('Email already registered', 409);
    }

    // Check if this is the first user
    const { count, error: countError } = await supabase
      .from(USERS_TABLE)
      .select('*', { count: 'exact', head: true });

    if (countError) throw new AppError(countError.message, 500);
    const isFirstUser = (count || 0) === 0;

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const now = new Date();

    const newUser: User = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: isFirstUser ? 'admin' : 'user',
      createdAt: now,
      updatedAt: now,
    };

    const { error: insertError } = await supabase.from(USERS_TABLE).insert({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      avatar: newUser.avatar ?? null,
      phone: newUser.phone ?? null,
      address: newUser.address ?? null,
      created_at: newUser.createdAt.toISOString(),
      updated_at: newUser.updatedAt.toISOString(),
    });
    if (insertError) throw new AppError(insertError.message, 500);

    const token = this.generateToken({ userId, email, role: 'user' });
    const { password: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const { data: users, error } = await supabase.from(USERS_TABLE).select('*').eq('email', email).limit(1);
    if (error) throw new AppError(error.message, 500);

    if (!users || users.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = mapUserRow(users[0]);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken({ userId: user.id, email: user.email, role: user.role });
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const { data: userRow, error } = await supabase.from(USERS_TABLE).select('*').eq('id', userId).single();
    if (error || !userRow) {
      throw new AppError('User not found', 404);
    }

    const user = mapUserRow(userRow);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, updates: Partial<User>, avatarBuffer?: Buffer, avatarName?: string): Promise<Omit<User, 'password'>> {
    const { data: existingUser, error: existingUserError } = await supabase.from(USERS_TABLE).select('id').eq('id', userId).single();
    if (existingUserError || !existingUser) {
      throw new AppError('User not found', 404);
    }

    const { password, role, id, createdAt, ...allowedUpdates } = updates;
    if (avatarBuffer && avatarName) {
      allowedUpdates.avatar = await this.uploadAvatar(avatarBuffer, avatarName, userId);
    }

    const { error: updateError } = await supabase
      .from(USERS_TABLE)
      .update({
        name: allowedUpdates.name,
        email: allowedUpdates.email,
        avatar: allowedUpdates.avatar,
        phone: allowedUpdates.phone,
        address: allowedUpdates.address,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (updateError) throw new AppError(updateError.message, 500);

    const { data: updatedUserRow, error: fetchError } = await supabase.from(USERS_TABLE).select('*').eq('id', userId).single();
    if (fetchError || !updatedUserRow) throw new AppError('User not found', 404);
    const user = mapUserRow(updatedUserRow);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: Omit<User, 'password'>[]; total: number }> {
    const { data, error } = await supabase.from(USERS_TABLE).select('*').order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);

    const allUsers = (data || []).map((row) => {
      const user = mapUserRow(row);
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    const total = allUsers.length;
    const start = (page - 1) * limit;
    const users = allUsers.slice(start, start + limit);

    return { users, total };
  }

  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
  }

  private async uploadAvatar(buffer: Buffer, originalName: string, userId: string): Promise<string> {
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `avatars/${userId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(storageBucket).upload(fileName, buffer, {
      contentType: `image/${ext}`,
      upsert: true,
    });
    if (error) throw new AppError(error.message, 500);

    const { data } = supabase.storage.from(storageBucket).getPublicUrl(fileName);
    return data.publicUrl;
  }
}

export const authService = new AuthService();
