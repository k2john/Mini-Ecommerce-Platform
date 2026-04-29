const path = require('path');
const { randomUUID } = require('crypto');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const nowIso = () => new Date().toISOString();

const seedProducts = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Comfortable over-ear wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 129.99,
    original_price: 179.99,
    category: 'Electronics',
    stock: 24,
    image_url: 'https://placehold.co/600x600/f5f5f4/444?text=Headphones',
    tags: ['audio', 'wireless', 'featured'],
    featured: true,
    active: true,
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track steps, heart rate, sleep, and workouts with a bright display and water resistance.',
    price: 89.99,
    original_price: 119.99,
    category: 'Wearables',
    stock: 30,
    image_url: 'https://placehold.co/600x600/f5f5f4/444?text=Fitness+Watch',
    tags: ['fitness', 'health', 'smartwatch'],
    featured: true,
    active: true,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Tactile mechanical keyboard with hot-swappable switches, RGB backlight, and compact layout.',
    price: 74.5,
    original_price: 99.0,
    category: 'Accessories',
    stock: 18,
    image_url: 'https://placehold.co/600x600/f5f5f4/444?text=Keyboard',
    tags: ['keyboard', 'office', 'gaming'],
    featured: false,
    active: true,
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Adjustable lumbar support, breathable mesh back, and smooth-rolling wheels for all-day comfort.',
    price: 159.0,
    original_price: 219.0,
    category: 'Furniture',
    stock: 12,
    image_url: 'https://placehold.co/600x600/f5f5f4/444?text=Office+Chair',
    tags: ['office', 'chair', 'ergonomic'],
    featured: false,
    active: true,
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Compact speaker with punchy sound, IPX7 splash resistance, and up to 12 hours of playtime.',
    price: 49.99,
    original_price: 69.99,
    category: 'Electronics',
    stock: 40,
    image_url: 'https://placehold.co/600x600/f5f5f4/444?text=Speaker',
    tags: ['speaker', 'bluetooth', 'portable'],
    featured: true,
    active: true,
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated reusable bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 24.99,
    original_price: 34.99,
    category: 'Lifestyle',
    stock: 55,
    image_url: 'https://placehold.co/600x600/f5f5f4/444?text=Water+Bottle',
    tags: ['bottle', 'lifestyle', 'outdoors'],
    featured: false,
    active: true,
  },
];

async function seed() {
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Failed to read products table:', countError.message);
    process.exit(1);
  }

  if ((count || 0) > 0) {
    console.log(`Skipped seeding: products table already has ${count} record(s).`);
    return;
  }

  const rows = seedProducts.map((p) => ({
    id: randomUUID(),
    ...p,
    images: [],
    rating: 0,
    review_count: 0,
    subcategory: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  }));

  const { error } = await supabase.from('products').insert(rows);
  if (error) {
    console.error('Failed to insert seed products:', error.message);
    process.exit(1);
  }

  console.log(`Seed complete: inserted ${rows.length} product(s).`);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
