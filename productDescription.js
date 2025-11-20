// =========================================
// Global product storage
// =========================================
let currentProduct = null;

// =========================================
// Fetch product ID from URL
// Example: productDescription?id=3
// =========================================
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id"); // Return string ID from MongoDB
}

// =========================================
// Product class
// =========================================
class Product {
    constructor(data) {
        this.id = data._id || data.id;
        this.name = data.name;
        this.fullName = data.fullName || data.name;
        this.price = data.price;
        this.image = data.image;
        this.category = data.category;
        this.badge = data.badge;
        this.weight = data.weight;
        this.stock = data.stock || 0;
    }

    generateHTML() {
    return `
    <div class="product-page">
        <div class="product-image">
            <img src="${this.image}" alt="${this.name}" onerror="this.src='/images/default.png'">
        </div>

        <div class="product-details">

            <h2 class="product-title">${this.name}</h2>
            <h3>${this.fullName}</h3>

            ${this.badge ? `<div class="badge">${this.badge}</div>` : ""}

            <p class="price">₹${this.price}</p>

            <p class="category"><strong>Category:</strong> ${this.category.replace("-", " ").toUpperCase()}</p>

            <label><strong>Quantity:</strong></label>
            <input type="number" id="quantity" value="1" min="1" max="${this.stock}">

            <div class="buttons">
                <button class="add-cart-btn" id="add-to-cart-btn">Add to Cart</button>
                <button class="buy-now-btn" id="buy-now-btn">Buy Now</button>
            </div>

        </div>
    </div>
    `;
    }
}

// =========================================
// Load product from API and display
// =========================================
// Load product from API and display
// =========================================
async function loadProductDetails() {
    const id = getProductIdFromURL();

    if (!id) {
        document.getElementById("product-container").innerHTML =
            "<h2>Product not found.</h2>";
        return;
    }

    try {
        const productData = await fetchProductById(id);

        if (!productData) {
            document.getElementById("product-container").innerHTML =
                "<h2>Product not found.</h2>";
            return;
        }

        const product = new Product(productData);
        currentProduct = product; // Store product globally

        document.getElementById("product-container")
            .innerHTML = product.generateHTML();

        // Attach event listeners to buttons
        document.getElementById("add-to-cart-btn").addEventListener("click", handleAddToCart);
        document.getElementById("buy-now-btn").addEventListener("click", handleBuyNow);
    } catch (err) {
        console.error("Error loading product:", err);
        document.getElementById("product-container").innerHTML =
            "<h2>Error loading product. Please try again.</h2>";
    }
}

// =========================================
// Handle Add to Cart
// =========================================
async function handleAddToCart() {
    if (!currentProduct) {
        alert('Product not loaded. Please refresh the page.');
        return;
    }

    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    
    // Ensure cartManager is available
    if (typeof cartManager === 'undefined') {
        alert('Cart system not ready. Please refresh the page.');
        return;
    }
    
    try {
        const success = await cartManager.addToCart(currentProduct.id, currentProduct.name, currentProduct.price, quantity);
        if (success) {
            console.log('Product added to cart successfully');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding product to cart. Please try again.');
    }
}

// =========================================
// Handle Buy Now
// =========================================
async function handleBuyNow() {
    if (!currentProduct) {
        alert('Product not loaded. Please refresh the page.');
        return;
    }

    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    
    // Ensure cartManager is available
    if (typeof cartManager === 'undefined') {
        alert('Cart system not ready. Please refresh the page.');
        return;
    }
    
    try {
        const success = await cartManager.addToCart(currentProduct.id, currentProduct.name, currentProduct.price, quantity);
        if (success) {
            // Redirect to checkout/address page
            setTimeout(() => {
                window.location.href = '/address';
            }, 800);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding product to cart. Please try again.');
    }
}

// =========================================
// Initialize on DOM Ready
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    // Wait for cartAPI.js to load (cartManager to be created)
    const checkCartManager = setInterval(() => {
        if (typeof cartManager !== 'undefined') {
            clearInterval(checkCartManager);
            loadProductDetails();
        }
    }, 50);
    
    // Timeout after 5 seconds
    setTimeout(() => {
        clearInterval(checkCartManager);
        if (typeof cartManager === 'undefined') {
            console.warn('CartAPI not loaded in time, attempting to load product anyway');
            loadProductDetails();
        }
    }, 5000);
});
