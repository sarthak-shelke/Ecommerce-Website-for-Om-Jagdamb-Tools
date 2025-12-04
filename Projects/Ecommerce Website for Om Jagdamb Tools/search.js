// Product Search Module
// Handles search functionality for Om Jagdamb Tools website

// Global search state
let searchState = {
    query: '',
    results: [],
    isLoading: false,
    error: null,
    abortController: null
};

// Debounce utility function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Initialize search functionality
function initializeSearch() {
    // Desktop search
    const searchInput = document.getElementById('product-search-input');
    const searchResults = document.getElementById('search-results');
    
    // Mobile search (for product page)
    const searchInputMobile = document.getElementById('product-search-input-mobile');
    const searchResultsMobile = document.getElementById('search-results-mobile');
    
    // Initialize desktop search if elements exist
    if (searchInput && searchResults) {
        initializeSearchInput(searchInput, searchResults);
    }
    
    // Initialize mobile search if elements exist
    if (searchInputMobile && searchResultsMobile) {
        initializeSearchInput(searchInputMobile, searchResultsMobile);
    }
    
    if (!searchInput && !searchInputMobile) {
        console.warn('Search elements not found on this page');
        return;
    }
    
    console.log('Search functionality initialized');
}

// Helper function to initialize a search input
function initializeSearchInput(inputElement, resultsElement) {
    // Add input event listener with debounce
    const debouncedSearch = debounce(function(event) {
        handleSearchInputWithElements(event, inputElement, resultsElement);
    }, 300);
    inputElement.addEventListener('input', debouncedSearch);
    
    // Add click event listener to close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const searchContainer = inputElement.closest('.search-container');
        if (searchContainer && !searchContainer.contains(event.target)) {
            closeSearchDropdownElement(resultsElement);
        }
    });
    
    // Prevent dropdown from closing when clicking inside
    if (resultsElement) {
        resultsElement.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
    
    // Handle escape key to close dropdown
    inputElement.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeSearchDropdownElement(resultsElement);
            inputElement.blur();
        }
    });
}

// Handle search input with validation
function handleSearchInput(event) {
    const query = event.target.value.trim();
    searchState.query = query;
    
    // Clear results if query is empty
    if (query === '') {
        closeSearchDropdown();
        return;
    }
    
    // Minimum 2 characters validation
    if (query.length < 2) {
        closeSearchDropdown();
        return;
    }
    
    // Trigger search
    searchProducts(query);
}

// Handle search input with specific elements
function handleSearchInputWithElements(event, inputElement, resultsElement) {
    const query = event.target.value.trim();
    searchState.query = query;
    searchState.currentResultsElement = resultsElement;
    
    // Clear results if query is empty
    if (query === '') {
        closeSearchDropdownElement(resultsElement);
        return;
    }
    
    // Minimum 2 characters validation
    if (query.length < 2) {
        closeSearchDropdownElement(resultsElement);
        return;
    }
    
    // Trigger search with specific results element
    searchProductsWithElement(query, resultsElement);
}

// Search products from API
async function searchProducts(query) {
    // Cancel previous request if exists
    if (searchState.abortController) {
        searchState.abortController.abort();
    }
    
    // Create new abort controller for this request
    searchState.abortController = new AbortController();
    
    searchState.isLoading = true;
    searchState.error = null;
    showLoading();
    
    const apiUrl = `http://127.0.0.1:8000/api/products/?search=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(apiUrl, {
            signal: searchState.abortController.signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        searchState.results = data.results || [];
        searchState.isLoading = false;
        
        hideLoading();
        displaySearchResults(searchState.results);
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Search request cancelled');
            return;
        }
        
        console.error('Search error:', error);
        searchState.isLoading = false;
        searchState.error = error.message;
        
        hideLoading();
        showError('Failed to search products. Please try again.');
    }
}

// Display search results in dropdown
function displaySearchResults(products) {
    const searchResults = document.getElementById('search-results');
    
    if (!searchResults) return;
    
    // Clear previous results
    searchResults.innerHTML = '';
    
    // Show dropdown
    searchResults.style.display = 'block';
    
    // No results found
    if (products.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <p>No products found for "${searchState.query}"</p>
            </div>
        `;
        return;
    }
    
    // Limit to 8 results
    const limitedProducts = products.slice(0, 8);
    
    // Create results list
    const resultsList = document.createElement('div');
    resultsList.className = 'search-results-list';
    
    limitedProducts.forEach(product => {
        const resultItem = createSearchResultItem(product);
        resultsList.appendChild(resultItem);
    });
    
    searchResults.appendChild(resultsList);
    
    // Show count if more results available
    if (products.length > 8) {
        const moreResults = document.createElement('div');
        moreResults.className = 'search-more-results';
        moreResults.innerHTML = `<p>+${products.length - 8} more results. Try refining your search.</p>`;
        searchResults.appendChild(moreResults);
    }
}

// Create individual search result item
function createSearchResultItem(product) {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.setAttribute('role', 'option');
    item.setAttribute('tabindex', '0');
    
    const imageUrl = product.primary_image || 'https://placehold.co/60x60/e2e8f0/334155?text=No+Image';
    const price = parseFloat(product.price).toFixed(2);
    const stockStatus = product.is_in_stock ? '' : '<span class="out-of-stock-badge">Out of Stock</span>';
    
    item.innerHTML = `
        <div class="search-result-image">
            <img src="${imageUrl}" alt="${product.name}" loading="lazy">
        </div>
        <div class="search-result-info">
            <h4 class="search-result-name">${product.name}</h4>
            <p class="search-result-price">₹${price} ${stockStatus}</p>
        </div>
        <div class="search-result-arrow">
            <i class="fas fa-arrow-right"></i>
        </div>
    `;
    
    // Add click handler to redirect to product page
    item.addEventListener('click', () => redirectToProduct(product.slug));
    
    // Add keyboard support
    item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            redirectToProduct(product.slug);
        }
    });
    
    return item;
}

// Show loading indicator
function showLoading() {
    const loadingIndicator = document.querySelector('.search-loading');
    const searchIcon = document.querySelector('.search-icon');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    if (searchIcon) {
        searchIcon.style.display = 'none';
    }
}

// Hide loading indicator
function hideLoading() {
    const loadingIndicator = document.querySelector('.search-loading');
    const searchIcon = document.querySelector('.search-icon');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    if (searchIcon) {
        searchIcon.style.display = 'block';
    }
}

// Show error message
function showError(message) {
    const searchResults = document.getElementById('search-results');
    
    if (!searchResults) return;
    
    searchResults.innerHTML = `
        <div class="search-error">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    searchResults.style.display = 'block';
}

// Close search dropdown
function closeSearchDropdown() {
    const searchResults = document.getElementById('search-results');
    const searchResultsMobile = document.getElementById('search-results-mobile');
    
    if (searchResults) {
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
    }
    
    if (searchResultsMobile) {
        searchResultsMobile.style.display = 'none';
        searchResultsMobile.innerHTML = '';
    }
}

// Close specific search dropdown element
function closeSearchDropdownElement(resultsElement) {
    if (resultsElement) {
        resultsElement.style.display = 'none';
        resultsElement.innerHTML = '';
    }
}

// Search products with specific results element
async function searchProductsWithElement(query, resultsElement) {
    // Cancel previous request if exists
    if (searchState.abortController) {
        searchState.abortController.abort();
    }
    
    // Create new abort controller for this request
    searchState.abortController = new AbortController();
    
    searchState.isLoading = true;
    searchState.error = null;
    showLoading();
    
    const apiUrl = `http://127.0.0.1:8000/api/products/?search=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(apiUrl, {
            signal: searchState.abortController.signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        searchState.results = data.results || [];
        searchState.isLoading = false;
        
        hideLoading();
        displaySearchResultsInElement(searchState.results, resultsElement);
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Search request cancelled');
            return;
        }
        
        console.error('Search error:', error);
        searchState.isLoading = false;
        searchState.error = error.message;
        
        hideLoading();
        showErrorInElement('Failed to search products. Please try again.', resultsElement);
    }
}

// Display search results in specific element
function displaySearchResultsInElement(products, resultsElement) {
    if (!resultsElement) return;
    
    // Clear previous results
    resultsElement.innerHTML = '';
    
    // Show dropdown
    resultsElement.style.display = 'block';
    
    // No results found
    if (products.length === 0) {
        resultsElement.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <p>No products found for "${searchState.query}"</p>
            </div>
        `;
        return;
    }
    
    // Limit to 8 results
    const limitedProducts = products.slice(0, 8);
    
    // Create results list
    const resultsList = document.createElement('div');
    resultsList.className = 'search-results-list';
    
    limitedProducts.forEach(product => {
        const resultItem = createSearchResultItem(product);
        resultsList.appendChild(resultItem);
    });
    
    resultsElement.appendChild(resultsList);
    
    // Show count if more results available
    if (products.length > 8) {
        const moreResults = document.createElement('div');
        moreResults.className = 'search-more-results';
        moreResults.innerHTML = `<p>+${products.length - 8} more results. Try refining your search.</p>`;
        resultsElement.appendChild(moreResults);
    }
}

// Show error in specific element
function showErrorInElement(message, resultsElement) {
    if (!resultsElement) return;
    
    resultsElement.innerHTML = `
        <div class="search-error">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    resultsElement.style.display = 'block';
}

// Redirect to product detail page
function redirectToProduct(slug) {
    window.location.href = `product_detail.html?slug=${slug}`;
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSearch);
} else {
    initializeSearch();
}
