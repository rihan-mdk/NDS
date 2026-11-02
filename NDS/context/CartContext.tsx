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
        setItems([]);
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

