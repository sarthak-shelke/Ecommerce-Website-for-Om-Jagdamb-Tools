<<<<<<< HEAD
/**
 * Admin Dashboard JavaScript
 * Handles admin panel functionality for Om Jagdamb Tools
 */

// Global variables
let currentProducts = [];
let currentSection = 'dashboard';

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateStats();
    showSection('dashboard');
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Form submission handler
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Modal close handlers
    const modal = document.getElementById('add-product-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAddProductModal();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAddProductModal();
        }
    });
}

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-content').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionName + '-section');
    if (section) {
        section.style.display = 'block';
    }
    
    // Add active class to current nav item
    const navItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    currentSection = sectionName;
    
    // Load section-specific data
    if (sectionName === 'products') {
        loadProductsTable();
    }
}

// Load products from script.js
function loadProducts() {
    // Check if sampleProducts is available from script.js
    if (typeof sampleProducts !== 'undefined') {
        currentProducts = [...sampleProducts];
    } else {
        // Fallback products if script.js is not loaded
        currentProducts = [
            {
                id: 1,
                name: "Manual Riveter",
                image: "images/016-manual-riveter-250x250.webp",
                price: 899,
                category: "hand-tools",
                description: "Heavy-duty manual riveter",
                stock: 25,
                featured: true
            },
            {
                id: 2,
                name: "Pneumatic Screwdriver",
                image: "images/pneumatic-screwdriver-pistol-250x250.webp",
                price: 2499,
                category: "power-tools",
                description: "High-power pneumatic screwdriver",
                stock: 15,
                featured: true
            }
        ];
    }
}

// Update dashboard statistics
function updateStats() {
    try {
        const totalProducts = currentProducts.length;
        const activeProducts = currentProducts.filter(p => p.stock > 0).length;
        const featuredProducts = currentProducts.filter(p => p.featured).length;
        const totalValue = currentProducts.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
        
        // Update DOM elements safely
        const elements = {
            'total-products': totalProducts,
            'total-orders': Math.floor(Math.random() * 100) + 20,
            'total-users': Math.floor(Math.random() * 200) + 50,
            'total-revenue': `₹${(totalValue / 1000).toFixed(0)}K`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Update additional stats
        updateAdditionalStats(activeProducts, featuredProducts, totalValue);
        
    } catch (error) {
        console.error('Error updating stats:', error);
        showNotification('Error updating statistics', 'error');
    }
}

function updateAdditionalStats(activeProducts, featuredProducts, totalValue) {
    // Add more detailed statistics if needed
    console.log(`Stats: ${activeProducts} active, ${featuredProducts} featured, ₹${totalValue} total value`);
}

// Load products table
function loadProductsTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    currentProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="product-checkbox" value="${product.id}" onchange="updateBulkActions()">
            </td>
            <td>
                <img src="${product.image || 'images/placeholder.jpg'}" 
                     alt="${product.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
                     onerror="this.src='https://placehold.co/50x50/e2e8f0/334155?text=No+Image'">
            </td>
            <td>
                <strong>${product.name}</strong>
                <br>
                <small>ID: ${product.id}</small>
            </td>
            <td>
                <span class="status-badge ${getCategoryClass(product.category)}">
                    ${formatCategory(product.category)}
                </span>
            </td>
            <td>₹${product.price.toLocaleString()}</td>
            <td>
                <span class="${product.stock > 10 ? 'text-success' : product.stock > 0 ? 'text-warning' : 'text-danger'}">
                    ${product.stock}
                </span>
            </td>
            <td>
                <span class="status-badge ${product.stock > 0 ? 'status-active' : 'status-inactive'}">
                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                ${product.featured ? '<span class="status-badge status-featured">Featured</span>' : ''}
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})" title="Edit Product">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="toggleFeatured(${product.id})" title="Toggle Featured">
                    <i class="fas fa-star"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" title="Delete Product">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateBulkActions();
}

// Bulk operations
function updateBulkActions() {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    const bulkActions = document.getElementById('bulk-actions');
    
    if (bulkActions) {
        bulkActions.style.display = checkboxes.length > 0 ? 'block' : 'none';
        document.getElementById('selected-count').textContent = checkboxes.length;
    }
}

function selectAllProducts() {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    const selectAllCheckbox = document.getElementById('select-all');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateBulkActions();
}

function bulkDelete() {
    const selectedIds = Array.from(document.querySelectorAll('.product-checkbox:checked')).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) {
        showNotification('No products selected', 'warning');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
        currentProducts = currentProducts.filter(p => !selectedIds.includes(p.id));
        loadProductsTable();
        updateStats();
        showNotification(`${selectedIds.length} products deleted successfully`, 'success');
    }
}

function bulkToggleFeatured() {
    const selectedIds = Array.from(document.querySelectorAll('.product-checkbox:checked')).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) {
        showNotification('No products selected', 'warning');
        return;
    }
    
    selectedIds.forEach(id => {
        const product = currentProducts.find(p => p.id === id);
        if (product) {
            product.featured = !product.featured;
        }
    });
    
    loadProductsTable();
    updateStats();
    showNotification(`${selectedIds.length} products updated successfully`, 'success');
}

// Helper functions
function getCategoryClass(category) {
    const classes = {
        'hand-tools': 'status-active',
        'power-tools': 'status-featured',
        'accessories': 'status-inactive',
        'safety': 'status-active'
    };
    return classes[category] || 'status-inactive';
}

function formatCategory(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Product management functions
function editProduct(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Pre-fill the form with existing data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-stock').value = product.stock;
    
    // Change form title and button
    document.querySelector('#add-product-modal h2').textContent = 'Edit Product';
    document.querySelector('#add-product-form button[type="submit"]').textContent = 'Update Product';
    
    // Store the product ID for updating
    document.getElementById('add-product-form').dataset.editId = productId;
    
    showAddProductModal();
}

function toggleFeatured(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (product) {
        product.featured = !product.featured;
        loadProductsTable();
        updateStats();
        
        // Show notification
        showNotification(`${product.name} ${product.featured ? 'added to' : 'removed from'} featured products`, 'success');
    }
}

function deleteProduct(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
        currentProducts = currentProducts.filter(p => p.id !== productId);
        loadProductsTable();
        updateStats();
        showNotification(`${product.name} has been deleted`, 'success');
    }
}

// Modal functions
function showAddProductModal() {
    document.getElementById('add-product-modal').style.display = 'flex';
}

function closeAddProductModal() {
    document.getElementById('add-product-modal').style.display = 'none';
    document.getElementById('add-product-form').reset();
    document.querySelector('#add-product-modal h2').textContent = 'Add New Product';
    document.querySelector('#add-product-form button[type="submit"]').textContent = 'Add Product';
    delete document.getElementById('add-product-form').dataset.editId;
}

// Form submission handler
function handleFormSubmission(e) {
    e.preventDefault();
    
    // Validate form data
    const formData = {
        name: document.getElementById('product-name').value.trim(),
        price: parseInt(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value,
        description: document.getElementById('product-description').value.trim(),
        stock: parseInt(document.getElementById('product-stock').value)
    };
    
    // Validation
    if (!formData.name || formData.price <= 0 || formData.stock < 0) {
        showNotification('Please fill all fields with valid values', 'error');
        return;
    }
    
    const editId = e.target.dataset.editId;
    
    if (editId) {
        // Update existing product
        const product = currentProducts.find(p => p.id === parseInt(editId));
        if (product) {
            Object.assign(product, formData);
            showNotification('Product updated successfully!', 'success');
        }
    } else {
        // Add new product
        const newProduct = {
            id: currentProducts.length > 0 ? Math.max(...currentProducts.map(p => p.id)) + 1 : 1,
            ...formData,
            image: getDefaultImageForCategory(formData.category),
            featured: false,
            rating: 4.0,
            reviews: 0,
            tags: [formData.category]
        };
        
        currentProducts.push(newProduct);
        showNotification('Product added successfully!', 'success');
    }
    
    loadProductsTable();
    updateStats();
    closeAddProductModal();
}

// Get default image for category
function getDefaultImageForCategory(category) {
    const defaultImages = {
        'hand-tools': 'images/016-manual-riveter-250x250.webp',
        'power-tools': 'images/pneumatic-screwdriver-pistol-250x250.webp',
        'accessories': 'images/rivet-nut-250x250.webp',
        'safety': 'images/product-jpeg-250x250.webp'
    };
    return defaultImages[category] || 'images/product-jpeg-250x250.webp';
}

// Utility functions
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

function exportData() {
    const data = {
        products: currentProducts,
        exportDate: new Date().toISOString(),
        totalProducts: currentProducts.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `om-jagdamb-products-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

function showSettings() {
    const settingsModal = createSettingsModal();
    document.body.appendChild(settingsModal);
}

// Create settings modal
function createSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2><i class="fas fa-cog"></i> Admin Settings</h2>
            <div class="settings-section">
                <h3>Site Configuration</h3>
                <div class="form-group">
                    <label>Site Name:</label>
                    <input type="text" value="Om Jagdamb Tools" readonly>
                </div>
                <div class="form-group">
                    <label>Currency:</label>
                    <select>
                        <option value="INR" selected>Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Products per page:</label>
                    <input type="number" value="12" min="6" max="24">
                </div>
            </div>
            <div class="settings-section">
                <h3>Quick Actions</h3>
                <button class="btn btn-primary" onclick="refreshData()">
                    <i class="fas fa-sync"></i> Refresh Data
                </button>
                <button class="btn btn-warning" onclick="clearCache()">
                    <i class="fas fa-trash"></i> Clear Cache
                </button>
                <button class="btn btn-success" onclick="backupData()">
                    <i class="fas fa-download"></i> Backup Data
                </button>
            </div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    return modal;
}

// Settings functions
function refreshData() {
    loadProducts();
    updateStats();
    loadProductsTable();
    showNotification('Data refreshed successfully!', 'success');
}

function clearCache() {
    if (confirm('Are you sure you want to clear the cache?')) {
        localStorage.removeItem('admin_cache');
        showNotification('Cache cleared successfully!', 'success');
    }
}

function backupData() {
    const backupData = {
        products: currentProducts,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `om-jagdamb-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Backup created successfully!', 'success');
}

function saveSettings() {
    showNotification('Settings saved successfully!', 'success');
    document.querySelector('.modal').remove();
}

// Search and filter functions
let filteredProducts = [];

function searchProducts() {
    const searchTerm = document.getElementById('search-products').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category').value;
    const statusFilter = document.getElementById('filter-status').value;
    
    filteredProducts = currentProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesStatus = !statusFilter || 
                            (statusFilter === 'in-stock' && product.stock > 0) ||
                            (statusFilter === 'out-of-stock' && product.stock === 0) ||
                            (statusFilter === 'featured' && product.featured);
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    displayFilteredProducts();
}

function filterProducts() {
    searchProducts(); // Reuse search logic
}

function displayFilteredProducts() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const productsToShow = filteredProducts.length > 0 || 
                          document.getElementById('search-products').value || 
                          document.getElementById('filter-category').value || 
                          document.getElementById('filter-status').value 
                          ? filteredProducts : currentProducts;
    
    if (productsToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No products found matching your criteria
                </td>
            </tr>
        `;
        return;
    }
    
    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="product-checkbox" value="${product.id}" onchange="updateBulkActions()">
            </td>
            <td>
                <img src="${product.image || 'images/placeholder.jpg'}" 
                     alt="${product.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
                     onerror="this.src='https://placehold.co/50x50/e2e8f0/334155?text=No+Image'">
            </td>
            <td>
                <strong>${product.name}</strong>
                <br>
                <small>ID: ${product.id}</small>
            </td>
            <td>
                <span class="status-badge ${getCategoryClass(product.category)}">
                    ${formatCategory(product.category)}
                </span>
            </td>
            <td>₹${product.price.toLocaleString()}</td>
            <td>
                <span class="${product.stock > 10 ? 'text-success' : product.stock > 0 ? 'text-warning' : 'text-danger'}">
                    ${product.stock}
                </span>
            </td>
            <td>
                <span class="status-badge ${product.stock > 0 ? 'status-active' : 'status-inactive'}">
                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                ${product.featured ? '<span class="status-badge status-featured">Featured</span>' : ''}
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})" title="Edit Product">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="toggleFeatured(${product.id})" title="Toggle Featured">
                    <i class="fas fa-star"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" title="Delete Product">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateBulkActions();
}

// Update the original loadProductsTable to use the new display function
function loadProductsTable() {
    // Reset filters
    document.getElementById('search-products').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-status').value = '';
    filteredProducts = [];
    
    displayFilteredProducts();
}

// Add CSS for modal and notifications
const style = document.createElement('style');
style.textContent = `
    .modal {
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        align-items: center;
        justify-content: center;
    }
    
    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 15px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }
    
    .close {
        position: absolute;
        right: 1rem;
        top: 1rem;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
    }
    
    .close:hover {
        color: #333;
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #333;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .btn-secondary:hover {
        background: #5a6268;
    }
    
    .text-success { color: #28a745; }
    .text-warning { color: #ffc107; }
    .text-danger { color: #dc3545; }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .settings-section {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .settings-section:last-child {
        border-bottom: none;
    }
    
    .settings-section h3 {
        color: #333;
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }
    
    .product-checkbox {
        transform: scale(1.2);
        margin: 0;
    }
    
    .admin-table th:first-child,
    .admin-table td:first-child {
        width: 40px;
        text-align: center;
    }
    
    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .btn:disabled:hover {
        transform: none;
    }
`;
=======
/**
 * Admin Dashboard JavaScript
 * Handles admin panel functionality for Om Jagdamb Tools
 */

// Global variables
let currentProducts = [];
let currentSection = 'dashboard';

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateStats();
    showSection('dashboard');
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Form submission handler
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Modal close handlers
    const modal = document.getElementById('add-product-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAddProductModal();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAddProductModal();
        }
    });
}

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-content').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionName + '-section');
    if (section) {
        section.style.display = 'block';
    }
    
    // Add active class to current nav item
    const navItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    currentSection = sectionName;
    
    // Load section-specific data
    if (sectionName === 'products') {
        loadProductsTable();
    }
}

// Load products from script.js
function loadProducts() {
    // Check if sampleProducts is available from script.js
    if (typeof sampleProducts !== 'undefined') {
        currentProducts = [...sampleProducts];
    } else {
        // Fallback products if script.js is not loaded
        currentProducts = [
            {
                id: 1,
                name: "Manual Riveter",
                image: "images/016-manual-riveter-250x250.webp",
                price: 899,
                category: "hand-tools",
                description: "Heavy-duty manual riveter",
                stock: 25,
                featured: true
            },
            {
                id: 2,
                name: "Pneumatic Screwdriver",
                image: "images/pneumatic-screwdriver-pistol-250x250.webp",
                price: 2499,
                category: "power-tools",
                description: "High-power pneumatic screwdriver",
                stock: 15,
                featured: true
            }
        ];
    }
}

// Update dashboard statistics
function updateStats() {
    try {
        const totalProducts = currentProducts.length;
        const activeProducts = currentProducts.filter(p => p.stock > 0).length;
        const featuredProducts = currentProducts.filter(p => p.featured).length;
        const totalValue = currentProducts.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
        
        // Update DOM elements safely
        const elements = {
            'total-products': totalProducts,
            'total-orders': Math.floor(Math.random() * 100) + 20,
            'total-users': Math.floor(Math.random() * 200) + 50,
            'total-revenue': `₹${(totalValue / 1000).toFixed(0)}K`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Update additional stats
        updateAdditionalStats(activeProducts, featuredProducts, totalValue);
        
    } catch (error) {
        console.error('Error updating stats:', error);
        showNotification('Error updating statistics', 'error');
    }
}

function updateAdditionalStats(activeProducts, featuredProducts, totalValue) {
    // Add more detailed statistics if needed
    console.log(`Stats: ${activeProducts} active, ${featuredProducts} featured, ₹${totalValue} total value`);
}

// Load products table
function loadProductsTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    currentProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="product-checkbox" value="${product.id}" onchange="updateBulkActions()">
            </td>
            <td>
                <img src="${product.image || 'images/placeholder.jpg'}" 
                     alt="${product.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
                     onerror="this.src='https://placehold.co/50x50/e2e8f0/334155?text=No+Image'">
            </td>
            <td>
                <strong>${product.name}</strong>
                <br>
                <small>ID: ${product.id}</small>
            </td>
            <td>
                <span class="status-badge ${getCategoryClass(product.category)}">
                    ${formatCategory(product.category)}
                </span>
            </td>
            <td>₹${product.price.toLocaleString()}</td>
            <td>
                <span class="${product.stock > 10 ? 'text-success' : product.stock > 0 ? 'text-warning' : 'text-danger'}">
                    ${product.stock}
                </span>
            </td>
            <td>
                <span class="status-badge ${product.stock > 0 ? 'status-active' : 'status-inactive'}">
                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                ${product.featured ? '<span class="status-badge status-featured">Featured</span>' : ''}
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})" title="Edit Product">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="toggleFeatured(${product.id})" title="Toggle Featured">
                    <i class="fas fa-star"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" title="Delete Product">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateBulkActions();
}

// Bulk operations
function updateBulkActions() {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    const bulkActions = document.getElementById('bulk-actions');
    
    if (bulkActions) {
        bulkActions.style.display = checkboxes.length > 0 ? 'block' : 'none';
        document.getElementById('selected-count').textContent = checkboxes.length;
    }
}

function selectAllProducts() {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    const selectAllCheckbox = document.getElementById('select-all');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateBulkActions();
}

function bulkDelete() {
    const selectedIds = Array.from(document.querySelectorAll('.product-checkbox:checked')).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) {
        showNotification('No products selected', 'warning');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
        currentProducts = currentProducts.filter(p => !selectedIds.includes(p.id));
        loadProductsTable();
        updateStats();
        showNotification(`${selectedIds.length} products deleted successfully`, 'success');
    }
}

function bulkToggleFeatured() {
    const selectedIds = Array.from(document.querySelectorAll('.product-checkbox:checked')).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) {
        showNotification('No products selected', 'warning');
        return;
    }
    
    selectedIds.forEach(id => {
        const product = currentProducts.find(p => p.id === id);
        if (product) {
            product.featured = !product.featured;
        }
    });
    
    loadProductsTable();
    updateStats();
    showNotification(`${selectedIds.length} products updated successfully`, 'success');
}

// Helper functions
function getCategoryClass(category) {
    const classes = {
        'hand-tools': 'status-active',
        'power-tools': 'status-featured',
        'accessories': 'status-inactive',
        'safety': 'status-active'
    };
    return classes[category] || 'status-inactive';
}

function formatCategory(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Product management functions
function editProduct(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Pre-fill the form with existing data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-stock').value = product.stock;
    
    // Change form title and button
    document.querySelector('#add-product-modal h2').textContent = 'Edit Product';
    document.querySelector('#add-product-form button[type="submit"]').textContent = 'Update Product';
    
    // Store the product ID for updating
    document.getElementById('add-product-form').dataset.editId = productId;
    
    showAddProductModal();
}

function toggleFeatured(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (product) {
        product.featured = !product.featured;
        loadProductsTable();
        updateStats();
        
        // Show notification
        showNotification(`${product.name} ${product.featured ? 'added to' : 'removed from'} featured products`, 'success');
    }
}

function deleteProduct(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
        currentProducts = currentProducts.filter(p => p.id !== productId);
        loadProductsTable();
        updateStats();
        showNotification(`${product.name} has been deleted`, 'success');
    }
}

// Modal functions
function showAddProductModal() {
    document.getElementById('add-product-modal').style.display = 'flex';
}

function closeAddProductModal() {
    document.getElementById('add-product-modal').style.display = 'none';
    document.getElementById('add-product-form').reset();
    document.querySelector('#add-product-modal h2').textContent = 'Add New Product';
    document.querySelector('#add-product-form button[type="submit"]').textContent = 'Add Product';
    delete document.getElementById('add-product-form').dataset.editId;
}

// Form submission handler
function handleFormSubmission(e) {
    e.preventDefault();
    
    // Validate form data
    const formData = {
        name: document.getElementById('product-name').value.trim(),
        price: parseInt(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value,
        description: document.getElementById('product-description').value.trim(),
        stock: parseInt(document.getElementById('product-stock').value)
    };
    
    // Validation
    if (!formData.name || formData.price <= 0 || formData.stock < 0) {
        showNotification('Please fill all fields with valid values', 'error');
        return;
    }
    
    const editId = e.target.dataset.editId;
    
    if (editId) {
        // Update existing product
        const product = currentProducts.find(p => p.id === parseInt(editId));
        if (product) {
            Object.assign(product, formData);
            showNotification('Product updated successfully!', 'success');
        }
    } else {
        // Add new product
        const newProduct = {
            id: currentProducts.length > 0 ? Math.max(...currentProducts.map(p => p.id)) + 1 : 1,
            ...formData,
            image: getDefaultImageForCategory(formData.category),
            featured: false,
            rating: 4.0,
            reviews: 0,
            tags: [formData.category]
        };
        
        currentProducts.push(newProduct);
        showNotification('Product added successfully!', 'success');
    }
    
    loadProductsTable();
    updateStats();
    closeAddProductModal();
}

// Get default image for category
function getDefaultImageForCategory(category) {
    const defaultImages = {
        'hand-tools': 'images/016-manual-riveter-250x250.webp',
        'power-tools': 'images/pneumatic-screwdriver-pistol-250x250.webp',
        'accessories': 'images/rivet-nut-250x250.webp',
        'safety': 'images/product-jpeg-250x250.webp'
    };
    return defaultImages[category] || 'images/product-jpeg-250x250.webp';
}

// Utility functions
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

function exportData() {
    const data = {
        products: currentProducts,
        exportDate: new Date().toISOString(),
        totalProducts: currentProducts.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `om-jagdamb-products-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

function showSettings() {
    const settingsModal = createSettingsModal();
    document.body.appendChild(settingsModal);
}

// Create settings modal
function createSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2><i class="fas fa-cog"></i> Admin Settings</h2>
            <div class="settings-section">
                <h3>Site Configuration</h3>
                <div class="form-group">
                    <label>Site Name:</label>
                    <input type="text" value="Om Jagdamb Tools" readonly>
                </div>
                <div class="form-group">
                    <label>Currency:</label>
                    <select>
                        <option value="INR" selected>Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Products per page:</label>
                    <input type="number" value="12" min="6" max="24">
                </div>
            </div>
            <div class="settings-section">
                <h3>Quick Actions</h3>
                <button class="btn btn-primary" onclick="refreshData()">
                    <i class="fas fa-sync"></i> Refresh Data
                </button>
                <button class="btn btn-warning" onclick="clearCache()">
                    <i class="fas fa-trash"></i> Clear Cache
                </button>
                <button class="btn btn-success" onclick="backupData()">
                    <i class="fas fa-download"></i> Backup Data
                </button>
            </div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    return modal;
}

// Settings functions
function refreshData() {
    loadProducts();
    updateStats();
    loadProductsTable();
    showNotification('Data refreshed successfully!', 'success');
}

function clearCache() {
    if (confirm('Are you sure you want to clear the cache?')) {
        localStorage.removeItem('admin_cache');
        showNotification('Cache cleared successfully!', 'success');
    }
}

function backupData() {
    const backupData = {
        products: currentProducts,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `om-jagdamb-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Backup created successfully!', 'success');
}

function saveSettings() {
    showNotification('Settings saved successfully!', 'success');
    document.querySelector('.modal').remove();
}

// Search and filter functions
let filteredProducts = [];

function searchProducts() {
    const searchTerm = document.getElementById('search-products').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category').value;
    const statusFilter = document.getElementById('filter-status').value;
    
    filteredProducts = currentProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesStatus = !statusFilter || 
                            (statusFilter === 'in-stock' && product.stock > 0) ||
                            (statusFilter === 'out-of-stock' && product.stock === 0) ||
                            (statusFilter === 'featured' && product.featured);
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    displayFilteredProducts();
}

function filterProducts() {
    searchProducts(); // Reuse search logic
}

function displayFilteredProducts() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const productsToShow = filteredProducts.length > 0 || 
                          document.getElementById('search-products').value || 
                          document.getElementById('filter-category').value || 
                          document.getElementById('filter-status').value 
                          ? filteredProducts : currentProducts;
    
    if (productsToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No products found matching your criteria
                </td>
            </tr>
        `;
        return;
    }
    
    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="product-checkbox" value="${product.id}" onchange="updateBulkActions()">
            </td>
            <td>
                <img src="${product.image || 'images/placeholder.jpg'}" 
                     alt="${product.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
                     onerror="this.src='https://placehold.co/50x50/e2e8f0/334155?text=No+Image'">
            </td>
            <td>
                <strong>${product.name}</strong>
                <br>
                <small>ID: ${product.id}</small>
            </td>
            <td>
                <span class="status-badge ${getCategoryClass(product.category)}">
                    ${formatCategory(product.category)}
                </span>
            </td>
            <td>₹${product.price.toLocaleString()}</td>
            <td>
                <span class="${product.stock > 10 ? 'text-success' : product.stock > 0 ? 'text-warning' : 'text-danger'}">
                    ${product.stock}
                </span>
            </td>
            <td>
                <span class="status-badge ${product.stock > 0 ? 'status-active' : 'status-inactive'}">
                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                ${product.featured ? '<span class="status-badge status-featured">Featured</span>' : ''}
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})" title="Edit Product">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="toggleFeatured(${product.id})" title="Toggle Featured">
                    <i class="fas fa-star"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" title="Delete Product">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateBulkActions();
}

// Update the original loadProductsTable to use the new display function
function loadProductsTable() {
    // Reset filters
    document.getElementById('search-products').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-status').value = '';
    filteredProducts = [];
    
    displayFilteredProducts();
}

// Add CSS for modal and notifications
const style = document.createElement('style');
style.textContent = `
    .modal {
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        align-items: center;
        justify-content: center;
    }
    
    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 15px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }
    
    .close {
        position: absolute;
        right: 1rem;
        top: 1rem;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
    }
    
    .close:hover {
        color: #333;
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #333;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .btn-secondary:hover {
        background: #5a6268;
    }
    
    .text-success { color: #28a745; }
    .text-warning { color: #ffc107; }
    .text-danger { color: #dc3545; }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .settings-section {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .settings-section:last-child {
        border-bottom: none;
    }
    
    .settings-section h3 {
        color: #333;
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }
    
    .product-checkbox {
        transform: scale(1.2);
        margin: 0;
    }
    
    .admin-table th:first-child,
    .admin-table td:first-child {
        width: 40px;
        text-align: center;
    }
    
    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .btn:disabled:hover {
        transform: none;
    }
`;
>>>>>>> 1a1e704d7eebaa3dc35e5fc0b35307bad07426c9
document.head.appendChild(style);
