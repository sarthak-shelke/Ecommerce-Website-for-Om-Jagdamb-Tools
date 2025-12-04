// Simple test to verify cart logic
const testProduct = {
    id: 1,
    slug: 'test-product',
    name: 'Test Product',
    price: 99.99,
    image: 'https://placehold.co/150x150',
    description: 'Test product'
};

// Simulate localStorage
const storage = {};
const localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => { storage[key] = value; },
    removeItem: (key) => { delete storage[key]; }
};

// Test adding to cart
console.log('=== Test 1: Add to cart ===');
let cart = [];
cart.push({
    id: testProduct.id,
    slug: testProduct.slug,
    name: testProduct.name,
    price: parseFloat(testProduct.price),
    image: testProduct.image,
    description: testProduct.description,
    quantity: 2
});

console.log('Cart after add:', JSON.stringify(cart, null, 2));
localStorage.setItem('cart', JSON.stringify(cart));
console.log('localStorage cart:', localStorage.getItem('cart'));

// Test loading from localStorage
console.log('\n=== Test 2: Load from localStorage ===');
const loadedCart = JSON.parse(localStorage.getItem('cart') || '[]');
console.log('Loaded cart:', JSON.stringify(loadedCart, null, 2));
console.log('Cart length:', loadedCart.length);

// Test if cart is empty
if (loadedCart.length === 0) {
    console.log('ERROR: Cart is empty!');
} else {
    console.log('SUCCESS: Cart has', loadedCart.length, 'items');
}

console.log('\n=== Test Complete ===');
