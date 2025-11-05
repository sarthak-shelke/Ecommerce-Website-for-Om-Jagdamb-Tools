/**
 * Unified Cart Management System for Om Jagdamba Tools
 * 
 * This file provides a centralized cart management system that works
 * consistently across all pages and persists data properly.
 */

class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.listeners = [];
        this.init();
    }

    init() {
        // Initialize cart UI on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.updateCartUI();
            this.bindCartEvents();
        });
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const cartData = localStorage.getItem('om_jagdamba_cart');
            return cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem('om_jagdamba_cart', JSON.stringify(this.cart));
            this.notifyListeners();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // Add product to cart
    addToCart(product, quantity = 1) {
        try {
            // Ensure product has required fields
            if (!product || !product.id) {
                throw new Error('Invalid product data');
            }

            // Normalize product data
            const normalizedProduct = {
                id: product.id,
                name: product.name || 'Unknown Product',
                price: parseFloat(product.price) || 0,
                image: product.image || product.imageUrl || 'https://placehold.co/100x100/e2e8f0/334155?text=Product',
                category: product.category || 'Tools',
                description: product.description || '',
                icon: product.icon || 'fas fa-tools'
            };

            // Check if item already exists in cart
            const existingItemIndex = this.cart.findIndex(item => item.id === product.id);

            if (existingItemIndex > -1) {
                // Update quantity of existing item
                this.cart[existingItemIndex].quantity += quantity;
            } else {
                // Add new item to cart
                this.cart.push({
                    ...normalizedProduct,
                    quantity: quantity,
                    addedAt: new Date().toISOString()
                });
            }

            this.saveCart();
            this.updateCartUI();
            this.showNotification(`${normalizedProduct.name} added to cart!`, 'success');

            // Try to sync with backend if available
            this.syncWithBackend('add', product.id, quantity);

            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Failed to add product to cart', 'error');
            return false;
        }
    }

    // Remove product from cart
    removeFromCart(productId) {
        try {
            const itemIndex = this.cart.findIndex(item => item.id === productId);
            
            if (itemIndex > -1) {
                const removedItem = this.cart[itemIndex];
                this.cart.splice(itemIndex, 1);
                this.saveCart();
                this.updateCartUI();
                this.showNotification(`${removedItem.name} removed from cart`, 'info');

                // Try to sync with backend if available
                this.syncWithBackend('remove', productId);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing from cart:', error);
            return false;
        }
    }

    // Update quantity of item in cart
    updateQuantity(productId, newQuantity) {
        try {
            const itemIndex = this.cart.findIndex(item => item.id === productId);
            
            if (itemIndex > -1) {
                if (newQuantity <= 0) {
                    return this.removeFromCart(productId);
                }
                
                this.cart[itemIndex].quantity = newQuantity;
                this.saveCart();
                this.updateCartUI();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating quantity:', error);
            return false;
        }
    }

    // Clear entire cart
    clearCart() {
        try {
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            this.showNotification('Cart cleared', 'info');

            // Try to sync with backend if available
            this.syncWithBackend('clear');
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            return false;
        }
    }

    // Get cart contents
    getCart() {
        return [...this.cart]; // Return a copy to prevent direct modification
    }

    // Get cart item count
    getItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart total price
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Update cart UI elements
    updateCartUI() {
        this.updateCartBadge();
        this.updateCartSidebar();
        this.updateCartPage();
    }

    // Update cart badge/counter
    updateCartBadge() {
        const badges = document.querySelectorAll('.cart-count, #cart-badge, .cart-badge');
        const itemCount = this.getItemCount();

        badges.forEach(badge => {
            if (badge) {
                badge.textContent = itemCount;
                badge.style.display = itemCount > 0 ? 'flex' : 'none';
            }
        });
    }

    // Update cart sidebar (if exists)
    updateCartSidebar() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        if (cartItems) {
            cartItems.innerHTML = '';

            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
            } else {
                this.cart.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item flex items-center p-3 border-b border-gray-200';
                    cartItem.innerHTML = `
                        <div class="cart-item-image w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="${item.icon} text-2xl text-gray-600"></i>
                        </div>
                        <div class="cart-item-info flex-1">
                            <div class="cart-item-title font-semibold text-gray-800">${item.name}</div>
                            <div class="cart-item-price text-blue-600 font-semibold">₹${item.price.toLocaleString()} x ${item.quantity}</div>
                        </div>
                        <div class="cart-item-actions flex items-center space-x-2">
                            <button onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})" 
                                    class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                                <i class="fas fa-minus text-xs"></i>
                            </button>
                            <span class="w-8 text-center">${item.quantity}</span>
                            <button onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})" 
                                    class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                                <i class="fas fa-plus text-xs"></i>
                            </button>
                            <button onclick="cartManager.removeFromCart(${item.id})" 
                                    class="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 ml-2">
                                <i class="fas fa-trash text-xs"></i>
                            </button>
                        </div>
                    `;
                    cartItems.appendChild(cartItem);
                });
            }
        }

        if (cartTotal) {
            cartTotal.textContent = this.getTotal().toLocaleString();
        }
    }

    // Update cart page (if exists)
    updateCartPage() {
        // This would be implemented if you have a dedicated cart page
        const cartPageContainer = document.getElementById('cart-page-items');
        if (cartPageContainer) {
            // Similar implementation to sidebar but with more detailed layout
        }
    }

    // Bind cart-related events
    bindCartEvents() {
        // Cart icon click
        const cartIcons = document.querySelectorAll('.cart-icon');
        cartIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                this.openCartSidebar();
            });
        });

        // Close cart events
        const closeCartButtons = document.querySelectorAll('.close-cart');
        closeCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeCartSidebar();
            });
        });

        // Overlay click to close cart
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeCartSidebar();
            });
        }

        // Checkout button
        const checkoutButtons = document.querySelectorAll('.checkout-btn');
        checkoutButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        });
    }

    // Open cart sidebar
    openCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('overlay');

        if (cartSidebar) {
            cartSidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Close cart sidebar
    closeCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('overlay');

        if (cartSidebar) {
            cartSidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    // Proceed to checkout
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'warning');
            return;
        }

        const total = this.getTotal();
        const confirmed = confirm(`Proceed to checkout?\nTotal: ₹${total.toLocaleString()}\n\nThis will redirect to payment gateway.`);

        if (confirmed) {
            this.showPaymentModal();
        }
    }

    // Show payment modal
    showPaymentModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <div class="text-center">
                    <div class="text-4xl text-green-500 mb-4">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Payment Successful!</h3>
                    <p class="text-gray-600 mb-4">Thank you for your order. You will receive a confirmation email shortly.</p>
                    <button onclick="this.closest('.fixed').remove(); cartManager.clearCart(); cartManager.closeCartSidebar();" 
                            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Sync with backend (if available)
    async syncWithBackend(action, productId = null, quantity = null) {
        try {
            if (typeof backendAPI !== 'undefined' && backendAPI.isConnected() && backendAPI.auth.isAuthenticated()) {
                switch (action) {
                    case 'add':
                        await backendAPI.cart.add(productId, quantity);
                        break;
                    case 'remove':
                        await backendAPI.cart.remove(productId);
                        break;
                    case 'clear':
                        await backendAPI.cart.clear();
                        break;
                }
                // Cart synced with backend
            }
        } catch (error) {
            // Backend sync failed, continuing with local cart
            // Continue with local cart functionality
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${colors[type] || colors.info}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-2"></i>
                ${message}
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Add listener for cart changes
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners of cart changes
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.getCart());
            } catch (error) {
                console.error('Error in cart listener:', error);
            }
        });
    }

    // Get cart statistics
    getStats() {
        return {
            itemCount: this.getItemCount(),
            total: this.getTotal(),
            uniqueItems: this.cart.length,
            lastUpdated: localStorage.getItem('om_jagdamba_cart_updated') || new Date().toISOString()
        };
    }
}

// Create global cart manager instance
const cartManager = new CartManager();

// Make it available globally
window.cartManager = cartManager;

// Export for modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}

// Backward compatibility functions
function addToCart(productId, quantity = 1) {
    // Find product data from global products array or create basic product
    let product = null;
    
    if (typeof products !== 'undefined' && products.length > 0) {
        product = products.find(p => p.id == productId);
    }
    
    if (!product) {
        // Create basic product object if not found
        product = {
            id: productId,
            name: `Product ${productId}`,
            price: 0,
            image: 'https://placehold.co/100x100/e2e8f0/334155?text=Product'
        };
    }
    
    return cartManager.addToCart(product, quantity);
}

function removeFromCart(productId) {
    return cartManager.removeFromCart(productId);
}

function updateCartUI() {
    cartManager.updateCartUI();
}

// Cart Manager initialized