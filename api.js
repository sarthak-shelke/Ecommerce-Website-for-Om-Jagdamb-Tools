/**
 * API Service Layer for Django Backend Integration
 * Handles all communication with the Django e-commerce backend
 */

class APIService {
    constructor() {
        // Base URL for the Django API - adjust this to match your Django server
        this.baseURL = window.location.origin;
        this.apiURL = `${this.baseURL}/api`;
        this.mediaURL = `${this.baseURL}`;
    }

    /**
     * Fetch all products from Django API
     * @returns {Promise<Array>} Array of product objects
     */
    async fetchProducts() {
        try {
            const response = await fetch(`${this.apiURL}/products/`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Transform Django API response to frontend format
            return this.transformProductData(data);
            
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    /**
     * Fetch a specific product by ID
     * @param {number} productId - The product ID
     * @returns {Promise<Object>} Product object
     */
    async fetchProductById(productId) {
        try {
            const response = await fetch(`${this.apiURL}/products/${productId}/`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.transformSingleProduct(data);
            
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            throw error;
        }
    }

    /**
     * Transform Django API product data to frontend format
     * @param {Array|Object} data - Raw API response
     * @returns {Array} Transformed product array
     */
    transformProductData(data) {
        // Handle both array and paginated responses
        const products = Array.isArray(data) ? data : (data.results || [data]);
        
        return products.map(product => this.transformSingleProduct(product));
    }

    /**
     * Transform a single product object
     * @param {Object} product - Raw product data from API
     * @returns {Object} Transformed product object
     */
    transformSingleProduct(product) {
        // Get primary image or first available image
        const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
        
        return {
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price) || 0,
            originalPrice: product.original_price ? parseFloat(product.original_price) : null,
            category: product.category?.name || 'Tools',
            image: primaryImage ? this.getFullImageUrl(primaryImage.image) : null,
            images: product.images?.map(img => ({
                ...img,
                image: this.getFullImageUrl(img.image)
            })) || [],
            stock: product.stock || 0,
            rating: product.rating || 4.5,
            reviews: product.reviews_count || 0,
            discount: product.discount_percentage || 0,
            featured: product.is_featured || false,
            isActive: product.is_active !== false,
            tags: product.tags || []
        };
    }

    /**
     * Construct full image URL from relative path
     * @param {string} imagePath - Relative image path from API
     * @returns {string} Full image URL
     */
    getFullImageUrl(imagePath) {
        if (!imagePath) return null;
        
        // If already a full URL, return as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // Remove leading slash if present to avoid double slashes
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        
        return `${this.mediaURL}/${cleanPath}`;
    }

    /**
     * Validate product data
     * @param {Object} product - Product object to validate
     * @returns {boolean} True if valid
     */
    validateProduct(product) {
        return product && 
               typeof product.id === 'number' && 
               typeof product.name === 'string' && 
               product.name.length > 0 &&
               typeof product.price === 'number' && 
               product.price >= 0;
    }

    /**
     * Handle API errors with retry logic
     * @param {Function} apiCall - The API function to retry
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} delay - Delay between retries in ms
     * @returns {Promise} Result of API call
     */
    async withRetry(apiCall, maxRetries = 3, delay = 1000) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await apiCall();
            } catch (error) {
                lastError = error;
                
                if (attempt === maxRetries) {
                    break;
                }
                
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
        
        throw lastError;
    }
}

// Create global API service instance
const apiService = new APIService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}