// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = []; // This will be filled by the API
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {
    currency: 'INR',
    language: 'en',
    theme: 'light'
};

// --- We no longer need sampleProducts or product cache logic ---

// DOM Elements
let loadingScreen, hamburger, navMenu, cartIcon, cartSidebar, overlay, closeCart, cartCount, cartItems, cartTotal, productsGrid;

function initializeDOMElements() {
    loadingScreen = document.getElementById('loading-screen');
    hamburger = document.querySelector('.hamburger');
    navMenu = document.querySelector('.nav-menu');
    cartIcon = document.querySelector('.cart-icon');
    cartSidebar = document.getElementById('cart-sidebar');
    overlay = document.getElementById('overlay');
    closeCart = document.querySelector('.close-cart');
    cartCount = document.querySelector('.cart-count');
    cartItems = document.getElementById('cart-items');
    cartTotal = document.getElementById('cart-total');
    productsGrid = document.getElementById('products-grid');
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing app...');
    
    initializeDOMElements();
    initializeEventListeners();
    
    // --- NEW AUTH FLOW ---
    // This now checks for a real token first
    initializeUserAuth(); 
    
    updateCartUI();
    initScrollAnimations();
    initSmoothScrolling();
    
    // --- NEW PRODUCT LOADING ---
    // This now calls the real API
    loadProductsFromAPI(); 
    
    // Hide loading screen
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1000); // Keep a small delay for feel
});

// Initialize Event Listeners
function initializeEventListeners() {
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    if (cartIcon && cartSidebar && overlay) {
        cartIcon.addEventListener('click', () => {
            cartSidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);
    if (overlay) overlay.addEventListener('click', closeCartSidebar);
    
    // Other listeners (search, checkout) can be re-added later
}

function closeCartSidebar() {
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

//
// --- NEW REAL PRODUCT LOADING ---
//
async function loadProductsFromAPI() {
    if (!productsGrid) return; // Only run if the grid exists

    showProductsLoading();
    
    const apiUrl = 'http://127.0.0.1:8000/api/products/';
    const placeholderImage = 'https://placehold.co/300x300/e2e8f0/334155?text=No+Image';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        // Save the real products
        products = data.results; 
        
        // Filter for featured products
        const featuredProducts = products.filter(p => p.is_featured);
        // If no featured, show the first 6
        const productsToShow = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6);

        displayFeaturedProducts(productsToShow, products.length);

    } catch (error) {
        console.error('Failed to load products from API:', error);
        productsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #dc3545;">Could not load products. Is the server running?</p>';
    }
}

function displayFeaturedProducts(productsToShow, totalProductCount) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = ''; // Clear loading spinner
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #666;">No featured products found.</p>';
        return;
    }

    productsToShow.forEach((product, index) => {
        const productCard = createProductCard(product);
        productCard.style.animationDelay = `${index * 0.1}s`;
        productsGrid.appendChild(productCard);
    });

    // Add "View All Products" button
    if (totalProductCount > productsToShow.length) {
        const viewAllButton = document.createElement('div');
        viewAllButton.className = 'view-all-products';
        viewAllButton.innerHTML = `
            <a href="product_webpage.html" class="btn-view-all">
                <i class="fas fa-arrow-right"></i>
                View All Products (${totalProductCount})
            </a>
        `;
        productsGrid.appendChild(viewAllButton);
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card-modern fade-in';
    
    const gradientColors = getProductGradient(product.category_name);
    const imageUrl = product.primary_image || 'https://placehold.co/300x300/e2e8f0/334155?text=No+Image';
    const price = parseFloat(product.price).toFixed(2);
    const originalPrice = parseFloat(product.original_price).toFixed(2);

    let priceHtml = `<div class="price-container"><span class="current-price">₹${price}</span></div>`;
    if (product.discount_percentage > 0) {
        priceHtml = `
            <div class="price-container">
                <span class="current-price">₹${price}</span>
                <span class="original-price">₹${originalPrice}</span>
                <span class="discount-badge">${product.discount_percentage}% OFF</span>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="product-card-header" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;" onclick="viewProductDetails('${product.slug}')">
            <div class.product-overlay">
                <span class="overlay-text">Click to view details</span>
            </div>
        </div>
        <div class="product-card-body">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.short_description || 'View details for more info.'}</p>
            <div class="product-price-modern">
                ${priceHtml}
            </div>
            <div class="product-actions-modern">
                <button class="btn-view-details" onclick="viewProductDetails('${product.slug}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn-add-cart" onclick="addToCartBySlug('${product.slug}')" ${!product.is_in_stock ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> ${!product.is_in_stock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `;
    return card;
}

function viewProductDetails(slug) {
    // We already fixed this! We just pass the slug.
    window.location.href = `product_detail.html?slug=${slug}`;
}

function showProductsLoading() {
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="products-loading" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <div class="loading-spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem; color: #666;">Loading products...</p>
            </div>
        `;
    }
}

//
// --- ALL NEW REAL AUTHENTICATION FUNCTIONS ---
//

function initializeUserAuth() {
    checkUserLoginStatus();
    initializeUserDropdown();
}

async function checkUserLoginStatus() {
    // Check for both Django token and simple login
    const authToken = localStorage.getItem('authToken');
    const isUser = localStorage.getItem('isUser');
    const userEmail = localStorage.getItem('userEmail');
    
    // If using simple login (isUser flag)
    if (isUser === 'true' && userEmail) {
        showUserAccount(userEmail, false);
        return;
    }
    
    // If using Django API token
    if (!authToken) {
        showLoginButton();
        return;
    }

    // We have a Django token. Let's verify it and get the user's info.
    const profileApiUrl = 'http://127.0.0.1:8000/api/auth/profile/';

    try {
        const response = await fetch(profileApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const user = await response.json();
            // User is valid and logged in
            showUserAccount(user.email, user.is_staff);
        } else {
            // Token is invalid or expired
            throw new Error('Invalid token');
        }
    } catch (error) {
        console.error('Auth check failed (using simple login fallback):', error);
        // Check if simple login exists as fallback
        if (isUser === 'true' && userEmail) {
            showUserAccount(userEmail, false);
        } else {
            showLoginButton();
        }
    }
}

function showUserAccount(email, isAdmin = false) {
    const loginBtn = document.getElementById('login-btn');
    const userAccount = document.getElementById('user-account');
    const userDetailsBtn = document.getElementById('user-details-btn');
    const userNameEl = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (userAccount) userAccount.style.display = 'block';
    // Keep user details button hidden
    if (userDetailsBtn) userDetailsBtn.style.display = 'none';
    
    if (userNameEl) {
        const displayName = email.split('@')[0];
        userNameEl.textContent = isAdmin ? `Admin (${displayName})` : displayName;
    }
    
    if (userAvatar) {
        userAvatar.src = generateAvatar(email);
        userAvatar.alt = email;
    }
}

function showLoginButton() {
    const loginBtn = document.getElementById('login-btn');
    const userAccount = document.getElementById('user-account');
    const userDetailsBtn = document.getElementById('user-details-btn');
    
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userAccount) userAccount.style.display = 'none';
    if (userDetailsBtn) userDetailsBtn.style.display = 'none';
}

function generateAvatar(email) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
    const initial = email.charAt(0).toUpperCase();
    const colorIndex = email.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    const svg = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="${encodeURIComponent(color)}" rx="16"/><text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${initial}</text></svg>`;
    
    return svg;
}

function initializeUserDropdown() {
    const userAccountTrigger = document.querySelector('.user-account-trigger');
    const userAccountDropdown = document.querySelector('.user-account-dropdown');
    
    if (userAccountTrigger && userAccountDropdown) {
        userAccountTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            userAccountDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!userAccountDropdown.contains(e.target)) {
                userAccountDropdown.classList.remove('active');
            }
        });
    }
}

async function logout() {
    const token = localStorage.getItem('authToken');
    const logoutApiUrl = 'http://127.0.0.1:8000/api/auth/logout/';

    if (token) {
        try {
            await fetch(logoutApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
        }
    }
    
    forceLogout();
}

// This function logs out the user from the frontend, no matter what
function forceLogout() {
    localStorage.removeItem('authToken'); // Remove the real token
    
    // Also remove any old fake keys
    localStorage.removeItem('isUser');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
    
    showLoginButton();
    showNotification('You have been logged out.', 'success');
    
    // Reload the page to clear everything
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

//
// --- OTHER FUNCTIONS (can be left as-is for now) ---
// (We just need to update how cart works)
//

// Cart Functions
function addToCartBySlug(slug) {
    const product = products.find(p => p.slug === slug);
    if (product) {
        const existingItem = cart.find(item => item.slug === slug);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Add a simplified product object to cart
            const placeholderImage = 'https://placehold.co/300x300/e2e8f0/334155?text=No+Image';
            cart.push({
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.primary_image || placeholderImage,
                quantity: 1
            });
        }
        
        saveCartToStorage();
        updateCartUI();
        showAddToCartAnimation();
    }
}

function removeFromCart(slug) {
    cart = cart.filter(item => item.slug !== slug);
    saveCartToStorage();
    updateCartUI();
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    // mirror to legacy key used by older code
    try { localStorage.setItem('om_jagdamb_cart', JSON.stringify(cart)); } catch (e) {}
}

function updateCartUI() {
    if (!cartCount || !cartItems || !cartTotal) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">₹${parseFloat(item.price).toFixed(2)} x ${item.quantity}</div>
                </div>
                <button onclick="removeFromCart('${item.slug}')" style="background: none; border: none; color: #ff4757; cursor: pointer; font-size: 1.2rem;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

function showAddToCartAnimation() {
    const animation = document.createElement('div');
    animation.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
    animation.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: #4CAF50; color: white;
        padding: 1rem 2rem; border-radius: 25px;
        z-index: 10000; font-weight: 600;
        animation: popIn 0.5s ease-out;
    `;
    document.body.appendChild(animation);
    setTimeout(() => { animation.remove(); }, 1500);
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in, .feature-card, .service-card').forEach(el => {
        el.classList.add('fade-in'); // Ensure class is present
        observer.observe(el);
    });
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (navMenu) navMenu.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
            }
        });
    });
}

// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    }
});

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white; padding: 1rem 1.5rem; border-radius: 8px;
        z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Helper function
function getProductGradient(category) {
    const gradients = {
        'Riveter': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'power-tools': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'default': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return gradients[category] || gradients['default'];
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes popIn {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .fade-in {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);