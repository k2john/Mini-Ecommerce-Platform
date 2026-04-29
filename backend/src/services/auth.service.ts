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

  // ================= REGISTER =================
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: Omit<User, 'password'>; token: string }> {

    // check existing user
    const { data: existingUser, error: existingUserError } = await supabase
      .from(USERS_TABLE)
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUserError) {
      console.error('Check user error:', existingUserError);
      throw new AppError(existingUserError.message, 500);
    }

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // count users
    const { count, error: countError } = await supabase
      .from(USERS_TABLE)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
      throw new AppError(countError.message, 500);
    }

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

    // ================= INSERT (FIXED) =================
    const { data: insertedUser, error: insertError } = await supabase
      .from(USERS_TABLE)
      .insert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        avatar: null,
        phone: null,
        address: null,
        created_at: newUser.createdAt.toISOString(),
        updated_at: newUser.updatedAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Supabase Insert Error:', insertError);
      throw new AppError(insertError.message, 500);
    }

    console.log('✅ User inserted successfully:', insertedUser);

    const token = this.generateToken({
      userId,
      email,
      role: newUser.role, // FIXED (was hardcoded before)
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword, token };
  }

  // ================= LOGIN =================
  async login(email: string, password: string) {
    const { data: users, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);

    if (!users) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = mapUserRow(users);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  // ================= PROFILE =================
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      throw new AppError('User not found', 404);
    }

    const user = mapUserRow(data);
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  // ================= UPDATE =================
  async updateProfile(
    userId: string,
    updates: Partial<User>,
    avatarBuffer?: Buffer,
    avatarName?: string
  ) {
    let avatarUrl: string | undefined;

    if (avatarBuffer && avatarName) {
      avatarUrl = await this.uploadAvatar(avatarBuffer, avatarName, userId);
    }

    const { error } = await supabase
      .from(USERS_TABLE)
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        address: updates.address,
        avatar: avatarUrl ?? updates.avatar,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw new AppError(error.message, 500);

    const { data } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!data) throw new AppError('User not found', 404);

    const user = mapUserRow(data);
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  // ================= USERS LIST =================
  async getAllUsers(page = 1, limit = 10) {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);

    const allUsers = (data || []).map((row) => {
      const user = mapUserRow(row);
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    const total = allUsers.length;
    const start = (page - 1) * limit;

    return {
      users: allUsers.slice(start, start + limit),
      total,
    };
  }

  // ================= JWT =================
  private generateToken(payload: JwtPayload): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing in environment variables');
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
  }

  // ================= AVATAR =================
  private async uploadAvatar(buffer: Buffer, originalName: string, userId: string) {
    const ext = originalName.split('.').pop() || 'jpg';
    const fileName = `avatars/${userId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(storageBucket)
      .upload(fileName, buffer, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) throw new AppError(error.message, 500);

    const { data } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
}

export const authService = new AuthService();
