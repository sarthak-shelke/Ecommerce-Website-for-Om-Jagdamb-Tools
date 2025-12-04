/**
 * API Service Layer for Django Backend Integration
 * Handles all communication with the Django e-commerce backend
 */

class APIService {
    constructor() {
        // Base URL for the Django API - adjust this to match your Django server
        // We set this to the Django server port, not the frontend port.
        this.baseURL = 'http://127.0.0.1:8000';
        this.apiURL = `${this.baseURL}/api`;
        this.mediaURL = this.baseURL; // Media files are served from the root
    }

    /**
     * Fetch all products from Django API
     * @returns {Promise<Array>} Array of product objects
     */
    async fetchProducts() {
        try {
            // Note: We are using the hard-coded API URL.
            const response = await fetch('http://127.0.0.1:8000/api/products/');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Transform Django API response to frontend format
            // This is handled by script.js now, but we'll keep the helper.
            return this.transformProductData(data);
            
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    /**
     * Fetch a specific product by ID (or slug)
     * @param {string} slug - The product slug
     * @returns {Promise<Object>} Product object
     */
    async fetchProductBySlug(slug) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/products/${slug}/`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.transformSingleProduct(data);
            
        } catch (error) {
            console.error(`Error fetching product ${slug}:`, error);
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
        // NOTE: Our API now sends primary_image directly, so this is just a fallback.
        const primaryImage = product.primary_image || product.images?.find(img => img.is_primary) || product.images?.[0];
        
        return {
            id: product.id,
            slug: product.slug, // Make sure slug is passed
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price) || 0,
            originalPrice: product.original_price ? parseFloat(product.original_price) : null,
            category: product.category?.name || 'Tools',
            // Use the full URL from the API if it exists
            image: product.primary_image || (primaryImage ? this.getFullImageUrl(primaryImage.image) : null),
            images: product.images?.map(img => ({
                ...img,
                image: this.getFullImageUrl(img.image)
            })) || [],
            stock: product.stock_quantity || 0,
            rating: product.average_rating || 4.5,
            reviews: product.review_count || 0,
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
        
        // If already a full URL (from our new serializer), return as is
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
}

// Create global API service instance
const apiService = new APIService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}