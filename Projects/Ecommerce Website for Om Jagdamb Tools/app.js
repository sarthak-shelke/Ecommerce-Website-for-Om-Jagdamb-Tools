// Wait for the document to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Dropdown Menu Logic ---
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button');
        const menu = dropdown.querySelector('.dropdown-menu');

        button.addEventListener('click', function(event) {
            event.stopPropagation(); 
            const isCurrentlyVisible = menu.style.display === 'block';
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                m.style.display = 'none';
            });
            // Toggle the current one
            if (!isCurrentlyVisible) {
                menu.style.display = 'block';
            }
        });
    });

    // Global click listener to close dropdowns
    document.addEventListener('click', function(event) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    });


    // --- 2. Functional Filtering Logic ---
    const filterLinks = document.querySelectorAll('.filter-menu a');
    const productCards = document.querySelectorAll('.product-card');

    filterLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); 
            const filterValue = link.dataset.filter; 

            productCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block'; 
                } else {
                    if (card.dataset.category === filterValue) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });

    // --- 3. Functional Sorting Logic ---
    const sortLinks = document.querySelectorAll('.sort-menu a');
    const productGrid = document.getElementById('product-grid');

    sortLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const sortType = link.dataset.sort; 
            let cardsArray = Array.from(productCards);

            if (sortType === 'price-asc') {
                cardsArray.sort((a, b) => a.dataset.price - b.dataset.price);
            } else if (sortType === 'price-desc') {
                cardsArray.sort((a, b) => b.dataset.price - a.dataset.price);
            } else if (sortType === 'name-asc') {
                cardsArray.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
            }

            // Put the sorted cards back into the grid
            cardsArray.forEach(card => {
                productGrid.appendChild(card); 
            });
        });
    });

    // --- 4. NEW: Product Card Click Handler ---
    // This will dynamically create the URL for the detail page
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(event) {
            // Stop the link from navigating normally
            event.preventDefault();

            // Get all the data from the card's data attributes
            const name = card.dataset.name;
            const price = card.dataset.price;
            const description = card.dataset.description;
            // Get the large image URL we stored
            const imageUrl = card.dataset.imageLarge; 

            // Build the query string
            const queryString = new URLSearchParams({
                name: name,
                price: price,
                image: imageUrl,
                desc: description
            }).toString();

            // Navigate to the detail page with the product info
            window.location.href = `product_detail.html?${queryString}`;
        });
    });

});