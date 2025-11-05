// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {
    currency: 'INR',
    language: 'en',
    theme: 'light'
};

// Product loading state
let isLoadingProducts = false;
let productsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Sample Products Data with dynamic properties
const sampleProducts = [
    {
        id: 1,
        name: "Manual Riveter",
        image: "images/016-manual-riveter-250x250.webp",
        price: 899,
        originalPrice: 999,
        category: "hand-tools",
        description: "Heavy-duty manual riveter for professional construction work",
        icon: "fas fa-hammer",
        stock: 25,
        rating: 4.5,
        reviews: 128,
        discount: 10,
        featured: true,
        tags: ["professional", "heavy-duty", "riveter"]
    },
    {
        id: 2,
        name: "Pneumatic Screwdriver Pistol",
        image: "images/pneumatic-screwdriver-pistol-250x250.webp",
        price: 2499,
        originalPrice: 2799,
        category: "power-tools",
        description: "High-power pneumatic screwdriver with pistol grip design",
        icon: "fas fa-drill",
        stock: 15,
        rating: 4.8,
        reviews: 89,
        discount: 11,
        featured: true,
        tags: ["pneumatic", "power-tool", "screwdriver"]
    },
    {
        id: 3,
        name: "OM-3 Riveting Tool",
        image: "images/om-3-riveting-tool-250x250.webp",
        price: 1599,
        category: "hand-tools",
        description: "Professional OM-3 riveting tool for precision work",
        icon: "fas fa-tools",
        stock: 30,
        rating: 4.3,
        reviews: 67,
        featured: false,
        tags: ["riveting", "precision", "professional"]
    },
    {
        id: 4,
        name: "Nutsert Tool Pneumatic",
        image: "images/nutsert-tool-pneumatic-pistol-type-250x250.webp",
        price: 3299,
        category: "power-tools",
        description: "Pneumatic nutsert tool with pistol-type design for efficient installation",
        icon: "fas fa-cog",
        stock: 40,
        rating: 4.6,
        reviews: 95,
        featured: true,
        tags: ["nutsert", "pneumatic", "installation"]
    },
    {
        id: 5,
        name: "Pneumatic Pop Rivet Gun",
        image: "images/pneumatic-pop-rivet-gun-with-counter-250x250.webp",
        price: 4299,
        originalPrice: 4599,
        category: "power-tools",
        description: "Heavy-duty pneumatic pop rivet gun with counter for professional use",
        icon: "fas fa-tools",
        stock: 12,
        rating: 4.7,
        reviews: 73,
        discount: 7,
        featured: true,
        tags: ["pneumatic", "rivet-gun", "counter"]
    },
    {
        id: 6,
        name: "Tapping Tool Pistol Type",
        image: "images/017-tapping-tool-pistol-type-250x250.webp",
        price: 1899,
        originalPrice: 2199,
        category: "hand-tools",
        description: "Precision tapping tool with pistol-type grip for threading operations",
        icon: "fas fa-wrench",
        stock: 50,
        rating: 4.4,
        reviews: 156,
        discount: 14,
        featured: false,
        tags: ["tapping", "threading", "precision"]
    },
    {
        id: 7,
        name: "Hydraulic Power Pack Riveting Tool",
        image: "images/hydraulic-power-pack-riveting-tool-electrical--250x250.webp",
        price: 8999,
        originalPrice: 9999,
        category: "power-tools",
        description: "Electrical hydraulic power pack riveting tool for heavy-duty applications",
        icon: "fas fa-bolt",
        stock: 8,
        rating: 4.9,
        reviews: 45,
        discount: 10,
        featured: true,
        tags: ["hydraulic", "electrical", "heavy-duty"]
    },
    {
        id: 8,
        name: "Hexagonal Rivet Nut",
        image: "images/hexagonal-rivetnut-250x250.webp",
        price: 299,
        category: "accessories",
        description: "High-quality hexagonal rivet nuts for secure fastening",
        icon: "fas fa-nut-bolt",
        stock: 200,
        rating: 4.2,
        reviews: 89,
        featured: false,
        tags: ["rivet-nut", "hexagonal", "fastening"]
    },
    {
        id: 9,
        name: "M6 Rivet Stud",
        image: "images/m-6-rivet-stud-250x250.webp",
        price: 199,
        category: "accessories",
        description: "M6 rivet studs for professional construction applications",
        icon: "fas fa-bolt",
        stock: 150,
        rating: 4.1,
        reviews: 67,
        featured: false,
        tags: ["rivet-stud", "M6", "construction"]
    },
    {
        id: 10,
        name: "Stud Installation Tool OM-10",
        image: "images/stus-installation-tool-om-10-250x250.webp",
        price: 2799,
        originalPrice: 3199,
        category: "hand-tools",
        description: "OM-10 stud installation tool for precise and efficient installation",
        icon: "fas fa-tools",
        stock: 20,
        rating: 4.6,
        reviews: 34,
        discount: 13,
        featured: true,
        tags: ["stud-installation", "OM-10", "precision"]
    },
    {
        id: 11,
        name: "Half Hexagonal Rivet Nut",
        image: "images/half-hexagonal-rivetnut-250x250.webp",
        price: 249,
        category: "accessories",
        description: "Half hexagonal rivet nuts for specialized fastening applications",
        icon: "fas fa-nut-bolt",
        stock: 180,
        rating: 4.0,
        reviews: 52,
        featured: false,
        tags: ["rivet-nut", "half-hexagonal", "specialized"]
    },
    {
        id: 12,
        name: "Professional Rivet Nuts",
        image: "images/rivet-nut-250x250.webp",
        price: 399,
        originalPrice: 449,
        category: "accessories",
        description: "High-grade professional rivet nuts for industrial applications",
        icon: "fas fa-nut-bolt",
        stock: 120,
        rating: 4.3,
        reviews: 78,
        discount: 11,
        featured: false,
        tags: ["professional", "industrial", "rivet-nuts"]
    }
];

// DOM Elements - Initialize after DOM is loaded
let loadingScreen, hamburger, navMenu, cartIcon, cartSidebar, overlay, closeCart, cartCount, cartItems, cartTotal, productsGrid;

// Initialize DOM elements
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
    
    console.log('DOM Elements initialized:', {
        loadingScreen: !!loadingScreen,
        hamburger: !!hamburger,
        navMenu: !!navMenu,
        cartIcon: !!cartIcon,
        cartSidebar: !!cartSidebar,
        overlay: !!overlay,
        closeCart: !!closeCart,
        cartCount: !!cartCount,
        cartItems: !!cartItems,
        cartTotal: !!cartTotal,
        productsGrid: !!productsGrid
    });
}


// Initialize App
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded - Initializing app...');
    
    // Initialize DOM elements first
    initializeDOMElements();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize user authentication state
    initializeUserAuth();
    
    // Initialize cart UI
    updateCartUI();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Load products from API (with fallback)
    try {
        await loadProductsFromAPI();
    } catch (error) {
        console.error('Critical error loading products:', error);
        // Emergency fallback
        products = [...sampleProducts];
        if (productsGrid) {
            displayFeaturedProducts(products);
        }
    }
    
    // Hide loading screen after products are loaded
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1000);
    
    console.log('App initialization complete');
    
    // Add debug function to window for testing
    window.debugProducts = function() {
        console.log('=== PRODUCT DEBUG INFO ===');
        console.log('Products array:', products);
        console.log('Products grid element:', productsGrid);
        console.log('Sample products:', sampleProducts);
        console.log('API Service available:', typeof apiService !== 'undefined');
        
        if (products.length === 0) {
            console.log('No products loaded, trying to load sample products...');
            products = [...sampleProducts];
            displayProducts(products);
        }
        
        return {
            products,
            productsGrid,
            sampleProducts,
            apiServiceAvailable: typeof apiService !== 'undefined'
        };
    };
    
    // Test products loading immediately after a short delay
    setTimeout(() => {
        if (products.length === 0) {
            console.log('No products loaded after initialization, loading sample products as fallback...');
            products = [...sampleProducts];
            displayFeaturedProducts(products);
        }
    }, 500);
});

// Initialize Event Listeners
function initializeEventListeners() {
    // Mobile Menu Toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Cart Functionality
    if (cartIcon && cartSidebar && overlay) {
        cartIcon.addEventListener('click', () => {
            cartSidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', closeCartSidebar);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeCartSidebar);
    }
    
    // Search functionality
    const searchIcon = document.querySelector('.search-icon');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            const searchTerm = prompt('Search for products:');
            if (searchTerm) {
                const filteredProducts = products.filter(product => 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
                displayProducts(filteredProducts);
            }
        });
    }
    
    // Checkout functionality
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            // Simple checkout simulation
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const confirmed = confirm(`Proceed to checkout?\nTotal: ₹${total}\n\nThis will redirect to payment gateway.`);
            
            if (confirmed) {
                // Simulate payment process
                showPaymentModal();
            }
        });
    }
}

function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Product Loading Functions
async function loadProductsFromAPI() {
    if (isLoadingProducts) {
        return;
    }
    
    // Check cache first
    if (productsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        products = productsCache;
        displayFeaturedProducts(products);
        return;
    }
    
    isLoadingProducts = true;
    
    try {
        showProductsLoading();
        
        // Check if apiService is available
        if (typeof apiService === 'undefined') {
            throw new Error('API service not available');
        }
        
        // Try to load from API with enhanced retry logic
        const apiProducts = await retryApiCall(() => apiService.fetchProducts(), 2, 500);
        
        if (apiProducts && apiProducts.length > 0) {
            // Filter out invalid products
            products = apiProducts.filter(product => apiService.validateProduct(product));
            
            // Cache the results
            productsCache = products;
            cacheTimestamp = Date.now();
            
            displayFeaturedProducts(products);
            hideProductsLoading();
            console.log('Successfully loaded products from API');
        } else {
            throw new Error('No valid products received from API');
        }
        
    } catch (error) {
        console.warn('Failed to load products from API:', error.message);
        
        // Fallback to sample data if API fails
        await loadFallbackProducts();
        
        // Only show error message if it's not a network/API unavailable issue
        if (!error.message.includes('Failed to fetch') && !error.message.includes('API service not available')) {
            showErrorMessage('Unable to load latest products. Showing sample data.', 'warning', 3000);
        }
    } finally {
        isLoadingProducts = false;
    }
}

async function loadFallbackProducts() {
    console.log('Loading fallback sample products...');
    products = [...sampleProducts];
    
    // Ensure products grid exists before displaying
    if (productsGrid) {
        displayFeaturedProducts(products);
        console.log(`Loaded ${products.length} sample products`);
    } else {
        console.error('Products grid element not found!');
    }
    
    hideProductsLoading();
}

// Display only featured products on home page
function displayFeaturedProducts(allProducts) {
    console.log('displayFeaturedProducts called with:', allProducts?.length || 0, 'products');
    
    if (!productsGrid) {
        console.error('Products grid element not found! Cannot display products.');
        return;
    }
    
    // Filter for featured products or show first 6 if none are marked as featured
    const featuredProducts = allProducts.filter(product => product.featured);
    const productsToShow = featuredProducts.length > 0 ? featuredProducts : allProducts.slice(0, 6);
    
    if (!productsToShow || productsToShow.length === 0) {
        productsGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #666;">No products available</div>';
        return;
    }
    
    // Clear existing content
    productsGrid.innerHTML = '';
    
    productsToShow.forEach((product, index) => {
        try {
            const productCard = createProductCard(product);
            productCard.style.animationDelay = `${index * 0.1}s`;
            productsGrid.appendChild(productCard);
        } catch (error) {
            console.error(`Error creating product card for product ${product?.id}:`, error);
        }
    });
    
    // Add "View All Products" button if there are more products
    if (allProducts.length > productsToShow.length) {
        const viewAllButton = document.createElement('div');
        viewAllButton.className = 'view-all-products';
        viewAllButton.innerHTML = `
            <a href="product_webpage.html" class="btn-view-all">
                <i class="fas fa-arrow-right"></i>
                View All Products (${allProducts.length})
            </a>
        `;
        productsGrid.appendChild(viewAllButton);
    }
    
    console.log(`Successfully displayed ${productsToShow.length} featured products`);
    
    // Initialize lazy loading for newly added images
    setTimeout(() => {
        lazyLoadImages();
    }, 100);
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

function hideProductsLoading() {
    const loadingElement = document.querySelector('.products-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Enhanced error handling and user feedback
function showErrorMessage(message, type = 'error', duration = 5000) {
    // Remove existing messages of the same type
    document.querySelectorAll(`.${type}-message`).forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    
    const bgColor = type === 'error' ? '#ff6b6b' : type === 'warning' ? '#ffa726' : '#4caf50';
    const icon = type === 'error' ? 'fas fa-exclamation-triangle' : type === 'warning' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        max-width: 350px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
    `;
    
    messageDiv.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button onclick="this.parentNode.remove()" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; margin-left: auto;">×</button>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after specified duration
    if (duration > 0) {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, duration);
    }
}

// Network connectivity checker
class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.listeners = [];
        
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyListeners('online');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyListeners('offline');
        });
    }
    
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    notifyListeners(status) {
        this.listeners.forEach(callback => callback(status));
    }
    
    async checkConnectivity() {
        try {
            const response = await fetch('/api/health/', { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

const networkMonitor = new NetworkMonitor();

// Enhanced error recovery
networkMonitor.addListener((status) => {
    if (status === 'online') {
        showErrorMessage('Connection restored. Refreshing products...', 'success', 3000);
        // Retry loading products after connection is restored
        setTimeout(() => {
            if (products.length === 0 || products === sampleProducts) {
                loadProductsFromAPI();
            }
        }, 1000);
    } else {
        showErrorMessage('Connection lost. Using cached data.', 'warning', 0);
    }
});

// Graceful degradation for missing images
function createRobustProductImage(product) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image-container';
    imageContainer.style.cssText = 'position: relative; width: 100%; height: 200px;';
    
    if (product.image) {
        const img = document.createElement('img');
        img.dataset.src = product.image;
        img.alt = product.name;
        img.className = 'lazy product-image-main';
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 8px; opacity: 0; transition: opacity 0.3s ease;';
        
        // Enhanced error handling
        img.onerror = () => {
            console.warn(`Failed to load image for ${product.name}: ${product.image}`);
            handleImageError(img, product.name, product.icon || 'fas fa-tools');
            
            // Log error for analytics
            logImageError(product.id, product.image);
        };
        
        imageContainer.appendChild(img);
    } else {
        // Create icon placeholder
        const placeholder = createIconPlaceholder(product);
        imageContainer.appendChild(placeholder);
    }
    
    return imageContainer.outerHTML;
}

function createIconPlaceholder(product) {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = `<i class="${product.icon || 'fas fa-tools'}"></i>`;
    placeholder.title = `${product.name} - Image not available`;
    return placeholder;
}

// Error logging for debugging
function logImageError(productId, imageUrl) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        productId,
        imageUrl,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    // Store in localStorage for debugging
    const errors = JSON.parse(localStorage.getItem('imageErrors') || '[]');
    errors.push(errorLog);
    
    // Keep only last 50 errors
    if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
    }
    
    localStorage.setItem('imageErrors', JSON.stringify(errors));
}

// Retry mechanism for failed API calls
async function retryApiCall(apiFunction, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiFunction();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries) {
                break;
            }
            
            // Exponential backoff with jitter
            const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            console.warn(`API call attempt ${attempt} failed, retrying in ${delay}ms...`);
        }
    }
    
    throw lastError;
}

// Enhanced cart error handling
function addToCartWithErrorHandling(productId) {
    try {
        const product = products.find(p => p.id === productId);
        if (!product) {
            throw new Error('Product not found');
        }
        
        if (product.stock <= 0) {
            showErrorMessage('This product is currently out of stock.', 'warning');
            return;
        }
        
        addToCart(productId);
        
    } catch (error) {
        console.error('Error adding product to cart:', error);
        showErrorMessage('Failed to add product to cart. Please try again.', 'error');
    }
}

// Product Display Functions
function displayProducts(productsToShow) {
    console.log('displayProducts called with:', productsToShow?.length || 0, 'products');
    
    if (!productsGrid) {
        console.error('Products grid element not found! Cannot display products.');
        return;
    }
    
    if (!productsToShow || productsToShow.length === 0) {
        productsGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #666;">No products available</div>';
        return;
    }
    
    // Clear existing content
    productsGrid.innerHTML = '';
    
    productsToShow.forEach((product, index) => {
        try {
            const productCard = createProductCard(product);
            productCard.style.animationDelay = `${index * 0.1}s`;
            productsGrid.appendChild(productCard);
        } catch (error) {
            console.error(`Error creating product card for product ${product?.id}:`, error);
        }
    });
    
    console.log(`Successfully displayed ${productsToShow.length} products`);
    
    // Initialize lazy loading for newly added images
    setTimeout(() => {
        lazyLoadImages();
    }, 100);
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card-modern fade-in';
    
    // Get gradient colors based on product category
    const gradientColors = getProductGradient(product.category);
    
    card.innerHTML = `
        <div class="product-card-header" style="background: ${gradientColors};" onclick="viewProductDetails(${product.id})">
            <div class="product-icon">
                <i class="${product.icon || 'fas fa-tools'}"></i>
            </div>
            <div class="product-overlay">
                <span class="overlay-text">Click to view details</span>
            </div>
        </div>
        <div class="product-card-body">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price-modern">
                ${createModernPriceDisplay(product)}
            </div>
            <div class="product-actions-modern">
                <button class="btn-view-details" onclick="viewProductDetails(${product.id})">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn-add-cart" onclick="addToCartWithErrorHandling(${product.id})" ${product.stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `;
    return card;
}

function getProductGradient(category) {
    const gradients = {
        'hand-tools': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'power-tools': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'safety': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'measuring': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'default': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    
    return gradients[category] || gradients['default'];
}

function createModernPriceDisplay(product) {
    if (product.originalPrice && product.originalPrice > product.price) {
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        return `
            <div class="price-container">
                <span class="current-price">₹${product.price}</span>
                <span class="original-price">₹${product.originalPrice}</span>
                <span class="discount-badge">${discount}% OFF</span>
            </div>
        `;
    } else {
        return `<div class="price-container"><span class="current-price">₹${product.price}</span></div>`;
    }
}

function createProductImage(product) {
    if (product.image) {
        return `
            <img data-src="${product.image}" 
                 alt="${product.name}" 
                 class="lazy"
                 onerror="handleImageError(this, '${product.name}', '${product.icon || 'fas fa-tools'}')"
                 style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; opacity: 0; transition: opacity 0.3s ease;">
        `;
    } else {
        // Fallback to icon or placeholder
        const iconClass = product.icon || 'fas fa-tools';
        return `
            <div class="image-placeholder">
                <i class="${iconClass}"></i>
            </div>
        `;
    }
}

function createPriceDisplay(product) {
    if (product.originalPrice && product.originalPrice > product.price) {
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        return `
            <div class="product-price">
                <span class="current-price">₹${product.price}</span>
                <span class="original-price" style="text-decoration: line-through; color: #999; margin-left: 8px;">₹${product.originalPrice}</span>
                <span class="discount-badge" style="background: #ff4757; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; margin-left: 8px;">${discount}% OFF</span>
            </div>
        `;
    } else {
        return `<div class="product-price">₹${product.price}</div>`;
    }
}

function handleImageError(imgElement, productName, iconClass) {
    // Replace failed image with icon placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = `<i class="${iconClass}"></i>`;
    placeholder.title = `Image not available for ${productName}`;
    
    imgElement.parentNode.replaceChild(placeholder, imgElement);
}

// Product Detail Navigation
function viewProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        console.log(`Navigating to details for: ${product.name}`);
        
        // Use actual product image or fallback
        const imageUrl = product.image || createFallbackImageUrl(product.name);
        
        // Prepare all product images for the detail page
        const allImages = product.images && product.images.length > 0 
            ? product.images.map(img => img.image).join(',')
            : imageUrl;
        
        // Create URL parameters with real product data
        const params = new URLSearchParams({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || '',
            image: imageUrl,
            images: allImages,
            desc: product.description,
            category: product.category || 'Tools',
            rating: product.rating || 4.5,
            reviews: product.reviews || 0,
            stock: product.stock || 0,
            discount: product.discount || 0,
            featured: product.featured || false
        });
        
        window.location.href = `product_detail.html?${params.toString()}`;
    } else {
        console.error(`Product with ID ${productId} not found`);
        alert('Product not found. Please try again.');
    }
}

function createFallbackImageUrl(productName) {
    // Create a more descriptive placeholder image
    const encodedName = encodeURIComponent(productName.substring(0, 15));
    return `https://placehold.co/600x600/e2e8f0/334155?text=${encodedName}`;
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({...product, quantity: 1});
        }
        
        updateCartUI();
        showAddToCartAnimation();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    if (!cartCount || !cartItems || !cartTotal) {
        console.warn('Cart UI elements not found');
        return;
    }
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    
    // Update cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : `<i class="${item.icon || 'fas fa-tools'}"></i>`}
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">₹${item.price} x ${item.quantity}</div>
                </div>
                <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #ff4757; cursor: pointer; font-size: 1.2rem;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total;
}

function showAddToCartAnimation() {
    // Create a temporary animation element
    const animation = document.createElement('div');
    animation.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
    animation.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 25px;
        z-index: 10000;
        font-weight: 600;
        animation: popIn 0.5s ease-out;
    `;
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
        animation.remove();
    }, 1500);
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    // Add fade-in class to feature cards and service cards
    document.querySelectorAll('.feature-card, .service-card').forEach(el => {
        el.classList.add('fade-in');
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
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
}

// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Event listeners are now initialized in initializeEventListeners()

function showPaymentModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        width: 90%;
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 3rem; color: #4CAF50; margin-bottom: 1rem;">
            <i class="fas fa-check-circle"></i>
        </div>
        <h3>Payment Successful!</h3>
        <p>Thank you for your order. You will receive a confirmation email shortly.</p>
        <button onclick="this.closest('.modal').remove(); cart = []; updateCartUI(); closeCartSidebar();" 
                style="margin-top: 1rem; padding: 0.8rem 2rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Continue Shopping
        </button>
    `;
    
    modal.className = 'modal';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Add CSS for animations and loading states
const style = document.createElement('style');
style.textContent = `
    @keyframes popIn {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
    
    .product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }
    
    .product-image img:hover {
        transform: scale(1.05);
    }
    
    .product-image img.loaded {
        opacity: 1 !important;
    }
    
    .product-image img.loading {
        opacity: 0.5;
    }
    
    .image-placeholder {
        width: 100%;
        height: 200px;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        color: #6c757d;
        font-size: 3rem;
    }
    
    .image-loading-overlay .loading-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    /* Modern Product Card Styles */
    .product-card-modern {
        background: white;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.6s ease forwards;
    }
    
    .product-card-modern:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    
    .product-card-header {
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        cursor: pointer;
    }
    
    .product-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .product-card-header:hover .product-overlay {
        opacity: 1;
    }
    
    .overlay-text {
        color: white;
        font-weight: 600;
        font-size: 1rem;
        text-align: center;
        padding: 0.5rem;
    }
    
    .product-icon {
        font-size: 4rem;
        color: white;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 2;
    }
    
    .product-card-body {
        padding: 1.5rem;
        text-align: center;
    }
    
    .product-name {
        font-size: 1.25rem;
        font-weight: 600;
        color: #2d3748;
        margin: 0 0 0.5rem 0;
        line-height: 1.3;
    }
    
    .product-description {
        color: #718096;
        font-size: 0.9rem;
        margin: 0 0 1rem 0;
        line-height: 1.4;
    }
    
    .product-price-modern {
        margin: 1rem 0;
    }
    
    .price-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .current-price {
        font-size: 1.5rem;
        font-weight: 700;
        color: #667eea;
    }
    
    .original-price {
        font-size: 1rem;
        color: #a0aec0;
        text-decoration: line-through;
    }
    
    .discount-badge {
        background: #ff6b6b;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .product-actions-modern {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    
    .btn-view-details, .btn-add-cart {
        flex: 1;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .btn-view-details {
        background: #e2e8f0;
        color: #4a5568;
    }
    
    .btn-view-details:hover {
        background: #cbd5e0;
        transform: translateY(-2px);
    }
    
    .btn-add-cart {
        background: #ffd700;
        color: #2d3748;
    }
    
    .btn-add-cart:hover {
        background: #f6d55c;
        transform: translateY(-2px);
    }
    
    .btn-add-cart:disabled {
        background: #e2e8f0;
        color: #a0aec0;
        cursor: not-allowed;
    }
    
    .btn-add-cart:disabled:hover {
        transform: none;
    }
    
    /* Grid layout for modern cards */
    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        padding: 2rem 0;
    }
    
    /* View All Products Button */
    .view-all-products {
        grid-column: 1 / -1;
        display: flex;
        justify-content: center;
        margin-top: 2rem;
    }
    
    .btn-view-all {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    .btn-view-all:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        text-decoration: none;
        color: white;
    }
    
    @media (max-width: 768px) {
        .products-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .product-card-modern {
            margin: 0 1rem;
        }
        
        .product-actions-modern {
            flex-direction: column;
        }
        
        .btn-view-all {
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* User Account Dropdown Styles */
    .user-account-dropdown {
        position: relative;
        display: inline-block;
    }
    
    .user-account-trigger {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
    }
    
    .user-account-trigger:hover {
        background: rgba(102, 126, 234, 0.2);
        border-color: #667eea;
    }
    
    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #667eea;
    }
    
    .user-name {
        font-weight: 600;
        color: #333;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .user-account-trigger i {
        color: #667eea;
        font-size: 0.8rem;
        transition: transform 0.3s ease;
    }
    
    .user-account-dropdown.active .user-account-trigger i {
        transform: rotate(180deg);
    }
    
    .user-dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 1000;
        margin-top: 0.5rem;
    }
    
    .user-account-dropdown.active .user-dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        color: #333;
        text-decoration: none;
        transition: background 0.3s ease;
        border-radius: 8px;
        margin: 0.25rem;
    }
    
    .dropdown-item:hover {
        background: #f8f9fa;
        color: #667eea;
        text-decoration: none;
    }
    
    .dropdown-item i {
        width: 16px;
        color: #666;
    }
    
    .dropdown-item:hover i {
        color: #667eea;
    }
    
    .dropdown-divider {
        height: 1px;
        background: #e9ecef;
        margin: 0.5rem 0;
    }
    
    /* Mobile responsive */
    @media (max-width: 768px) {
        .user-name {
            display: none;
        }
        
        .user-dropdown-menu {
            right: -50px;
            min-width: 180px;
        }
    }
`;
document.head.appendChild(style);

// Enhanced lazy loading for product images
function lazyLoadImages() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Show loading indicator
                showImageLoading(img);
                
                // Load the actual image
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    
                    img.onload = () => {
                        hideImageLoading(img);
                        img.classList.add('loaded');
                    };
                    
                    img.onerror = () => {
                        hideImageLoading(img);
                        handleImageError(img, img.alt || 'Product', 'fas fa-tools');
                    };
                }
                
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px', // Start loading 50px before image comes into view
        threshold: 0.1
    });
    
    // Observe all lazy images
    document.querySelectorAll('img[data-src], img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

function showImageLoading(imgElement) {
    // Add loading class for CSS styling
    imgElement.classList.add('loading');
    
    // Create loading overlay if it doesn't exist
    if (!imgElement.parentNode.querySelector('.image-loading-overlay')) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'image-loading-overlay';
        loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
        loadingOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(248, 249, 250, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
        `;
        
        imgElement.parentNode.style.position = 'relative';
        imgElement.parentNode.appendChild(loadingOverlay);
    }
}

function hideImageLoading(imgElement) {
    imgElement.classList.remove('loading');
    
    const loadingOverlay = imgElement.parentNode.querySelector('.image-loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Image caching and optimization
class ImageCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 50; // Maximum number of cached images
    }
    
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            if (this.cache.has(src)) {
                resolve(this.cache.get(src));
                return;
            }
            
            const img = new Image();
            img.onload = () => {
                this.addToCache(src, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = src;
        });
    }
    
    addToCache(src, img) {
        if (this.cache.size >= this.maxSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(src, img);
    }
    
    getCachedImage(src) {
        return this.cache.get(src);
    }
}

// Global image cache instance
const imageCache = new ImageCache();

// Preload critical images
function preloadCriticalImages() {
    // Preload first few product images for better performance
    const criticalProducts = products.slice(0, 6);
    
    criticalProducts.forEach(product => {
        if (product.image) {
            imageCache.preloadImage(product.image).catch(error => {
                console.warn(`Failed to preload image for ${product.name}:`, error);
            });
        }
    });
}

// Initialize lazy loading and preloading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lazy loading after a short delay to ensure DOM is fully ready
    setTimeout(() => {
        lazyLoadImages();
        preloadCriticalImages();
    }, 100);
});

// Add some interactive features
document.addEventListener('mousemove', (e) => {
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        const rect = hero.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            
            document.querySelectorAll('.tool-icon').forEach((icon, index) => {
                const speed = (index + 1) * 0.5;
                icon.style.transform = `translate(${x * speed * 0.02}px, ${y * speed * 0.02}px)`;
            });
        }
    }
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCartSidebar();
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Add touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        // Swipe left - open cart
        if (!cartSidebar.classList.contains('open')) {
            cartIcon.click();
        }
    }
    if (touchEndX > touchStartX + 50) {
        // Swipe right - close cart
        if (cartSidebar.classList.contains('open')) {
            closeCartSidebar();
        }
    }
}

// User Authentication Functions
function initializeUserAuth() {
    checkUserLoginStatus();
    initializeUserDropdown();
}

function checkUserLoginStatus() {
    const isUser = localStorage.getItem('isUser');
    const isAdmin = localStorage.getItem('isAdmin');
    const userEmail = localStorage.getItem('userEmail');
    const adminEmail = localStorage.getItem('adminEmail');
    const justLoggedIn = localStorage.getItem('justLoggedIn');
    
    const loginBtn = document.getElementById('login-btn');
    const userAccount = document.getElementById('user-account');
    
    if (!loginBtn || !userAccount) return;
    
    if (isUser === 'true' && userEmail) {
        // Regular user is logged in
        showUserAccount(userEmail, false);
        
        // Show welcome message if just logged in
        if (justLoggedIn === 'true') {
            setTimeout(() => {
                const displayName = userEmail.split('@')[0];
                showNotification(`Welcome back, ${displayName}! 🎉`, 'success');
                localStorage.removeItem('justLoggedIn');
            }, 1000);
        }
    } else if (isAdmin === 'true' && adminEmail) {
        // Admin is logged in
        showUserAccount(adminEmail, true);
        
        // Show admin welcome message if just logged in
        if (justLoggedIn === 'true') {
            setTimeout(() => {
                showNotification('Welcome back, Admin! 👑', 'success');
                localStorage.removeItem('justLoggedIn');
            }, 1000);
        }
    } else {
        // No one is logged in
        showLoginButton();
    }
}

function showUserAccount(email, isAdmin = false) {
    const loginBtn = document.getElementById('login-btn');
    const userAccount = document.getElementById('user-account');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (userAccount) userAccount.style.display = 'block';
    
    if (userName) {
        const displayName = email.split('@')[0];
        userName.textContent = isAdmin ? `Admin (${displayName})` : displayName;
    }
    
    if (userAvatar) {
        // Generate avatar based on email
        const avatarUrl = generateAvatar(email);
        userAvatar.src = avatarUrl;
        userAvatar.alt = email;
    }
}

function showLoginButton() {
    const loginBtn = document.getElementById('login-btn');
    const userAccount = document.getElementById('user-account');
    
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userAccount) userAccount.style.display = 'none';
}

function generateAvatar(email) {
    // Generate a simple avatar based on email
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
    const initial = email.charAt(0).toUpperCase();
    const colorIndex = email.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    // Create a simple SVG avatar
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
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userAccountDropdown.contains(e.target)) {
                userAccountDropdown.classList.remove('active');
            }
        });
    }
}

function logout() {
    // Clear all user sessions
    localStorage.removeItem('isUser');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userLoginTime');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('loginTime');
    
    // Show login button
    showLoginButton();
    
    // Show logout message
    showNotification('You have been logged out successfully', 'success');
    
    // Refresh the page after a short delay
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// Notification function for user feedback
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}