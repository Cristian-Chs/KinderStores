export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  createdAt: number;
  sales: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface LiveItem {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  badge: string;
  createdAt: number;
}

export interface LiveSettings {
  dateText: string;
  isActive: boolean;
}
