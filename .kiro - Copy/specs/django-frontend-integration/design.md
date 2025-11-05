# Design Document

## Overview

This design integrates the existing Django e-commerce backend with the frontend JavaScript application by replacing hardcoded sample data with dynamic API calls. The solution maintains the existing UI/UX while connecting to real product data and images from the Django backend.

## Architecture

### Current State
- Frontend uses hardcoded `sampleProducts` array with Font Awesome icons
- Product cards display icons instead of actual images
- No connection to Django backend API endpoints

### Target State
- Frontend fetches product data from Django `/api/products/` endpoint
- Product cards display actual images from Django media server
- Seamless integration with existing cart and product detail functionality

### Data Flow
```
Django Backend → Product API → Frontend JavaScript → Product Cards → User Interface
     ↓
Media Server → Product Images → Image Display → User Interface
```

## Components and Interfaces

### 1. API Service Layer
**Purpose**: Handle all communication with Django backend
**Location**: New `api.js` file
**Functions**:
- `fetchProducts()`: Get all products from `/api/products/`
- `fetchProductById(id)`: Get specific product details
- `getImageUrl(imagePath)`: Construct full image URLs

### 2. Product Data Manager
**Purpose**: Manage product data state and caching
**Location**: Enhanced `script.js`
**Functions**:
- `loadProductsFromAPI()`: Replace hardcoded data loading
- `cacheProductData()`: Store API responses locally
- `getProductData()`: Retrieve cached or fresh data

### 3. Image Display Component
**Purpose**: Handle product image rendering with fallbacks
**Location**: Enhanced `script.js`
**Functions**:
- `createProductImage()`: Generate image elements with proper src
- `handleImageError()`: Fallback for failed image loads
- `lazyLoadProductImages()`: Optimize image loading

### 4. Product Card Renderer
**Purpose**: Update product card creation to use real data
**Location**: Modified `createProductCard()` in `script.js`
**Changes**:
- Replace icon display with actual images
- Use API data instead of hardcoded properties
- Handle missing images gracefully

## Data Models

### API Response Format
```javascript
{
  "id": 1,
  "name": "Professional Hammer",
  "description": "Heavy-duty steel hammer for construction work",
  "price": "899.00",
  "category": {
    "id": 1,
    "name": "Hand Tools"
  },
  "images": [
    {
      "id": 1,
      "image": "/media/products/hammer-001.jpg",
      "alt_text": "Professional Hammer",
      "is_primary": true,
      "order": 0
    }
  ],
  "stock": 25,
  "is_active": true
}
```

### Frontend Product Object
```javascript
{
  id: 1,
  name: "Professional Hammer",
  description: "Heavy-duty steel hammer for construction work",
  price: 899,
  category: "Hand Tools",
  image: "/media/products/hammer-001.jpg",
  images: [...], // All product images
  stock: 25,
  rating: 4.5, // Default or from API
  reviews: 128 // Default or from API
}
```

## Error Handling

### API Failures
- **Network Error**: Show cached data if available, otherwise display error message
- **Server Error**: Retry mechanism with exponential backoff
- **Invalid Data**: Log error and skip malformed products

### Image Loading Failures
- **Primary Strategy**: Show placeholder image with product name
- **Fallback Strategy**: Display Font Awesome icon as last resort
- **Loading States**: Show skeleton loader while images load

### Data Validation
- Validate required fields (id, name, price) before rendering
- Handle missing or null image arrays
- Sanitize product descriptions for XSS prevention

## Testing Strategy

### Unit Tests
- API service functions with mocked responses
- Product data transformation logic
- Image URL construction and validation
- Error handling scenarios

### Integration Tests
- End-to-end product loading flow
- Image display with various data states
- Cart functionality with API-sourced products
- Product detail navigation with real data

### Manual Testing
- Visual verification of product images
- Performance testing with large product catalogs
- Cross-browser compatibility
- Mobile responsiveness with real images

## Implementation Phases

### Phase 1: API Integration
1. Create API service layer
2. Replace hardcoded data loading
3. Basic error handling

### Phase 2: Image Display
1. Update product card rendering
2. Implement image fallbacks
3. Add loading states

### Phase 3: Optimization
1. Implement caching strategy
2. Add lazy loading
3. Performance monitoring

### Phase 4: Enhancement
1. Multiple image support
2. Image optimization
3. Advanced error recovery