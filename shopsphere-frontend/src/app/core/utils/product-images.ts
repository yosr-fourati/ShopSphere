import { Item } from '../models';

const PRODUCT_IMAGES: Record<string, string> = {
  'Wireless Noise-Cancelling Headphones': 'https://images.unsplash.com/photo-1505740420496-3719ed6a9b08?w=400&h=280&fit=crop&auto=format',
  '4K Webcam Pro': 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=280&fit=crop&auto=format',
  'USB-C Hub 7-in-1': 'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400&h=280&fit=crop&auto=format',
  'Mechanical Gaming Keyboard': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=280&fit=crop&auto=format',
  'Smart Fitness Watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=280&fit=crop&auto=format',
  'Classic Slim-Fit Chinos': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=280&fit=crop&auto=format',
  'Merino Wool Crew Sweater': 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&h=280&fit=crop&auto=format',
  'Windproof Running Jacket': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=280&fit=crop&auto=format',
  'Linen Summer Dress': 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=280&fit=crop&auto=format',
  'Clean Code — Robert C. Martin': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=280&fit=crop&auto=format',
  'Designing Data-Intensive Applications': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=280&fit=crop&auto=format',
  'The Pragmatic Programmer (20th Ed.)': 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=280&fit=crop&auto=format',
  'Bamboo Desk Organizer Set (5-pc)': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=280&fit=crop&auto=format',
  'LED Desk Lamp with Wireless Charger': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=280&fit=crop&auto=format',
  'Indoor Plant Pot Set — Ceramic (3-pc)': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=280&fit=crop&auto=format',
  'Premium Yoga Mat 6mm': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=280&fit=crop&auto=format',
  'Resistance Bands Set (5 levels)': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=280&fit=crop&auto=format',
  'Insulated Stainless Steel Bottle 1L': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=280&fit=crop&auto=format',
  'Vitamin C Brightening Serum 30ml': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=280&fit=crop&auto=format',
  'Natural Lip Balm Pack (4×)': 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef3?w=400&h=280&fit=crop&auto=format',
  'STEM Building Blocks — 200 Pieces': 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=400&h=280&fit=crop&auto=format',
  'Wooden Chess Set — Travel Size': 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&h=280&fit=crop&auto=format',
  'Organic Matcha Powder 100g': 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=280&fit=crop&auto=format',
  'Dark Chocolate Assortment Box (500g)': 'https://images.unsplash.com/photo-1606312619070-d48b6b04df57?w=400&h=280&fit=crop&auto=format',
};

export const CATEGORY_IMAGES: Record<string, string> = {
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=280&fit=crop&auto=format',
  'Clothing': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=280&fit=crop&auto=format',
  'Books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=280&fit=crop&auto=format',
  'Home & Garden': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=280&fit=crop&auto=format',
  'Sports': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=280&fit=crop&auto=format',
  'Beauty': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=280&fit=crop&auto=format',
  'Toys': 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=400&h=280&fit=crop&auto=format',
  'Food': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=280&fit=crop&auto=format',
};

export function getProductImage(product: Item): string {
  return PRODUCT_IMAGES[product.name]
    ?? CATEGORY_IMAGES[product.category?.name ?? '']
    ?? 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=280&fit=crop&auto=format';
}
