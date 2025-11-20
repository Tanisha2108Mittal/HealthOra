// ===============================
// OOP CLASS FOR PRODUCTS
// ===============================
class Product {
    constructor(id, name, price, image, category, badge = null) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.category = category;
        this.badge = badge;
    }

    generateCard() {
        return `
        <a href="/productDescription?id=${this.id}" class="product-card product-${this.id}">
            <img src="${this.image}" alt="${this.name}" onerror="this.src='/images/default.png'">
            ${this.badge ? `<div class="badge">${this.badge}</div>` : ""}
            <h3>${this.name}</h3>
            <p class="price">Rs. ${this.price}.00</p>
        </a>
        `;
    }
}

// ===============================
// LOAD PRODUCTS FOR SINGLE CATEGORY FROM API
// ===============================
async function loadProducts(categoryName) {
    const container = document.getElementById("product-container");
    container.innerHTML = ""; // Clear old items

    try {
        const data = await fetchAllProducts();
        const filteredProducts = data.filter(p => p.category === categoryName);

        if (filteredProducts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No products found in this category.</p>';
            return;
        }

        filteredProducts.forEach(item => {
            const product = new Product(
                item._id,
                item.name,
                item.price,
                item.image,
                item.category,
                item.badge
            );
            container.innerHTML += product.generateCard();
        });
    } catch (err) {
        console.error("Error loading products from API:", err);
        container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 40px;">Error loading products. Please try again.</p>';
    }
}

// ===============================
// LOAD *ALL* PRODUCTS + SCROLL TO CATEGORY FROM API
// ===============================
async function loadAllProducts() {
    try {
        // Wait a moment to ensure cartAPI is loaded
        if (typeof fetchAllProducts === 'undefined') {
            console.warn('fetchAllProducts not available, retrying...');
            setTimeout(loadAllProducts, 500);
            return;
        }

        const data = await fetchAllProducts();

        if (!data || data.length === 0) {
            console.log("No products available");
            return;
        }

        data.forEach(item => {
            const product = new Product(
                item._id,
                item.name,
                item.price,
                item.image,
                item.category,
                item.badge
            );

            const section = document.getElementById(`${item.category}-container`);
            if (section) {
                section.innerHTML += product.generateCard();
            }
        });

        // Scroll to category after render
        const hash = window.location.hash;

        if (hash) {
            const id = hash.substring(1);

            setTimeout(() => {
                const target = document.getElementById(id);
                if (target) {
                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }, 150);
        }

    } catch (err) {
        console.error("Error loading products from API:", err);
    }
}
