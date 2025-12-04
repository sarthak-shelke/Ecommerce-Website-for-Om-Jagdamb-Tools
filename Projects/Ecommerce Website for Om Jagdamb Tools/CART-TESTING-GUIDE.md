# Cart Testing Guide

## Quick Test Steps

### 1. Test Cart Manually (Fastest Way)

Open browser console (F12) on ANY page and run:

```javascript
// Clear existing cart
localStorage.clear();

// Add a test product
const testProduct = {
    id: 1,
    slug: 'test-product',
    name: 'Test Product',
    price: 99.99,
    image: 'https://placehold.co/150x150/e2e8f0/334155?text=Product',
    description: 'This is a test product',
    quantity: 2
};

localStorage.setItem('cart', JSON.stringify([testProduct]));
localStorage.setItem('om_jagdamb_cart', JSON.stringify([testProduct]));

console.log('✅ Test product added to cart');
console.log('Cart:', localStorage.getItem('cart'));

// Now go to cart.html
alert('Test product added! Now go to cart.html');
```

### 2. Test Adding from Product Page

1. Go to: `product_detail.html?slug=any-product-slug`
2. Open console (F12)
3. Set quantity (e.g., 3)
4. Click "Add to Cart"
5. Look for console logs:
   ```
   === ADD TO CART DEBUG ===
   Product: {id: X, name: "...", ...}
   cartAPI available? true
   Using cartAPI.addToCart
   === cartAPI.addToCart called ===
   Cart after add: [{...}]
   Saving cart to localStorage: 1 items
   Cart saved successfully
   ```
6. Go to cart.html

### 3. Test Cart Page

1. Open cart.html
2. Open console (F12)
3. Look for these logs:
   ```
   === CART PAGE LOADING ===
   === initializeCart START ===
   localStorage cart: "[{...}]"
   Cart loaded: 1 items
   Cart contents: [{id: 1, name: "...", ...}]
   === initializeCart END ===
   Final cart for rendering: [{...}]
   === CART PAGE LOADED ===
   Cart items: 1
   ```

### 4. Test Cart Operations

On cart.html:

**Test Quantity Increase:**
- Click + button
- Check console for: "Cart after quantity update: [{...}]"
- Check Order Summary updates

**Test Quantity Decrease:**
- Click - button
- Check console for: "Cart after quantity update: [{...}]"
- Check Order Summary updates

**Test Remove Item:**
- Click trash icon
- Confirm removal
- Check console for: "Cart after add: []"
- Page should show "Your cart is empty"

## Troubleshooting

### Problem: Cart page shows empty

**Check Console For:**
```
localStorage cart: null
```

**Solution:**
Nothing was saved. Add product again or use manual test above.

---

**Check Console For:**
```
cartAPI not loaded!
```

**Solution:**
Scripts not loading. Check if cart-api.js exists and loads without errors.

---

**Check Console For:**
```
Cart loaded: 0 items
```

**Solution:**
localStorage is empty. Run manual test above.

### Problem: Product not adding to cart

**Check Console For:**
```
cartAPI available? false
```

**Solution:**
cart-api.js not loaded on product page. Check script tags.

---

**Check Console For:**
```
Error adding to cart: ...
```

**Solution:**
Check the error message. Might be missing product data.

### Problem: Order Summary not updating

**Check Console For:**
```
=== updateCartSummary called ===
Elements found: {subtotalEl: false, ...}
```

**Solution:**
HTML elements missing. Check if IDs exist: cart-subtotal, cart-shipping, cart-total

## Debug Commands

Run these in browser console:

```javascript
// Check if cartAPI exists
console.log('cartAPI:', typeof cartAPI);
console.log('cartAPI.cart:', cartAPI?.cart);

// Check localStorage
console.log('cart:', localStorage.getItem('cart'));
console.log('om_jagdamb_cart:', localStorage.getItem('om_jagdamb_cart'));

// Check cart count
console.log('Cart items:', cartAPI?.cart?.length || 0);

// Force reload cart
if (typeof initializeCart === 'function') {
    initializeCart().then(() => {
        renderCartItems();
        console.log('Cart reloaded');
    });
}

// Clear cart
localStorage.removeItem('cart');
localStorage.removeItem('om_jagdamb_cart');
location.reload();
```

## Expected Behavior

✅ Products added from product page appear in cart
✅ Quantity selector works (1-99 or stock limit)
✅ Cart badge shows correct count
✅ Cart page displays all items with images
✅ Quantity +/- buttons work
✅ Remove button works with confirmation
✅ Order Summary updates in real-time
✅ Cart persists across page reloads
✅ Extensive console logging for debugging

## Files Involved

- `cart-api.js` - Cart API client with backend sync
- `cart-ui.js` - Cart UI components and badge updates
- `auth-helper.js` - Authentication helpers
- `cart.html` - Cart page with rendering logic
- `product_detail.html` - Product page with add to cart
- `test-cart.html` - Standalone test page

## Test Pages

1. **test-cart.html** - Simple test interface
   - Click "Add Test Product"
   - Click "View Cart"
   - Click "Check localStorage"

2. **cart.html** - Main cart page
   - Should display all cart items
   - Should allow quantity changes
   - Should allow item removal

3. **product_detail.html** - Product detail page
   - Should have quantity selector
   - Should have "Add to Cart" button
   - Should show success message

## Success Criteria

When everything works:
1. Add product from product page → Success message appears
2. Go to cart page → Product appears with correct quantity
3. Change quantity → Order Summary updates immediately
4. Remove item → Cart shows empty state
5. All console logs show successful operations
6. No errors in console

If any step fails, check the console logs and refer to troubleshooting section above.
