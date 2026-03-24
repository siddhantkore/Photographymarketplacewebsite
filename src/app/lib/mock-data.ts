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
  displayPrices?: {
    HD?: number | null;
    'Full HD'?: number | null;
    '4K'?: number | null;
  };
  discountPercent?: {
    HD?: number;
    'Full HD'?: number;
    '4K'?: number;
  };
  featured?: boolean;
  status: 'active' | 'inactive';
  filesCount?: number;
  bundlePreviews?: {
    HD?: string[];
    FullHD?: string[];
    '4K'?: string[];
  };
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

export const categories: Category[] = [];
export const products: Product[] = [];
export const blogs: Blog[] = [];
export const users: User[] = [];
export const orders: Order[] = [];
export const advertisements: Advertisement[] = [];
