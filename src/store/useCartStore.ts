import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  planId: string;
  planName: string;
  price: number;
  currency: string;
  data: number;
  validity: number;
  countryName: string;
}

interface CartStore {
  item: CartItem | null;
  couponCode: string;
  discount: number;
  setItem: (item: CartItem | null) => void;
  setCoupon: (code: string, discount: number) => void;
  clearCart: () => void;
  getFinalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      item: null,
      couponCode: '',
      discount: 0,
      setItem: (item) => set({ item, couponCode: '', discount: 0 }),
      setCoupon: (couponCode, discount) => set({ couponCode, discount }),
      clearCart: () => set({ item: null, couponCode: '', discount: 0 }),
      getFinalPrice: () => {
        const { item, discount } = get();
        if (!item) return 0;
        return Math.max(0, item.price - discount);
      },
    }),
    { name: 'cart-store', storage: createJSONStorage(() => sessionStorage) },
  ),
);
