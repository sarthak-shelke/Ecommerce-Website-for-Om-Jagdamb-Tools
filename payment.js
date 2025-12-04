/**
 * Payment Page JavaScript
 * Handles order creation, payment processing, and backend integration
 */

// Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Global state
let orderSummary = null;
let cart = [];
let selectedPaymentMethod = 'cod';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment page loaded');
    
    // Check authentication
    if (!isUserAuthenticated()) {
        alert('Please login to continue with checkout');
        window.location.href = 'login.html';
        return;
    }
    
    // Load order data
    loadOrderData();
    
    // Load user info
    loadUserInfo();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load saved addresses if available
    loadSavedAddresses();
});

// Check if user is authenticated
function isUserAuthenticated() {
    const isUser = localStorage.getItem('isUser');
    const userEmail = localStorage.getItem('userEmail');
    const isAdmin = localStorage.getItem('isAdmin');
    const token = localStorage.getItem('token');
    
    return (isUser === 'true' && userEmail) || (isAdmin === 'true') || token;
}

// Get authentication headers
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };
    
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// Load order data from localStorage
function loadOrderData() {
    // Load order summary
    const orderSummaryStr = localStorage.getItem('orderSummary');
    if (orderSummaryStr) {
        orderSummary = JSON.parse(orderSummaryStr);
        console.log('Order summary loaded:', orderSummary);
    }
    
    // Load cart
    const cartStr = localStorage.getItem('cart') || localStorage.getItem('om_jagdamb_cart');
    if (cartStr) {
        cart = JSON.parse(cartStr);
        console.log('Cart loaded:', cart.length, 'items');
    }
    
    // If no order data, redirect to cart
    if (!orderSummary && cart.length === 0) {
        alert('No items in cart. Please add items before checkout.');
        window.location.href = 'cart.html';
        return;
    }
    
    // If we have cart but no order summary, calculate it
    if (!orderSummary && cart.length > 0) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 50;
        orderSummary = {
            items: cart,
            subtotal: subtotal,
            shipping: shipping,
            total: subtotal + shipping,
            timestamp: new Date().toISOString()
        };
    }
    
    // Display order summary
    displayOrderSummary();
}

// Display order summary
function displayOrderSummary() {
    const orderItemsContainer = document.getElementById('order-items');
    const subtotalEl = document.getElementById('order-subtotal');
    const shippingEl = document.getElementById('order-shipping');
    const totalEl = document.getElementById('order-total');
    
    // Clear existing items
    orderItemsContainer.innerHTML = '';
    
    // Display each item
    orderSummary.items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'flex items-center space-x-3 pb-3 border-b';
        itemEl.innerHTML = `
            <img src="${item.image || 'https://placehold.co/60x60/e2e8f0/334155?text=Product'}" 
                 alt="${item.name}" 
                 class="w-16 h-16 object-cover rounded">
            <div class="flex-1">
                <h4 class="font-medium text-gray-900 text-sm">${item.name}</h4>
                <p class="text-xs text-gray-500">Qty: ${item.quantity}</p>
            </div>
            <div class="text-right">
                <p class="font-semibold text-gray-900">₹${(item.price * item.quantity).toFixed(2)}</p>
                <p class="text-xs text-gray-500">₹${item.price.toFixed(2)} each</p>
            </div>
        `;
        orderItemsContainer.appendChild(itemEl);
    });
    
    // Update totals
    subtotalEl.textContent = `₹${orderSummary.subtotal.toFixed(2)}`;
    shippingEl.textContent = orderSummary.shipping === 0 ? 'Free' : `₹${orderSummary.shipping.toFixed(2)}`;
    totalEl.textContent = `₹${orderSummary.total.toFixed(2)}`;
    
    // Update cart badge
    updateCartBadge();
}

// Update cart badge
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Load user info
function loadUserInfo() {
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('adminEmail');
    const userEmailEl = document.getElementById('user-email');
    
    if (userEmailEl && userEmail) {
        userEmailEl.textContent = userEmail;
    }
}

// Load saved addresses (if backend integration is available)
async function loadSavedAddresses() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/addresses/`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const addresses = await response.json();
            if (addresses.length > 0) {
                // Pre-fill form with default address
                const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
                prefillAddress(defaultAddress);
            }
        }
    } catch (error) {
        console.log('Could not load saved addresses:', error);
        // Not critical, user can enter manually
    }
}

// Prefill address form
function prefillAddress(address) {
    document.getElementById('fullName').value = address.full_name || '';
    document.getElementById('phone').value = address.phone || '';
    document.getElementById('address').value = address.address_line1 || '';
    document.getElementById('city').value = address.city || '';
    document.getElementById('state').value = address.state || '';
    document.getElementById('pincode').value = address.pincode || '';
}

// Setup event listeners
function setupEventListeners() {
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove selected class from all
            paymentMethods.forEach(m => m.classList.remove('selected'));
            // Add selected class to clicked
            this.classList.add('selected');
            // Check the radio button
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                selectedPaymentMethod = radio.value;
                togglePaymentDetails(selectedPaymentMethod);
            }
        });
    });
    
    // Terms checkbox
    const termsCheckbox = document.getElementById('termsAccepted');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    termsCheckbox.addEventListener('change', function() {
        placeOrderBtn.disabled = !this.checked;
    });
    
    // Place order button
    placeOrderBtn.addEventListener('click', handlePlaceOrder);
    
    // Form validation on input
    setupFormValidation();
}

// Toggle payment details based on selected method
function togglePaymentDetails(method) {
    // Hide all payment details
    document.getElementById('upi-details').classList.add('hidden');
    document.getElementById('card-details').classList.add('hidden');
    
    // Show relevant details
    if (method === 'upi') {
        document.getElementById('upi-details').classList.remove('hidden');
    } else if (method === 'card') {
        document.getElementById('card-details').classList.remove('hidden');
    }
}

// Setup form validation
function setupFormValidation() {
    const requiredFields = [
        'fullName', 'phone', 'address', 'city', 'state', 'pincode'
    ];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', function() {
                validateField(this);
            });
        }
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.id;
    let isValid = true;
    let errorMessage = '';
    
    if (!value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else {
        // Specific validations
        switch(fieldName) {
            case 'phone':
                if (!/^[6-9]\d{9}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid 10-digit phone number';
                }
                break;
            case 'pincode':
                if (!/^\d{6}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid 6-digit pincode';
                }
                break;
        }
    }
    
    // Show/hide error
    const errorEl = document.getElementById(`${fieldName}-error`);
    if (errorEl) {
        if (isValid) {
            field.classList.remove('error');
            errorEl.textContent = '';
        } else {
            field.classList.add('error');
            errorEl.textContent = errorMessage;
        }
    }
    
    return isValid;
}

// Validate entire form
function validateForm() {
    const requiredFields = [
        'fullName', 'phone', 'address', 'city', 'state', 'pincode'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    
    // Validate payment method specific fields
    if (selectedPaymentMethod === 'upi') {
        const upiId = document.getElementById('upiId');
        if (upiId && !upiId.value.trim()) {
            isValid = false;
            const errorEl = document.getElementById('upiId-error');
            if (errorEl) {
                errorEl.textContent = 'Please enter your UPI ID';
            }
        }
    } else if (selectedPaymentMethod === 'card') {
        const cardFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
        cardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                isValid = false;
            }
        });
    }
    
    return isValid;
}

// Handle place order
async function handlePlaceOrder(e) {
    e.preventDefault();
    
    console.log('Place order clicked');
    
    // Validate form
    if (!validateForm()) {
        alert('Please fill in all required fields correctly');
        return;
    }
    
    // Show loading overlay
    showLoading(true);
    
    try {
        // Prepare order data
        const orderData = prepareOrderData();
        
        console.log('Sending order to backend:', orderData);
        
        // Send to backend
        const response = await fetch(`${API_BASE_URL}/orders/create/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create order');
        }
        
        const result = await response.json();
        console.log('Order created successfully:', result);
        
        // Clear cart
        localStorage.removeItem('cart');
        localStorage.removeItem('om_jagdamb_cart');
        localStorage.removeItem('orderSummary');
        
        // Show success and redirect
        showLoading(false);
        alert(`Order placed successfully!\nOrder ID: ${result.order_number}\n\nYou will receive a confirmation email shortly.`);
        
        // Redirect to order confirmation or orders page
        window.location.href = `order-confirmation.html?orderId=${result.order_id}`;
        
    } catch (error) {
        console.error('Error placing order:', error);
        showLoading(false);
        alert(`Failed to place order: ${error.message}\n\nPlease try again or contact support.`);
    }
}

// Prepare order data for backend
function prepareOrderData() {
    return {
        // Order items
        items: orderSummary.items.map(item => ({
            product_id: item.id,
            product_name: item.name,
            product_sku: item.slug || `PROD-${item.id}`,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
        })),
        
        // Pricing
        subtotal: orderSummary.subtotal,
        shipping_cost: orderSummary.shipping,
        tax_amount: 0, // Calculate if needed
        discount_amount: 0, // Apply if coupon used
        total_amount: orderSummary.total,
        
        // Shipping address
        shipping_address: {
            full_name: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address_line1: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            state: document.getElementById('state').value.trim(),
            pincode: document.getElementById('pincode').value.trim(),
            country: 'India'
        },
        
        // Billing address (same as shipping for now)
        billing_address: {
            full_name: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address_line1: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            state: document.getElementById('state').value.trim(),
            pincode: document.getElementById('pincode').value.trim(),
            country: 'India'
        },
        
        // Payment details
        payment_method: selectedPaymentMethod,
        payment_details: getPaymentDetails(),
        
        // Additional info
        notes: '',
        user_email: localStorage.getItem('userEmail') || localStorage.getItem('adminEmail')
    };
}

// Get payment details based on selected method
function getPaymentDetails() {
    const details = {
        method: selectedPaymentMethod
    };
    
    if (selectedPaymentMethod === 'upi') {
        details.upi_id = document.getElementById('upiId').value.trim();
    } else if (selectedPaymentMethod === 'card') {
        details.card_number = document.getElementById('cardNumber').value.trim();
        details.expiry_date = document.getElementById('expiryDate').value.trim();
        details.cardholder_name = document.getElementById('cardholderName').value.trim();
        // Note: Never send CVV to backend in production
    }
    
    return details;
}

// Show/hide loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.toggle('hidden', !show);
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isUserAuthenticated,
        validateField,
        validateForm,
        prepareOrderData
    };
}
