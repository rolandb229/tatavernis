'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Produit, CartItem } from './types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (produit: Produit, quantite?: number) => void
  removeItem: (produitId: number) => void
  updateQuantity: (produitId: number, quantite: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotal: () => number
  getTotalPrice: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (produit: Produit, quantite: number = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.produit.id === produit.id)
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.produit.id === produit.id
                  ? { ...item, quantite: item.quantite + quantite }
                  : item
              ),
              isOpen: true,
            }
          }
          
          return {
            items: [...state.items, { produit, quantite }],
            isOpen: true,
          }
        })
      },

      removeItem: (produitId: number) => {
        set((state) => ({
          items: state.items.filter(item => item.produit.id !== produitId),
        }))
      },

      updateQuantity: (produitId: number, quantite: number) => {
        if (quantite <= 0) {
          get().removeItem(produitId)
          return
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.produit.id === produitId
              ? { ...item, quantite }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      openCart: () => set({ isOpen: true }),
      
      closeCart: () => set({ isOpen: false }),

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const prix = item.produit.prix_promo || item.produit.prix
          return total + prix * item.quantite
        }, 0)
      },

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const prix = item.produit.prix_promo || item.produit.prix
          return total + prix * item.quantite
        }, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantite, 0)
      },
    }),
    {
      name: 'tatavernis-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

// Hook pour les favoris
interface FavoritesStore {
  favorites: number[]
  addFavorite: (produitId: number) => void
  removeFavorite: (produitId: number) => void
  toggleFavorite: (produitId: number) => void
  isFavorite: (produitId: number) => boolean
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (produitId: number) => {
        set((state) => ({
          favorites: [...state.favorites, produitId],
        }))
      },

      removeFavorite: (produitId: number) => {
        set((state) => ({
          favorites: state.favorites.filter(id => id !== produitId),
        }))
      },

      toggleFavorite: (produitId: number) => {
        const { favorites } = get()
        if (favorites.includes(produitId)) {
          get().removeFavorite(produitId)
        } else {
          get().addFavorite(produitId)
        }
      },

      isFavorite: (produitId: number) => {
        return get().favorites.includes(produitId)
      },
    }),
    {
      name: 'tatavernis-favorites',
    }
  )
)
