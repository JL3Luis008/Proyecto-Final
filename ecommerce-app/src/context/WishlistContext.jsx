import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getWishlist, addToWishlist, removeFromWishlist } from "../services/wishlistService";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const { isAuth, getToken } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]); // Array of product IDs
    const [loadingWishlist, setLoadingWishlist] = useState(false);

    // Cargar wishlist cuando el usuario se autentica
    useEffect(() => {
        let isMounted = true;

        const loadWishlist = async () => {
            if (!isAuth || !getToken()) {
                setWishlistItems([]);
                return;
            }

            setLoadingWishlist(true);
            try {
                const items = await getWishlist(); // returns array of { product: { _id, ... } }
                if (isMounted) {
                    // Extraer solo los IDs para hacer búsquedas rápidas en UI
                    const ids = items
                        .filter(item => item && item.product)
                        .map(item => typeof item.product === 'object' ? item.product._id : item.product);
                    setWishlistItems(ids);
                }
            } catch (error) {
                console.error("Error loading wishlist:", error);
            } finally {
                if (isMounted) {
                    setLoadingWishlist(false);
                }
            }
        };

        loadWishlist();

        return () => {
            isMounted = false;
        };
    }, [isAuth, getToken()]); // Re-run si el token o estado de auth cambia

    const isInWishlist = (productId) => {
        return wishlistItems.includes(productId);
    };

    const toggleWishlist = async (productId) => {
        if (!isAuth) {
            return { success: false, error: "not_authenticated" };
        }

        const currentlyInWishlist = isInWishlist(productId);

        // Optimistic UI update
        setWishlistItems(prev =>
            currentlyInWishlist
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );

        try {
            if (currentlyInWishlist) {
                await removeFromWishlist(productId);
            } else {
                await addToWishlist(productId);
            }
            return { success: true, isAdded: !currentlyInWishlist };
        } catch (error) {
            // Revert optimistic update on error
            console.error("Error toggling wishlist:", error);
            setWishlistItems(prev =>
                currentlyInWishlist
                    ? [...prev, productId]
                    : prev.filter(id => id !== productId)
            );
            return { success: false, error: error.message };
        }
    };

    const value = {
        wishlistItems,
        loadingWishlist,
        isInWishlist,
        toggleWishlist,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist debe de usarse dentro de WishlistProvider");
    }
    return context;
}
