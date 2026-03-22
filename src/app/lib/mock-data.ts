// Mock data for the photography marketplace

export type ProductType = 'photo' | 'bundle' | 'typography' | 'poster' | 'banner';
export type Resolution = 'HD' | 'Full HD' | '4K';
export type Orientation = 'portrait' | 'landscape' | 'square';

export interface Product {
  id: string;
  title: string;
  description: string;
  type: ProductType;
  categories: string[];
  tags: string[];
  previewImage: string;
  bundleImages?: string[];
  orientation: Orientation;
  uploadDate: string;
  popularity: number;
  prices: {
    HD: number;
    'Full HD': number;
    '4K': number;
  };
  status: 'active' | 'inactive';
  filesCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  joinDate: string;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    resolution: Resolution;
    price: number;
  }[];
  total: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paymentId: string;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  tags: string[];
}

export interface Advertisement {
  id: string;
  image: string;
  url: string;
  status: 'active' | 'inactive';
  position: 'home-sidebar' | 'explore' | 'blog';
}

export const categories: Category[] = [
  { id: '1', name: 'Wildlife', slug: 'wildlife', image: 'https://images.unsplash.com/photo-1678048632153-d961f9c37a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkbGlmZSUyMGFuaW1hbHMlMjBuYXR1cmV8ZW58MXx8fHwxNzcxNDc5NDgzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', productCount: 145, status: 'active' },
  { id: '2', name: 'Nature', slug: 'nature', image: 'https://images.unsplash.com/photo-1717964134799-a98f497172a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzcxNTMwNDgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', productCount: 289, status: 'active' },
  { id: '3', name: 'Wedding', slug: 'wedding', image: 'https://images.unsplash.com/photo-1664463760672-8dc6d190d720?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYnJpZGUlMjBncm9vbXxlbnwxfHx8fDE3NzE1MzA0ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', productCount: 167, status: 'active' },
  { id: '4', name: 'Baby', slug: 'baby', image: 'https://images.unsplash.com/photo-1614360044824-9d9eb2dd12db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwY2hpbGQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzE1MzA0ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', productCount: 98, status: 'active' },
  { id: '5', name: 'Birthday', slug: 'birthday', image: 'https://images.unsplash.com/photo-1616964524979-c08f6d87c7e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGNha2UlMjBjYW5kbGVzfGVufDF8fHx8MTc3MTQ2MDgyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', productCount: 76, status: 'active' },
  { id: '6', name: 'Abstract', slug: 'abstract', image: 'https://images.unsplash.com/photo-1723283126778-c16ae4c2b0c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwcGF0dGVybnxlbnwxfHx8fDE3NzE1MjA4Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', productCount: 234, status: 'active' },
  { id: '7', name: 'Architecture', slug: 'architecture', image: 'https://images.unsplash.com/photo-1692818769925-6b815111c653?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBjaXR5JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcxNTMwNDgzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', productCount: 189, status: 'active' },
  { id: '8', name: 'Food', slug: 'food', image: 'https://images.unsplash.com/photo-1681770187839-29d14a415dc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGhvdG9ncmFwaHklMjBkZWxpY2lvdXN8ZW58MXx8fHwxNzcxNDc0MTcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', productCount: 156, status: 'active' },
];

export const products: Product[] = [
  {
    id: '1',
    title: 'Majestic Lion Portrait',
    description: 'A stunning close-up portrait of a male lion in golden hour light, showcasing incredible detail and natural beauty.',
    type: 'photo',
    categories: ['Wildlife', 'Nature'],
    tags: ['lion', 'wildlife', 'africa', 'golden hour', 'portrait'],
    previewImage: 'https://images.unsplash.com/photo-1575039804649-12b9734bcd96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaW9uJTIwcG9ydHJhaXQlMjB3aWxkbGlmZXxlbnwxfHx8fDE3NzE1MTc5MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    orientation: 'portrait',
    uploadDate: '2026-02-15',
    popularity: 950,
    prices: { HD: 299, 'Full HD': 599, '4K': 999 },
    status: 'active',
  },
  {
    id: '2',
    title: 'Mountain Landscape Collection',
    description: 'A premium bundle of 10 breathtaking mountain landscape photos captured across various seasons and lighting conditions.',
    type: 'bundle',
    categories: ['Nature'],
    tags: ['mountains', 'landscape', 'nature', 'bundle', 'collection'],
    previewImage: 'https://images.unsplash.com/photo-1616386573884-22531fd226e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMG5hdHVyZXxlbnwxfHx8fDE3NzE0ODA1OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    bundleImages: [
      'https://images.unsplash.com/photo-1616386573884-22531fd226e6?w=400',
      'https://images.unsplash.com/photo-1717964134799-a98f497172a5?w=400',
      'https://images.unsplash.com/photo-1719773744830-76ffd9033c92?w=400'
    ],
    orientation: 'landscape',
    uploadDate: '2026-02-14',
    popularity: 1200,
    prices: { HD: 1499, 'Full HD': 2499, '4K': 3999 },
    status: 'active',
    filesCount: 10,
  },
  {
    id: '3',
    title: 'Wedding Celebration Moments',
    description: 'Beautiful candid moments from a wedding ceremony, perfect for inspiration or commercial use.',
    type: 'photo',
    categories: ['Wedding'],
    tags: ['wedding', 'celebration', 'bride', 'groom', 'ceremony'],
    previewImage: 'https://images.unsplash.com/photo-1696238173596-554e92268051?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjBjb3VwbGV8ZW58MXx8fHwxNzcxNTI1OTgzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    orientation: 'landscape',
    uploadDate: '2026-02-13',
    popularity: 780,
    prices: { HD: 399, 'Full HD': 699, '4K': 1199 },
    status: 'active',
  },
  {
    id: '4',
    title: 'Modern Typography Poster Set',
    description: 'A collection of 5 minimalist typography posters perfect for modern interior design and commercial projects.',
    type: 'typography',
    categories: ['Abstract'],
    tags: ['typography', 'poster', 'modern', 'minimalist', 'design'],
    previewImage: 'https://images.unsplash.com/photo-1770581939371-326fc1537f10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0eXBvZ3JhcGh5JTIwcG9zdGVyJTIwZGVzaWdufGVufDF8fHx8MTc3MTUyOTIwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    bundleImages: [
      'https://images.unsplash.com/photo-1770581939371-326fc1537f10?w=400',
      'https://images.unsplash.com/photo-1723283126778-c16ae4c2b0c9?w=400'
    ],
    orientation: 'portrait',
    uploadDate: '2026-02-12',
    popularity: 650,
    prices: { HD: 499, 'Full HD': 899, '4K': 1499 },
    status: 'active',
    filesCount: 5,
  },
  {
    id: '5',
    title: 'Newborn Baby Photography',
    description: 'Tender and heartwarming newborn photography session with soft natural lighting.',
    type: 'photo',
    categories: ['Baby'],
    tags: ['newborn', 'baby', 'infant', 'portrait', 'family'],
    previewImage: 'https://images.unsplash.com/photo-1583007109931-cdf68cdc4f4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdib3JuJTIwYmFieSUyMGluZmFudHxlbnwxfHx8fDE3NzE1MzA0Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    orientation: 'square',
    uploadDate: '2026-02-11',
    popularity: 540,
    prices: { HD: 349, 'Full HD': 649, '4K': 1099 },
    status: 'active',
  },
  {
    id: '6',
    title: 'Urban Architecture Series',
    description: 'Modern architectural photography showcasing contemporary building designs and cityscapes.',
    type: 'photo',
    categories: ['Architecture'],
    tags: ['architecture', 'building', 'modern', 'urban', 'cityscape'],
    previewImage: 'https://images.unsplash.com/photo-1695067440629-b5e513976100?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmUlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzE0ODE1Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    orientation: 'portrait',
    uploadDate: '2026-02-10',
    popularity: 890,
    prices: { HD: 449, 'Full HD': 799, '4K': 1299 },
    status: 'active',
  },
  {
    id: '7',
    title: 'Gourmet Food Collection',
    description: 'High-quality food photography bundle featuring 8 dishes with professional styling and lighting.',
    type: 'bundle',
    categories: ['Food'],
    tags: ['food', 'cuisine', 'gourmet', 'photography', 'restaurant'],
    previewImage: 'https://images.unsplash.com/photo-1628838463043-b81a343794d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwZm9vZCUyMHBsYXRlfGVufDF8fHx8MTc3MTUwMTEzMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    bundleImages: [
      'https://images.unsplash.com/photo-1628838463043-b81a343794d6?w=400',
      'https://images.unsplash.com/photo-1681770187839-29d14a415dc6?w=400'
    ],
    orientation: 'landscape',
    uploadDate: '2026-02-09',
    popularity: 720,
    prices: { HD: 1299, 'Full HD': 2199, '4K': 3499 },
    status: 'active',
    filesCount: 8,
  },
  {
    id: '8',
    title: 'Birthday Party Banner Template',
    description: 'Vibrant and colorful birthday banner template, fully customizable for various celebrations.',
    type: 'banner',
    categories: ['Birthday'],
    tags: ['birthday', 'banner', 'celebration', 'party', 'template'],
    previewImage: 'https://images.unsplash.com/photo-1650584997985-e713a869ee77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMHBhcnR5JTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzcxNDQ5MzY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    orientation: 'landscape',
    uploadDate: '2026-02-08',
    popularity: 480,
    prices: { HD: 199, 'Full HD': 349, '4K': 599 },
    status: 'active',
  },
  {
    id: '9',
    title: 'Ocean Sunset Seascape',
    description: 'Breathtaking ocean sunset with dramatic colors reflecting on calm waters, perfect for coastal themes.',
    type: 'photo',
    categories: ['Nature'],
    tags: ['ocean', 'sunset', 'seascape', 'water', 'coast'],
    previewImage: 'https://images.unsplash.com/photo-1691753281437-fdea6191f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHN1bnNldCUyMHNlYXNjYXBlfGVufDF8fHx8MTc3MTQzMDgxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    orientation: 'landscape',
    uploadDate: '2026-02-07',
    popularity: 820,
    prices: { HD: 349, 'Full HD': 649, '4K': 1099 },
    status: 'active',
  },
  {
    id: '10',
    title: 'Urban Street Photography',
    description: 'Contemporary urban street scene capturing the essence of modern city life and culture.',
    type: 'photo',
    categories: ['Architecture'],
    tags: ['urban', 'street', 'city', 'photography', 'modern'],
    previewImage: 'https://images.unsplash.com/photo-1762436933065-fe6d7f51d4f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMHN0cmVldCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MTQ2NzU0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    orientation: 'portrait',
    uploadDate: '2026-02-06',
    popularity: 670,
    prices: { HD: 299, 'Full HD': 599, '4K': 999 },
    status: 'active',
  },
  {
    id: '11',
    title: 'Minimalist Interior Design',
    description: 'Clean and modern interior design photography showcasing minimalist aesthetic principles.',
    type: 'photo',
    categories: ['Architecture'],
    tags: ['interior', 'design', 'minimalist', 'modern', 'architecture'],
    previewImage: 'https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzcxNDkyMzg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    orientation: 'landscape',
    uploadDate: '2026-02-05',
    popularity: 590,
    prices: { HD: 399, 'Full HD': 699, '4K': 1199 },
    status: 'active',
  },
  {
    id: '12',
    title: 'Vintage Retro Poster Collection',
    description: 'Set of 4 vintage-inspired retro posters with classic typography and nostalgic color schemes.',
    type: 'poster',
    categories: ['Abstract'],
    tags: ['vintage', 'retro', 'poster', 'classic', 'nostalgia'],
    previewImage: 'https://images.unsplash.com/photo-1766471901200-44196760e2c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwcmV0cm8lMjBwb3N0ZXJ8ZW58MXx8fHwxNzcxNTMwNjM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    orientation: 'portrait',
    uploadDate: '2026-02-04',
    popularity: 440,
    prices: { HD: 299, 'Full HD': 549, '4K': 899 },
    status: 'active',
    filesCount: 4,
  },
  {
    id: '13',
    title: 'Tropical Beach Paradise',
    description: 'Crystal clear turquoise waters and pristine white sand beach, ideal for travel and vacation themes.',
    type: 'photo',
    categories: ['Nature'],
    tags: ['beach', 'tropical', 'paradise', 'ocean', 'travel'],
    previewImage: 'https://images.unsplash.com/photo-1714412192114-61dca8f15f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzcxNDE5NTk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    orientation: 'landscape',
    uploadDate: '2026-02-03',
    popularity: 980,
    prices: { HD: 399, 'Full HD': 749, '4K': 1299 },
    status: 'active',
  },
  {
    id: '14',
    title: 'Autumn Forest Collection',
    description: 'Beautiful autumn forest scenes with golden leaves and warm seasonal colors, bundle of 6 images.',
    type: 'bundle',
    categories: ['Nature'],
    tags: ['autumn', 'forest', 'fall', 'leaves', 'season'],
    previewImage: 'https://images.unsplash.com/photo-1637445209849-bdb53c209b07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBmb3Jlc3QlMjBsZWF2ZXN8ZW58MXx8fHwxNzcxNTE5MjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    bundleImages: [
      'https://images.unsplash.com/photo-1637445209849-bdb53c209b07?w=400',
      'https://images.unsplash.com/photo-1717964134799-a98f497172a5?w=400'
    ],
    orientation: 'landscape',
    uploadDate: '2026-02-02',
    popularity: 750,
    prices: { HD: 999, 'Full HD': 1799, '4K': 2999 },
    status: 'active',
    filesCount: 6,
  },
];

export const blogs: Blog[] = [
  {
    id: '1',
    title: '10 Tips for Better Wildlife Photography',
    excerpt: 'Master the art of wildlife photography with these essential tips from professional photographers.',
    content: 'Wildlife photography is one of the most challenging yet rewarding genres...',
    image: 'https://images.unsplash.com/photo-1499078265944-8f1ee6f177a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGNhbWVyYSUyMGJsb2d8ZW58MXx8fHwxNzcxNTMwNDg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    author: 'Sarah Johnson',
    date: '2026-02-10',
    tags: ['wildlife', 'tips', 'photography', 'tutorial'],
  },
  {
    id: '2',
    title: 'The Art of Composition in Landscape Photography',
    excerpt: 'Learn how to create stunning landscape images using proven composition techniques.',
    content: 'Composition is the foundation of great landscape photography...',
    image: 'https://images.unsplash.com/photo-1719773744830-76ffd9033c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBjb21wb3NpdGlvbiUyMHR1dG9yaWFsfGVufDF8fHx8MTc3MTUzMDQ4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    author: 'Michael Chen',
    date: '2026-02-05',
    tags: ['landscape', 'composition', 'tutorial', 'technique'],
  },
  {
    id: '3',
    title: 'Wedding Photography: Capturing Emotions',
    excerpt: 'Discover the secrets to capturing authentic emotions during wedding ceremonies.',
    content: 'Wedding photography is about more than just taking pictures...',
    image: 'https://images.unsplash.com/photo-1730175602974-8ea2b3e4b7bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcGhvdG9ncmFwaGVyJTIwZXF1aXBtZW50fGVufDF8fHx8MTc3MTUzMDQ4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    author: 'Emma Rodriguez',
    date: '2026-01-28',
    tags: ['wedding', 'emotions', 'photography', 'guide'],
  },
];

export const advertisements: Advertisement[] = [
  {
    id: '1',
    image: '',
    url: '/explore?plan=monthly',
    status: 'active',
    position: 'home-sidebar',
  },
  {
    id: '2',
    image: '',
    url: '/explore?plan=yearly',
    status: 'active',
    position: 'home-sidebar',
  },
  {
    id: '3',
    image: '',
    url: '/blog',
    status: 'active',
    position: 'home-sidebar',
  },
];

export const currentUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'user',
  joinDate: '2025-12-15',
};

export const adminUser: User = {
  id: 'admin1',
  name: 'Admin',
  email: 'admin@gmail.com',
  role: 'admin',
  joinDate: '2024-01-01',
};
