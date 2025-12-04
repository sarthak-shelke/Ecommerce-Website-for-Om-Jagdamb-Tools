# Design Document: Product Search Feature

## Overview

The product search feature will provide users with a fast, intuitive way to find products on the Om Jagdamb Tools website. The search functionality will be implemented as a reusable component that can be integrated into both the home page (index.html) and products page (product_webpage.html). The search will use the existing Product API endpoint to fetch and filter products in real-time as users type.

The design follows a client-side approach with debounced API requests to ensure optimal performance and user experience. The search results will be displayed in a dropdown overlay that appears below the search input, showing product thumbnails, names, and prices. Clicking on a result will redirect users to the respective product detail page.

## Architecture

### Component Structure

```
Search Component
├── Search Input Field (HTML)
├── Search Results Dropdown (HTML)
├── Search Module (JavaScript)
│   ├── Event Handlers
│   │   ├── Input Handler (with debounce)
│   │   ├── Click Handler (result selection)
│   │   └── Outside Click Handler (close dropdown)
│   ├── API Integration
│   │   └── Product Fetch Function
│   └── UI Rendering
│       ├── Results Renderer
│       ├── Loading State Renderer
│       └── Error State Renderer
└── Search Styles (CSS)
```

### Integration Points

1. **Home Page (index.html)**: Search input will be added to the header navigation area, positioned between the navigation links and cart icon
2. **Products Page (product_webpage.html)**: Search input will be added to the existing header navigation in the same position
3. **API Endpoint**: Will use the existing `http://127.0.0.1:8000/api/products/` endpoint with query parameters for filtering
4. **Product Detail Page**: Will redirect to `product_detail.html?slug={product_slug}` when a search result is clicked

## Components and Interfaces

### 1. HTML Structure

The search component will consist of a search container with an input field and a results dropdown:

```html
<div class="search-container">
    <div class="search-input-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input 
            type="text" 
            id="product-search-input" 
            class="search-input" 
            placeholder="Search products..."
            autocomplete="off"
        >
        <div class="search-loading" style="display: none;">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
    </div>
    <div class="search-results-dropdown" id="search-results" style="display: none;">
        <!-- Results will be dynamically inserted here -->
    </div>
</div>
```

### 2. JavaScript Module (search.js)

A new JavaScript file will be created to handle all search functionality:

**Key Functions:**

- `initializeSearch()`: Sets up event listeners and initializes the search component
- `handleSearchInput(event)`: Debounced function that triggers search when user types
- `searchProducts(query)`: Fetches products from the API based on the search query
- `displaySearchResults(products)`: Renders the search results in the dropdown
- `showLoading()`: Displays loading spinner during API request
- `hideLoading()`: Hides loading spinner after API response
- `showError(message)`: Displays error message if API request fails
- `closeSearchDropdown()`: Closes the search results dropdown
- `redirectToProduct(slug)`: Navigates to the product detail page

**Debounce Implementation:**

```javascript
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
```

**API Request Pattern:**

```javascript
async function searchProducts(query) {
    if (query.length < 2) {
        closeSearchDropdown();
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/products/?search=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        displaySearchResults(data.results);
    } catch (error) {
        showError('Failed to search products');
    } finally {
        hideLoading();
    }
}
```

### 3. CSS Styling

The search component will use modern, responsive CSS that matches the existing site design:

**Key Style Features:**

- Fixed positioning for the search container in the header
- Smooth transitions for dropdown appearance
- Hover effects on search results
- Mobile-responsive design with appropriate breakpoints
- Z-index management to ensure dropdown appears above other content
- Loading spinner animation
- Touch-friendly sizing for mobile devices

**Color Scheme:**

- Primary color: `#667eea` (matching existing site theme)
- Background: `rgba(255, 255, 255, 0.98)` with backdrop blur
- Border: `rgba(102, 126, 234, 0.2)`
- Hover state: `rgba(102, 126, 234, 0.1)`

## Data Models

### Search Result Item

```javascript
{
    slug: string,           // Unique product identifier
    name: string,           // Product name
    price: number,          // Product price
    primary_image: string,  // Product image URL
    short_description: string, // Brief description (optional)
    is_in_stock: boolean    // Stock status
}
```

### Search State

```javascript
{
    query: string,          // Current search query
    results: Array,         // Array of search result items
    isLoading: boolean,     // Loading state
    error: string | null    // Error message if any
}
```

## Error Handling

### API Errors

1. **Network Failure**: Display "Unable to connect to server" message
2. **Server Error (5xx)**: Display "Search service temporarily unavailable"
3. **No Results**: Display "No products found for '{query}'"
4. **Timeout**: Implement 5-second timeout with retry option

### User Input Validation

1. **Minimum Characters**: Require at least 2 characters before triggering search
2. **Special Characters**: Properly encode search query to prevent injection
3. **Empty Input**: Clear results and hide dropdown when input is cleared

### Edge Cases

1. **Rapid Typing**: Debounce prevents excessive API calls
2. **Slow Network**: Show loading indicator for requests taking longer than 500ms
3. **Concurrent Requests**: Cancel previous request when new search is initiated
4. **Mobile Keyboard**: Ensure dropdown doesn't interfere with on-screen keyboard

## Testing Strategy

### Unit Tests

1. **Debounce Function**: Verify debounce delays function execution correctly
2. **Search Query Validation**: Test minimum character requirement
3. **API URL Construction**: Verify proper encoding of search parameters
4. **Result Rendering**: Test rendering with various data scenarios (empty, single, multiple results)

### Integration Tests

1. **API Integration**: Test successful product fetch from API
2. **Error Handling**: Test API failure scenarios
3. **Navigation**: Verify redirect to product detail page works correctly
4. **State Management**: Test search state updates correctly

### User Acceptance Tests

1. **Search Flow**: User can type query and see results
2. **Result Selection**: User can click result and navigate to product page
3. **Mobile Experience**: Search works on mobile devices with touch input
4. **Performance**: Search results appear within 1 second of typing
5. **Accessibility**: Search can be used with keyboard navigation

### Manual Testing Checklist

- [ ] Search input appears correctly on home page
- [ ] Search input appears correctly on products page
- [ ] Typing triggers search after 300ms delay
- [ ] Loading indicator appears during API request
- [ ] Results display with correct product information
- [ ] Clicking result navigates to correct product page
- [ ] Clicking outside dropdown closes it
- [ ] Clearing input hides dropdown
- [ ] Error message displays when API fails
- [ ] "No results" message displays when no products match
- [ ] Search works on mobile devices
- [ ] Search works on tablet devices
- [ ] Search works on desktop devices
- [ ] Search input is accessible via keyboard
- [ ] Search results can be navigated with arrow keys (optional enhancement)

## Performance Considerations

1. **Debouncing**: 300ms delay prevents excessive API calls
2. **Result Limiting**: Display maximum 8 results to keep dropdown manageable
3. **Image Optimization**: Use thumbnail images in search results
4. **Request Cancellation**: Cancel pending requests when new search is initiated
5. **Caching**: Consider implementing client-side cache for recent searches (future enhancement)

## Accessibility

1. **ARIA Labels**: Add appropriate ARIA labels to search input and results
2. **Keyboard Navigation**: Ensure search can be operated entirely with keyboard
3. **Screen Reader Support**: Announce search results count to screen readers
4. **Focus Management**: Maintain proper focus states throughout interaction
5. **Color Contrast**: Ensure text meets WCAG AA standards for contrast

## Mobile Responsiveness

1. **Touch Targets**: Minimum 44x44px touch targets for mobile
2. **Viewport Adaptation**: Search dropdown adjusts to screen width
3. **Keyboard Handling**: Proper handling of mobile on-screen keyboard
4. **Scroll Behavior**: Prevent body scroll when dropdown is open on mobile
5. **Orientation Changes**: Handle device orientation changes gracefully

## Future Enhancements

1. **Search History**: Store and display recent searches
2. **Search Suggestions**: Show popular searches or autocomplete suggestions
3. **Category Filtering**: Allow filtering search results by category
4. **Advanced Search**: Add filters for price range, stock status, etc.
5. **Search Analytics**: Track search queries for business insights
6. **Voice Search**: Implement voice input for search queries
7. **Keyboard Shortcuts**: Add keyboard shortcut (e.g., Ctrl+K) to focus search
