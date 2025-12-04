/**
 * Unified Cart UI Components
 * Provides consistent cart UI across all pages
 */

// Update cart badge on all pages
function updateCartBadge() {
    const badges = document.querySelectorAll('#cart-badge, .cart-badge, .cart-count');
    const count = cartAPI.getCartCount();
    
    badges.forEach(badge => {
        if (badge) {
            badge.textContent = count;
            if (count > 0) {
                badge.classList.remove('hidden');
                badge.style.display = 'flex';
            } else {
                badge.classList.add('hidden');
                badge.style.display = 'none';
            }
        }
    });
}

// Show notification
function showCartNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelector('.cart-notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'cart-notification fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white';
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    notification.classList.add(colors[type] || colors.info);
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' : 
                 'fa-info-circle';
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icon} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add to cart button handler
async function handleAddToCart(productId, quantity = 1) {
    // Get product data
    let product = null;
    
    // Try to find product in global products array
    if (typeof products !== 'undefined' && products.length > 0) {
        product = products.find(p => p.id == productId);
    }
    
    // If not found, try to get from data attributes
    if (!product) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (productCard) {
            product = {
                id: productId,
                name: productCard.dataset.productName || 'Product',
                price: parseFloat(productCard.dataset.productPrice) || 0,
                image: productCard.dataset.productImage || '',
                slug: productCard.dataset.productSlug || `product-${productId}`,
                description: productCard.dataset.productDescription || ''
            };
        }
    }
    
    if (!product) {
        showCartNotification('Product not found', 'error');
        return;
    }
    
    // Show loading state
    const button = event?.target?.closest('button');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    }
    
    try {
        // Add to cart
        const result = await cartAPI.addToCart(product, quantity);
        
        if (result.success) {
            showCartNotification(`${product.name} added to cart!`, 'success');
            updateCartBadge();
        } else {
            showCartNotification('Failed to add to cart', 'error');
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        showCartNotification('Error adding to cart', 'error');
    } finally {
        // Restore button state
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-shopping-cart mr-2"></i>Add to Cart';
        }
    }
}

// Setup add to cart buttons on page
function setupAddToCartButtons() {
    // Find all add to cart buttons
    const buttons = document.querySelectorAll('[data-add-to-cart], .add-to-cart-btn, button[onclick*="addToCart"]');
    
    buttons.forEach(button => {
        // Remove old onclick handlers
        button.removeAttribute('onclick');
        
        // Add new event listener
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = this.dataset.productId || this.dataset.addToCart;
            const quantity = parseInt(this.dataset.quantity) || 1;
            
            if (productId) {
                await handleAddToCart(productId, quantity);
            }
        });
    });
    
    console.log('Setup', buttons.length, 'add to cart buttons');
}

// Initialize cart UI on page load
function initCartUI() {
    // Update cart badge
    updateCartBadge();
    
    // Setup add to cart buttons
    setupAddToCartButtons();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', function(e) {
        console.log('Cart updated:', e.detail);
        updateCartBadge();
    });
    
    // Listen for storage events (from other tabs)
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart' || e.key === 'om_jagdamb_cart') {
            cartAPI.cart = cartAPI.loadLocalCart();
            updateCartBadge();
        }
    });
    
    console.log('Cart UI initialized');
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartUI);
} else {
    initCartUI();
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateCartBadge,
        showCartNotification,
        handleAddToCart,
        setupAddToCartButtons,
        initCartUI
    };
}
