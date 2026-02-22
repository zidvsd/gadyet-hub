export interface Cart {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  items: CartItem[];
}
export interface CartItem {
  id: number;
  cart_id: number;
  product: ProductItem; // <-- single object
  product_id: string;
  quantity: number;
  price: number;
}
export interface ProductItem {
  id: string;
  name: string;
  price: number;
  image_path: string;
  stock: number;
}
