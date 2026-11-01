"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/lib/products-data";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize: string) => void;
  updateQuantity: (productId: string, selectedSize: string, newQuantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  promoCode: string;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  total: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  promoCode: "",
  applyPromoCode: () => ({ success: false, message: "" }),
  removePromoCode: () => {},
  total: 0,
});

const CART_STORAGE_KEY = "nds_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        // Initialize with default items matching Stitch Shopping Bag screen
        // (Zari Kurti & Ivory Gown)
        setItems([
          {
            product: {
              id: 'prod-001',
              slug: 'zari-embroidered-azure-silk-kurti',
              title: 'Zari Embroidered Azure Silk Kurti',
              category: 'short-kurti',
              categoryLabel: 'Short Kurti',
              subCategory: 'Silk Separates',
              price: 48000,
              originalPrice: 54000,
              images: [
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBJpt-4xAPPD2y_sYhU90s1PyDcuMTlcdr7Tsgr9preP3ChZ-0YOqWHEimx4pGXvXZjLo_d_ZhlpbkbtVbTuPH8XinCqwqB1vRypf66P2pZbPkPoKq51i6CVsNm-nr-K90cOYZxiD6wfZjGgGEb9WtjCnGV3hseUUPqWPcQhymIdHMMSp-vMlKsWrT9ATqrIyMBU7i780F1l-UGP9W21ltdSNr5Cubb5s2xdK__NH_Qa-TAS0qC4fZWcQ'
              ],
              description: 'Pure Mulberry Chanderi Silk with scallop zari needlework.',
              details: ['Pure Mulberry Silk', 'Scallop border'],
              fabric: 'Chanderi Silk',
              embroidery: 'Hand Needle Zari',
              washCare: 'Dry Clean Only',
              deliveryTime: '3-5 business days',
              sizes: ['XS', 'S', 'M', 'L', 'XL'],
              inStock: true
            },
            quantity: 1,
            selectedSize: 'M'
          },
          {
            product: {
              id: 'prod-002',
              slug: 'ivory-architectural-drape-gown',
              title: 'Ivory Architectural Drape Gown',
              category: 'gown',
              categoryLabel: 'Gown',
              subCategory: 'Evening Couture',
              price: 125000,
              images: [
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBP1jB0EnAx5-BWz9llTztchW9JV99Bp_6dxn81cecC2scMHD66B601WWnTHDJ9y8ruH5ihhMgw3ix-IWsvbE1vnMvvfavusPQxKnbJZt7vJ8_BRAOalr-mnZ6canprIG7eGUo6-1cxUSvUVpgzJaAL3JoXMyiCUjzf-lpXL5YR6fMA6XRzy5TEJ82yzFxULcxWn2u8BMKvvlBEiZMhfcoNNPZgfkAqg6Svb-KNkJxI'
              ],
              description: 'Raw matka silk with sculptural pleats.',
              details: ['Matka Silk', 'Draped cape'],
              fabric: 'Matka Silk',
              embroidery: 'Tonal Cord',
              washCare: 'Dry clean only',
              deliveryTime: '7-10 business days',
              sizes: ['XS', 'S', 'M', 'L'],
              inStock: true
            },
            quantity: 1,
            selectedSize: 'S'
          }
        ]);
      }
    } catch (e) {
      console.warn("Could not read cart from localStorage:", e);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn("Could not save cart to localStorage:", e);
      }
    }
  }, [items, initialized]);

  const addToCart = (product: Product, quantity = 1, selectedSize = "M") => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedSize === selectedSize
      );
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      }
      return [...prev, { product, quantity, selectedSize }];
    });
  };

  const removeFromCart = (productId: string, selectedSize: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.selectedSize === selectedSize))
    );
  };

  const updateQuantity = (productId: string, selectedSize: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode("");
    setDiscountPercent(0);
  };

  const applyPromoCode = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === "ATELIER10" || formatted === "NEELS10") {
      setPromoCode(formatted);
      setDiscountPercent(10);
      return { success: true, message: "10% Atelier Privé voucher applied." };
    }
    if (formatted === "HERITAGE15") {
      setPromoCode(formatted);
      setDiscountPercent(15);
      return { success: true, message: "15% Heritage Privé voucher applied." };
    }
    return { success: false, message: "Invalid voucher or promotion code." };
  };

  const removePromoCode = () => {
    setPromoCode("");
    setDiscountPercent(0);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = Math.round(subtotal * (discountPercent / 100));
  const shipping = subtotal > 10000 || subtotal === 0 ? 0 : 1500;
  const tax = Math.round((subtotal - discount) * 0.12); // 12% GST
  const total = subtotal - discount + tax + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        tax,
        shipping,
        discount,
        promoCode,
        applyPromoCode,
        removePromoCode,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

