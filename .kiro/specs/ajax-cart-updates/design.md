# Design Document: AJAX Cart Updates

## Overview

This design document outlines the implementation of AJAX-based asynchronous cart operations for the Om Jagdamb Tools e-commerce platform. The solution will enhance the existing cart system by eliminating page reloads, providing instant visual feedback, and maintaining seamless synchronization between the frontend (localStorage) and backend (Django REST API).

The design leverages the existing `CartManager` class and Django cart API endpoints, extending them with asynchronous capabilities, optimistic UI updates, error handling, and cross-tab synchronization.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Environment                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐    ┌─────────────┐ │
│  │  cart.html   │◄────►│ CartManager  │◄──►│ localStorage│ │
│  │  (UI Layer)  │      │   (Logic)    │    │             │ │
│  └──────────────┘      └──────┬───────┘    └─────────────┘ │
│                               │                              │
│                               │ AJAX Requests                │
│                               ▼                              │
│                      ┌─────────────────┐                     │
│                      │  AjaxCartAPI    │                     │
│                      │  (API Client)   │                     │
│                      └────────┬────────┘                     │
└───────────────────────────────┼──────────────────────────────┘
                                │
                                │ HTTP/JSON
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Django Backend (8000)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐    ┌─────────────┐ │
│  │ Cart Views   │◄────►│ Cart Models  │◄──►│  PostgreSQL │ │
│  │ (REST API)   │      │              │    │  / SQLite   │ │
│  └──────────────┘      └──────────────┘    └─────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **User Action** → UI Event (click add/remove/update)
2. **CartManager** → Optimistic UI Update (instant feedback)
3. **AjaxCartAPI** → Async HTTP Request to Django
4. **Django Backend** → Process & Validate Request
5. **Response Handler** → Update UI with server response
6. **Error Handler** → Rollback on failure + show error
7. **Storage Event** → Sync across browser tabs

## Components and Interfaces

### 1. AjaxCartAPI Class

A new dedicated API client for handling all asynchronous cart operations.

```javascript
class AjaxCartAPI {
    constructor(baseURL = 'http://127.0.0.1:8000/api') {
        this.baseURL = baseURL;
        this.timeout = 10000; // 10 seconds
        this.requestQueue = [];
        this.isOnline = navigator.onLine;
        this.initNetworkMonitoring();
    }

    // Core Methods
    async addToCart(productId, quantity)
    async updateQuantity(cartItemId, quantity)
    async removeItem(cartItemId)
    async getCart()
    async clearCart()
    async syncCart(localCart)

    // Helper Methods
    getAuthHeaders()
    handleResponse(response)
    handleError(error)
    retryRequest(requestFn, maxRetries = 3)
    queueOfflineRequest(request)
    processQueue()
}
```

**Key Features:**
- Automatic authentication header injection
- Request timeout handling (10s)
- Retry logic with exponential backoff
- Offline request queueing
- Network status monitoring

### 2. Enhanced CartManager Class

Extend the existing `CartManager` to support AJAX operations while maintaining backward compatibility.

```javascript
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.listeners = [];
        this.ajaxAPI = new AjaxCartAPI();
        this.isAuthenticated = this.checkAuth();
        this.pendingOperations = new Map();
        this.init();
    }

    // New AJAX Methods
    async addToCartAsync(product, quantity)
    async updateQuantityAsync(productId, newQuantity)
    async removeFromCartAsync(productId)
    async syncWithBackend()
    async mergeLocalWithBackend()

    // Enhanced UI Methods
    showLoadingState(element)
    hideLoadingState(element)
    animateValueChange(element, newValue)
    showNotificationWithRetry(message, retryFn)

    // Optimistic Update Methods
    applyOptimisticUpdate(operation, data)
    rollbackOptimisticUpdate(operation, previousState)
    saveOperationState(operation)
}
```

**Key Enhancements:**
- Async/await pattern for all cart operations
- Optimistic UI updates with rollback capability
- Operation state tracking for error recovery
- Enhanced visual feedback system

### 3. UI Components

#### Loading States

```javascript
const LoadingStates = {
    button: (button) => {
        button.disabled = true;
        button.dataset.originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    },
    
    skeleton: () => {
        return `
            <div class="animate-pulse">
                <div class="h-24 bg-gray-200 rounded mb-4"></div>
                <div class="h-24 bg-gray-200 rounded mb-4"></div>
            </div>
        `;
    },
    
    overlay: (container) => {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        container.appendChild(overlay);
    }
};
```

#### Notification System

```javascript
class NotificationManager {
    show(message, type, options = {}) {
        // type: 'success', 'error', 'warning', 'info'
        // options: { duration, showRetry, onRetry }
    }
    
    showWithRetry(message, retryFn) {
        // Shows error with retry button
    }
    
    dismiss(notificationId) {
        // Manually dismiss notification
    }
}
```

### 4. Cross-Tab Synchronization

```javascript
class TabSyncManager {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.channel = new BroadcastChannel('cart_sync');
        this.init();
    }

    init() {
        // Listen for storage events
        window.addEventListener('storage', this.handleStorageChange);
        
        // Listen for broadcast messages
        this.channel.onmessage = this.handleBroadcast;
        
        // Listen for visibility changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    broadcast(action, data) {
        this.channel.postMessage({ action, data, timestamp: Date.now() });
    }

    handleStorageChange(event) {
        if (event.key === 'om_jagdamb_cart') {
            this.cartManager.loadCart();
            this.cartManager.updateCartUI();
        }
    }

    handleVisibilityChange() {
        if (!document.hidden) {
            // Tab became active - verify cart state
            this.cartManager.syncWithBackend();
        }
    }
}
```

## Data Models

### Frontend Cart Item Structure

```javascript
{
    id: number,              // Product ID
    cartItemId: number,      // Backend CartItem ID (null if not synced)
    slug: string,
    name: string,
    price: number,
    image: string,
    quantity: number,
    addedAt: string,         // ISO timestamp
    syncStatus: string,      // 'synced', 'pending', 'error'
    optimistic: boolean      // True if awaiting server confirmation
}
```

### API Request/Response Formats

#### Add to Cart Request
```json
POST /api/cart/add/
{
    "product_id": 123,
    "quantity": 2
}
```

#### Add to Cart Response
```json
{
    "message": "Item added to cart",
    "cart_item": {
        "id": 456,
        "product": {
            "id": 123,
            "name": "Hydraulic Riveter",
            "price": "2500.00",
            "image": "/media/products/riveter.jpg"
        },
        "quantity": 2,
        "unit_price": "2500.00",
        "total_price": "5000.00"
    }
}
```

#### Update Quantity Request
```json
PUT /api/cart/update/
{
    "cart_item_id": 456,
    "quantity": 3
}
```

#### Remove Item Request
```json
DELETE /api/cart/remove/
{
    "cart_item_id": 456
}
```

#### Get Cart Response
```json
{
    "id": 789,
    "user": 1,
    "items": [
        {
            "id": 456,
            "product": {...},
            "quantity": 2,
            "total_price": "5000.00"
        }
    ],
    "total_items": 2,
    "total_amount": "5000.00",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:45:00Z"
}
```

## Error Handling

### Error Types and Responses

| Error Type | HTTP Status | Frontend Action |
|------------|-------------|-----------------|
| Network Error | N/A | Queue request, show offline notification |
| Timeout | N/A | Retry with exponential backoff |
| Unauthorized | 401 | Redirect to login, preserve cart in localStorage |
| Insufficient Stock | 400 | Show error, revert quantity |
| Item Not Found | 404 | Remove from UI, sync cart |
| Server Error | 500 | Show retry option, maintain local state |
| Validation Error | 400 | Show specific error message |

### Error Handling Flow

```javascript
async function handleCartOperation(operation, rollbackFn) {
    try {
        // 1. Apply optimistic update
        const previousState = this.saveOperationState();
        this.applyOptimisticUpdate(operation);
        
        // 2. Execute API call
        const response = await this.ajaxAPI[operation.method](...operation.args);
        
        // 3. Confirm update with server data
        this.confirmUpdate(response);
        this.showNotification('Success!', 'success');
        
    } catch (error) {
        // 4. Rollback on error
        this.rollbackOptimisticUpdate(previousState);
        
        // 5. Handle specific error types
        if (error.type === 'NetworkError') {
            this.queueOperation(operation);
            this.showNotification('Offline - changes will sync later', 'warning');
        } else if (error.status === 400) {
            this.showNotification(error.message, 'error');
        } else {
            this.showNotificationWithRetry(
                'Operation failed. Try again?',
                () => this.handleCartOperation(operation, rollbackFn)
            );
        }
    }
}
```

### Retry Strategy

```javascript
async retryRequest(requestFn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            if (attempt === maxRetries) throw error;
            
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
```

## Testing Strategy

### Unit Tests

1. **AjaxCartAPI Tests**
   - Test successful API calls with mocked responses
   - Test error handling for each error type
   - Test retry logic with failing requests
   - Test request queueing when offline
   - Test authentication header injection

2. **CartManager Tests**
   - Test optimistic updates and rollbacks
   - Test cart synchronization logic
   - Test localStorage operations
   - Test event listener registration
   - Test notification triggering

3. **TabSyncManager Tests**
   - Test broadcast message handling
   - Test storage event handling
   - Test visibility change handling

### Integration Tests

1. **End-to-End Cart Operations**
   - Add item → verify UI update → verify backend sync
   - Update quantity → verify calculations → verify backend
   - Remove item → verify animation → verify backend
   - Clear cart → verify empty state → verify backend

2. **Error Scenarios**
   - Simulate network failure → verify queue → restore network → verify sync
   - Simulate 400 error → verify rollback → verify error message
   - Simulate timeout → verify retry → verify success

3. **Cross-Tab Scenarios**
   - Add item in Tab A → verify update in Tab B
   - Update quantity in Tab B → verify update in Tab A
   - Clear cart in Tab A → verify empty state in Tab B

### Manual Testing Checklist

- [ ] Add to cart from product page
- [ ] Update quantities on cart page
- [ ] Remove items from cart
- [ ] Clear entire cart
- [ ] Test with slow network (throttling)
- [ ] Test offline mode
- [ ] Test with multiple tabs open
- [ ] Test authentication flow
- [ ] Test error notifications
- [ ] Test retry functionality
- [ ] Test loading states
- [ ] Test animations

## Performance Considerations

### Optimization Strategies

1. **Debouncing Quantity Updates**
   - Debounce rapid quantity changes (500ms)
   - Batch multiple updates into single API call
   - Show loading state during debounce period

2. **Request Caching**
   - Cache GET cart responses for 30 seconds
   - Invalidate cache on mutations
   - Use ETag headers for conditional requests

3. **Lazy Loading**
   - Load cart data only when cart page is accessed
   - Use skeleton screens during initial load
   - Prefetch cart data on hover over cart icon

4. **Optimistic Updates**
   - Update UI immediately before API call
   - Reduces perceived latency
   - Rollback only on error

### Performance Metrics

- **Target Metrics:**
  - Time to interactive: < 200ms
  - API response time: < 500ms
  - UI update time: < 100ms
  - Animation frame rate: 60fps

## Security Considerations

1. **Authentication**
   - Include JWT token in Authorization header
   - Handle 401 responses by redirecting to login
   - Preserve cart in localStorage during re-authentication

2. **Input Validation**
   - Validate quantity values (min: 1, max: stock)
   - Sanitize product IDs before API calls
   - Validate cart item IDs

3. **CSRF Protection**
   - Include CSRF token for state-changing requests
   - Use Django's CSRF middleware

4. **XSS Prevention**
   - Sanitize all user-generated content
   - Use textContent instead of innerHTML where possible
   - Escape HTML in notification messages

## Migration Strategy

### Phase 1: Add AJAX Layer (Non-Breaking)
- Create `AjaxCartAPI` class
- Add async methods to `CartManager`
- Keep existing synchronous methods functional
- Add feature flag to toggle AJAX mode

### Phase 2: Update UI Components
- Add loading states to buttons
- Implement notification system
- Add animations for cart updates
- Update event handlers to use async methods

### Phase 3: Enable Cross-Tab Sync
- Implement `TabSyncManager`
- Add broadcast channel support
- Test multi-tab scenarios

### Phase 4: Cleanup
- Remove synchronous fallbacks
- Remove feature flags
- Update documentation

## Backward Compatibility

- Maintain existing `addToCart()`, `removeFromCart()` functions
- Detect if backend is available, fallback to localStorage-only mode
- Support both authenticated and guest users
- Graceful degradation if JavaScript is disabled (form-based fallback)

## Dependencies

### Existing Dependencies
- Tailwind CSS (UI styling)
- Font Awesome (icons)
- Django REST Framework (backend API)

### New Dependencies
- None (pure vanilla JavaScript implementation)

### Browser Compatibility
- Modern browsers with ES6+ support
- Fetch API support (or polyfill for older browsers)
- LocalStorage support
- BroadcastChannel API (with fallback to storage events)

## Deployment Considerations

1. **Backend Changes**
   - No changes required to existing Django endpoints
   - Ensure CORS is configured for frontend domain
   - Verify authentication middleware is active

2. **Frontend Changes**
   - Deploy new `AjaxCartAPI` class
   - Update `CartManager` with async methods
   - Update cart.html with new event handlers
   - Add CSS for loading states and animations

3. **Testing in Production**
   - Enable feature flag for gradual rollout
   - Monitor error rates and API response times
   - Collect user feedback
   - A/B test performance improvements

## Future Enhancements

1. **Real-time Updates via WebSockets**
   - Push cart updates from server
   - Notify users of stock changes
   - Show when other users add items (for shared carts)

2. **Advanced Caching**
   - Service Worker for offline support
   - IndexedDB for larger cart data
   - Background sync for queued operations

3. **Analytics Integration**
   - Track cart abandonment rates
   - Monitor API performance
   - Analyze user interaction patterns

4. **Progressive Enhancement**
   - Add optimistic locking for concurrent updates
   - Implement conflict resolution strategies
   - Add undo/redo functionality
