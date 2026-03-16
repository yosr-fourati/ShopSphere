export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  enabled: boolean;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: Category;
  imageUrl?: string;
  seller?: User;
  averageRating?: number;
  totalFeedbacks?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CartItem {
  id: number;
  item: Item;
  quantity: number;
}

export interface Cart {
  id: number;
  userId: number;
  cartItems: CartItem[];
  total: number;
}

export interface OrderItem {
  item: Item;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: number;
  comment: string;
  rating: number;
  userId: number;
  itemId: number;
  createdAt: string;
}

export interface FeedbackRequest {
  comment: string;
  rating: number;
  userId: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface CartItemRequest {
  itemId: number;
  quantity: number;
}

export interface OrderRequest {
  userId: number;
  item_id: number[];
  stripeToken?: string;
}

export interface ItemRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: string[];
}
