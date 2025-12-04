# Implementation Plan

- [ ] 1. Create AjaxCartAPI class for asynchronous backend communication
  - Implement core API client with fetch-based HTTP methods
  - Add authentication header injection using JWT tokens from localStorage
  - Implement timeout handling (10 second limit) with AbortController
  - Add retry logic with exponential backoff (3 attempts max)
  - Create offline request queueing system
  - Add network status monitoring with online/offline event listeners
  - _Requirements: 1.1, 5.1, 5.4, 7.1, 7.4_

- [ ] 2. Implement API methods for cart operations
  - [ ] 2.1 Create addToCart async method
    - Build POST request to /api/cart/add/ endpoint
    - Handle product_id and quantity parameters
    - Parse and return cart_item response data
    - _Requirements: 1.1, 1.4_

  - [ ] 2.2 Create updateQuantity async method
    - Build PUT request to /api/cart/update/ endpoint
    - Handle cart_item_id and quantity parameters
    - Validate quantity is positive integer
    - _Requirements: 2.1, 2.2, 2.4_

  - [ ] 2.3 Create removeItem async method
    - Build DELETE request to /api/cart/remove/ endpoint
    - Handle cart_item_id parameter
    - Return success confirmation
    - _Requirements: 3.2, 3.4_

  - [ ] 2.4 Create getCart async method
    - Build GET request to /api/cart/ endpoint
    - Parse full cart response with items array
    - Transform backend data to frontend cart format
    - _Requirements: 5.1, 8.1_

  - [ ] 2.5 Create clearCart async method
    - Build DELETE request to /api/cart/clear/ endpoint
    - Return success confirmation
    - _Requirements: 5.2_

  - [ ] 2.6 Create syncCart async method
    - Accept local cart array as parameter
    - Merge local cart with backend cart
    - Resolve conflicts (backend takes precedence)
    - Return merged cart data
    - _Requirements: 5.3, 5.5_

- [ ] 3. Enhance CartManager with async capabilities
  - [ ] 3.1 Initialize AjaxCartAPI instance in constructor
    - Create ajaxAPI property with new AjaxCartAPI instance
    - Add isAuthenticated property by checking localStorage token
    - Initialize pendingOperations Map for tracking in-flight requests
    - _Requirements: 5.1_

  - [ ] 3.2 Implement addToCartAsync method
    - Save current cart state for rollback
    - Apply optimistic update to UI immediately
    - Call ajaxAPI.addToCart with product data
    - On success: update cart with server response, show success notification
    - On error: rollback UI, show error notification with retry option
    - Update localStorage and broadcast to other tabs
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 7.7_

  - [ ] 3.3 Implement updateQuantityAsync method
    - Disable quantity buttons during operation
    - Save current quantity for rollback
    - Apply optimistic quantity update to UI
    - Call ajaxAPI.updateQuantity with cart_item_id and new quantity
    - On success: update totals with animation, re-enable buttons
    - On error: rollback quantity, show error, re-enable buttons
    - Handle quantity zero case with removal confirmation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.4, 4.5_

  - [ ] 3.4 Implement removeFromCartAsync method
    - Show confirmation dialog before removal
    - Display loading indicator on remove button
    - Call ajaxAPI.removeItem with cart_item_id
    - On success: animate item fade-out, remove from DOM, update totals
    - On error: show error notification with retry option
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.5 Implement syncWithBackend method
    - Check if user is authenticated
    - If authenticated: call ajaxAPI.getCart to fetch server cart
    - Compare server cart with localStorage cart
    - Merge carts if differences found
    - Update UI with merged cart
    - If not authenticated: skip sync
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.4_

  - [ ] 3.6 Implement mergeLocalWithBackend method
    - Load cart from localStorage
    - Call ajaxAPI.syncCart with local cart data
    - Receive merged cart from backend
    - Update localStorage with merged cart
    - Update UI to reflect merged cart
    - _Requirements: 5.3_

- [ ] 4. Create UI loading states and visual feedback
  - [ ] 4.1 Implement button loading state
    - Create showLoadingState method that disables button
    - Save original button HTML in data attribute
    - Replace button content with spinner icon
    - Create hideLoadingState method to restore original state
    - _Requirements: 1.2, 4.1_

  - [ ] 4.2 Implement skeleton loading screen
    - Create skeleton HTML template with pulsing gray boxes
    - Show skeleton when cart page first loads
    - Replace skeleton with actual cart items when data arrives
    - _Requirements: 8.2_

  - [ ] 4.3 Create NotificationManager class
    - Implement show method with message, type (success/error/warning/info), and duration
    - Create notification DOM element with appropriate styling
    - Auto-dismiss after specified duration (default 3s for success, 5s for errors)
    - Add dismiss button for manual closing
    - _Requirements: 1.4, 1.5, 4.2, 4.3_

  - [ ] 4.4 Add showNotificationWithRetry method
    - Extend NotificationManager to show retry button
    - Accept retry callback function
    - On retry click: dismiss notification and execute callback
    - _Requirements: 7.2, 7.7_

  - [ ] 4.5 Implement value change animations
    - Create animateValueChange method for cart totals
    - Add CSS pulse animation class to updated elements
    - Remove animation class after 300ms
    - Apply to quantity, item total, subtotal, and grand total
    - _Requirements: 4.5_

- [ ] 5. Implement optimistic update system
  - [ ] 5.1 Create saveOperationState method
    - Deep clone current cart array
    - Store in temporary state variable
    - Return state object for rollback
    - _Requirements: 7.7_

  - [ ] 5.2 Create applyOptimisticUpdate method
    - Accept operation type (add/update/remove) and data
    - Immediately update cart array in memory
    - Mark items with optimistic: true flag
    - Call renderCartItems to update UI
    - _Requirements: 7.7_

  - [ ] 5.3 Create rollbackOptimisticUpdate method
    - Accept previous state object
    - Restore cart array to previous state
    - Call renderCartItems to revert UI
    - _Requirements: 7.7_

  - [ ] 5.4 Create confirmUpdate method
    - Accept server response data
    - Update cart items with server-provided IDs
    - Remove optimistic flags
    - Update localStorage with confirmed data
    - _Requirements: 7.7_

- [ ] 6. Implement cross-tab synchronization
  - [ ] 6.1 Create TabSyncManager class
    - Initialize BroadcastChannel with 'cart_sync' name
    - Add storage event listener for localStorage changes
    - Add visibilitychange event listener for tab activation
    - Store reference to CartManager instance
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ] 6.2 Implement broadcast method
    - Accept action type and data payload
    - Send message through BroadcastChannel
    - Include timestamp in message
    - _Requirements: 6.1_

  - [ ] 6.3 Implement handleBroadcast method
    - Listen for messages on BroadcastChannel
    - Parse action type from message
    - Call appropriate CartManager method to update UI
    - Prevent infinite broadcast loops with timestamp checking
    - _Requirements: 6.2_

  - [ ] 6.4 Implement handleStorageChange method
    - Check if changed key is 'om_jagdamb_cart'
    - Load updated cart from localStorage
    - Call CartManager.updateCartUI to refresh display
    - _Requirements: 6.1, 6.2_

  - [ ] 6.5 Implement handleVisibilityChange method
    - Check if document is no longer hidden (tab became active)
    - Call CartManager.syncWithBackend to verify cart state
    - Update UI if server cart differs from local
    - _Requirements: 6.4_

  - [ ] 6.6 Add broadcast calls to cart operations
    - Call broadcast after successful add operation
    - Call broadcast after successful update operation
    - Call broadcast after successful remove operation
    - Call broadcast after successful clear operation
    - _Requirements: 6.1_

- [ ] 7. Implement error handling and retry logic
  - [ ] 7.1 Create handleError method in AjaxCartAPI
    - Parse error response from fetch
    - Categorize error type (network, timeout, HTTP status)
    - Extract error message from response body
    - Return structured error object
    - _Requirements: 7.1, 7.3_

  - [ ] 7.2 Implement retry logic with exponential backoff
    - Create retryRequest method accepting request function and max retries
    - Loop through retry attempts (default 3)
    - Calculate delay: 2^(attempt-1) * 1000ms (1s, 2s, 4s)
    - Wait for delay between attempts
    - Throw error if all retries exhausted
    - _Requirements: 7.4_

  - [ ] 7.3 Handle network errors
    - Detect navigator.onLine === false
    - Queue failed request in requestQueue array
    - Show "Offline - changes will sync later" notification
    - Add online event listener to process queue when connection restored
    - _Requirements: 5.4, 7.1_

  - [ ] 7.4 Handle timeout errors
    - Use AbortController with 10 second timeout
    - Cancel request if timeout exceeded
    - Trigger retry logic for timeout errors
    - Show timeout-specific error message
    - _Requirements: 7.4_

  - [ ] 7.5 Handle authentication errors (401)
    - Detect 401 status code
    - Save current cart to localStorage
    - Redirect to login page with return URL
    - Show "Please login to continue" message
    - _Requirements: 7.1_

  - [ ] 7.6 Handle validation errors (400)
    - Parse error message from response body
    - Show specific error message to user (e.g., "Insufficient stock")
    - Rollback optimistic update
    - Do not retry validation errors
    - _Requirements: 7.3, 7.7_

  - [ ] 7.7 Handle server errors (500)
    - Show generic "Something went wrong" message
    - Provide retry button in notification
    - Maintain local cart state
    - Log error details to console
    - _Requirements: 7.2_

- [ ] 8. Update cart.html event handlers
  - [ ] 8.1 Replace inline onclick handlers with event delegation
    - Remove onclick attributes from buttons
    - Add single event listener to cart-items-container
    - Use event.target to identify clicked button
    - Extract data attributes (action, index, cart_item_id)
    - _Requirements: 1.1, 2.1, 3.2_

  - [ ] 8.2 Update quantity button handlers
    - Detect increment/decrement button clicks
    - Call CartManager.updateQuantityAsync instead of synchronous method
    - Pass cart_item_id and new quantity
    - _Requirements: 2.1, 2.2_

  - [ ] 8.3 Update remove button handlers
    - Detect remove button clicks
    - Call CartManager.removeFromCartAsync instead of synchronous method
    - Pass cart_item_id
    - _Requirements: 3.2_

  - [ ] 8.4 Update page load initialization
    - Show skeleton loading state immediately
    - Call CartManager.syncWithBackend on page load
    - Replace skeleton with cart items when data loads
    - Handle empty cart state
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 9. Add CSS animations and transitions
  - Create fade-out animation for removed items (300ms)
  - Add pulse animation for updated values (300ms)
  - Create spinner animation for loading states
  - Add slide-in animation for notifications
  - Style notification types with appropriate colors
  - Add skeleton pulse animation for loading screens
  - _Requirements: 3.4, 4.1, 4.2, 4.5_

- [ ] 10. Implement request caching
  - [ ] 10.1 Create cache storage in AjaxCartAPI
    - Add cartCache object with data and timestamp properties
    - Set cache duration to 30 seconds
    - _Requirements: 8.5_

  - [ ] 10.2 Implement cache check in getCart method
    - Check if cache exists and is not expired
    - Return cached data if valid
    - Fetch from server if cache is stale or missing
    - _Requirements: 8.5_

  - [ ] 10.3 Invalidate cache on mutations
    - Clear cache after addToCart operation
    - Clear cache after updateQuantity operation
    - Clear cache after removeItem operation
    - Clear cache after clearCart operation
    - _Requirements: 8.5_

- [ ] 11. Add debouncing for quantity updates
  - Create debounce utility function with 500ms delay
  - Wrap updateQuantityAsync calls in debounce
  - Show loading state during debounce period
  - Cancel pending debounced calls if user makes another change
  - Batch multiple rapid changes into single API call
  - _Requirements: 2.1, 2.2_

- [ ] 12. Integrate with existing product pages
  - [ ] 12.1 Update product_webpage.html add-to-cart buttons
    - Replace synchronous addToCart calls with CartManager.addToCartAsync
    - Add loading state to buttons during operation
    - Show success notification on successful add
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 12.2 Update product_detail.html add-to-cart button
    - Replace synchronous addToCart calls with CartManager.addToCartAsync
    - Add loading state to button during operation
    - Show success notification on successful add
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 13. Handle authentication state changes
  - Add event listener for login/logout events
  - On login: call mergeLocalWithBackend to sync carts
  - On logout: clear backend cart reference, keep localStorage cart
  - Update isAuthenticated flag when auth state changes
  - _Requirements: 5.1, 5.3_

- [ ] 14. Add offline queue processing
  - Create processQueue method in AjaxCartAPI
  - Add online event listener to trigger queue processing
  - Process queued requests sequentially when connection restored
  - Show notification when queue processing starts
  - Show notification when queue processing completes
  - Handle failures during queue processing
  - _Requirements: 5.4, 5.5, 7.1_

- [ ] 15. Update cart badge across all pages
  - Ensure cart badge updates after every cart operation
  - Use broadcast channel to update badges in other tabs
  - Animate badge when count changes
  - Hide badge when cart is empty
  - _Requirements: 1.3, 6.1, 6.2_

- [ ] 16. Add empty cart state handling
  - Show empty cart message when cart has no items
  - Display "Continue Shopping" button in empty state
  - Hide checkout button when cart is empty
  - Show empty state after last item is removed
  - _Requirements: 8.4_

- [ ] 17. Create comprehensive error logging
  - Log all API errors to console with full details
  - Include request parameters in error logs
  - Log retry attempts and outcomes
  - Add timestamp to all log entries
  - Create error reporting utility for production monitoring
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 18. Add performance monitoring
  - Measure and log API response times
  - Track time from user action to UI update
  - Monitor animation frame rates
  - Log cache hit/miss rates
  - Create performance dashboard for development
  - _Requirements: 4.1, 8.1, 8.3_

- [ ] 19. Write unit tests for AjaxCartAPI
  - Test successful API calls with mocked fetch responses
  - Test error handling for network errors
  - Test error handling for HTTP errors (400, 401, 500)
  - Test retry logic with failing requests
  - Test timeout handling
  - Test request queueing when offline
  - Test authentication header injection
  - _Requirements: All_

- [ ] 20. Write unit tests for CartManager async methods
  - Test addToCartAsync with successful response
  - Test addToCartAsync with error response and rollback
  - Test updateQuantityAsync with various quantities
  - Test removeFromCartAsync with confirmation
  - Test syncWithBackend for authenticated users
  - Test mergeLocalWithBackend with conflicting data
  - _Requirements: All_

- [ ] 21. Write integration tests
  - Test complete add-to-cart flow from button click to UI update
  - Test quantity update flow with backend sync
  - Test remove item flow with animation
  - Test offline mode with queue and sync
  - Test cross-tab synchronization
  - Test authentication flow with cart merge
  - _Requirements: All_
