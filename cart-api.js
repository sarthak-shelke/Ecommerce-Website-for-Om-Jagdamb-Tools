/**
 * Unified Cart API Client
 * Connects all cart operations to Django backend with localStorage fallback
 */

const CART_API_BASE_URL = 'http://127.0.0.1:8000/api/cart';

class CartAPI {
    constructor() {
        this.cart = this.loadLocalCart();
        this.isOnline = navigator.onLine;
        this.pendingOperations = [];
        this.initNetworkMonitoring();
    }

    // Initialize network monitoring
    initNetworkMonitoring() {
        window.addEventListener('online', () => {
            console.log('Network online - syncing cart');
            this.isOnline = true;
            this.processPendingOperations();
        });

        window.addEventListener('offline', () => {
            console.log('Network offline - using localStorage');
            this.isOnline = false;
        });
    }

    // Get authentication headers
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    // Check if user is authenticated
    isAuthenticated() {
        const isUser = localStorage.getItem('isUser');
        const userEmail = localStorage.getItem('userEmail');
        const isAdmin = localStorage.getItem('isAdmin');
        const token = localStorage.getItem('token');

        return (isUser === 'true' && userEmail) || (isAdmin === 'true') || token;
    }

    // Load cart from localStorage
    loadLocalCart() {
        try {
            const cartStr = localStorage.getItem('cart') || localStorage.getItem('om_jagdamb_cart');
            return cartStr ? JSON.parse(cartStr) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Save cart to localStorage
    saveLocalCart(cart) {
        try {
            const cartJson = JSON.stringify(cart);
            console.log('Saving cart to localStorage:', cart.length, 'items');
            localStorage.setItem('cart', cartJson);
            localStorage.setItem('om_jagdamb_cart', cartJson);
            this.cart = cart;
            console.log('Cart saved successfully');
            this.broadcastCartUpdate();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // Broadcast cart update to other tabs
    broadcastCartUpdate() {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.cart }));
    }

    // Add item to cart
    async addToCart(product, quantity = 1) {
        console.log('=== cartAPI.addToCart called ===');
        console.log('Product:', product);
        console.log('Quantity:', quantity);
        console.log('Current cart before add:', this.cart);

        // Optimistic update
        const existingIndex = this.cart.findIndex(item => item.id === product.id);
        console.log('Existing item index:', existingIndex);
        
        if (existingIndex > -1) {
            console.log('Updating existing item quantity');
            this.cart[existingIndex].quantity += quantity;
        } else {
            console.log('Adding new item to cart');
            this.cart.push({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                description: product.description || '',
                quantity: quantity
            });
        }
        
        console.log('Cart after add:', this.cart);
        this.saveLocalCart(this.cart);

        // Try to sync with backend if authenticated
        if (this.isAuthenticated() && this.isOnline) {
            try {
                const response = await fetch(`${CART_API_BASE_URL}/add/`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify({
                        product_id: product.id,
                        quantity: quantity
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Cart synced with backend:', data);
                    return { success: true, data };
                } else {
                    console.log('Backend sync failed, using localStorage');
                }
            } catch (error) {
                console.log('Backend not available, using localStorage:', error.message);
                this.queueOperation('add', { product, quantity });
            }
        }

        return { success: true, cart: this.cart };
    }

    // Update quantity
    async updateQuantity(productId, newQuantity) {
        console.log('Updating quantity:', productId, 'New qty:', newQuantity);

        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) {
            return { success: false, error: 'Item not found' };
        }

        // Optimistic update
        if (newQuantity <= 0) {
            this.cart.splice(itemIndex, 1);
        } else {
            this.cart[itemIndex].quantity = newQuantity;
        }
        this.saveLocalCart(this.cart);

        // Try to sync with backend if authenticated
        if (this.isAuthenticated() && this.isOnline) {
            try {
                const cartItem = this.cart[itemIndex];
                if (cartItem && cartItem.cartItemId) {
                    const response = await fetch(`${CART_API_BASE_URL}/update/`, {
                        method: 'PUT',
                        headers: this.getAuthHeaders(),
                        body: JSON.stringify({
                            cart_item_id: cartItem.cartItemId,
                            quantity: newQuantity
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Quantity updated on backend:', data);
                        return { success: true, data };
                    }
                }
            } catch (error) {
                console.log('Backend update failed, using localStorage:', error.message);
            }
        }

        return { success: true, cart: this.cart };
    }

    // Remove item from cart
    async removeFromCart(productId) {
        console.log('Removing from cart:', productId);

        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) {
            return { success: false, error: 'Item not found' };
        }

        // Optimistic update
        const removedItem = this.cart[itemIndex];
        this.cart.splice(itemIndex, 1);
        this.saveLocalCart(this.cart);

        // Try to sync with backend if authenticated
        if (this.isAuthenticated() && this.isOnline && removedItem.cartItemId) {
            try {
                const response = await fetch(`${CART_API_BASE_URL}/remove/`, {
                    method: 'DELETE',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify({
                        cart_item_id: removedItem.cartItemId
                    })
                });

                if (response.ok) {
                    console.log('Item removed from backend');
                    return { success: true };
                }
            } catch (error) {
                console.log('Backend remove failed, using localStorage:', error.message);
            }
        }

        return { success: true, cart: this.cart };
    }

    // Clear cart
    async clearCart() {
        console.log('Clearing cart');

        // Optimistic update
        this.cart = [];
        this.saveLocalCart(this.cart);

        // Try to sync with backend if authenticated
        if (this.isAuthenticated() && this.isOnline) {
            try {
                const response = await fetch(`${CART_API_BASE_URL}/clear/`, {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                });

                if (response.ok) {
                    console.log('Cart cleared on backend');
                    return { success: true };
                }
            } catch (error) {
                console.log('Backend clear failed, using localStorage:', error.message);
            }
        }

        return { success: true, cart: this.cart };
    }

    // Get cart
    async getCart() {
        // Try to fetch from backend if authenticated
        if (this.isAuthenticated() && this.isOnline) {
            try {
                const response = await fetch(`${CART_API_BASE_URL}/`, {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Cart fetched from backend:', data);
                    
                    // Transform backend cart to frontend format
                    if (data.items) {
                        this.cart = data.items.map(item => ({
                            id: item.product.id,
                            cartItemId: item.id,
                            slug: item.product.slug,
                            name: item.product.name,
                            price: parseFloat(item.product.price),
                            image: item.product.image || item.product.primary_image,
                            description: item.product.description || '',
                            quantity: item.quantity
                        }));
                        this.saveLocalCart(this.cart);
                    }
                    return { success: true, cart: this.cart };
                }
            } catch (error) {
                console.log('Backend fetch failed, using localStorage:', error.message);
            }
        }

        // Return local cart
        return { success: true, cart: this.cart };
    }

    // Get cart count
    getCartCount() {
        return this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Queue operation for later sync
    queueOperation(operation, data) {
        this.pendingOperations.push({ operation, data, timestamp: Date.now() });
        localStorage.setItem('pendingCartOperations', JSON.stringify(this.pendingOperations));
    }

    // Process pending operations
    async processPendingOperations() {
        const pending = JSON.parse(localStorage.getItem('pendingCartOperations') || '[]');
        if (pending.length === 0) return;

        console.log('Processing', pending.length, 'pending cart operations');

        for (const op of pending) {
            try {
                if (op.operation === 'add') {
                    await this.addToCart(op.data.product, op.data.quantity);
                }
                // Add other operations as needed
            } catch (error) {
                console.error('Failed to process pending operation:', error);
            }
        }

        localStorage.removeItem('pendingCartOperations');
        this.pendingOperations = [];
    }

    // Sync local cart with backend
    async syncWithBackend() {
        if (!this.isAuthenticated() || !this.isOnline) {
            return { success: false, error: 'Not authenticated or offline' };
        }

        console.log('Syncing cart with backend...');

        try {
            // Get backend cart
            const backendCart = await this.getCart();
            
            // Merge with local cart if needed
            // For now, backend takes precedence
            
            return { success: true, cart: this.cart };
        } catch (error) {
            console.error('Cart sync failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global cart API instance
const cartAPI = new CartAPI();

// Make it available globally
window.cartAPI = cartAPI;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartAPI;
}

console.log('Cart API initialized');
