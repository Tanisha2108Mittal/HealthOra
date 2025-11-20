// ========================
// PRODUCT MANAGEMENT SCRIPT
// ========================

const API_BASE_URL = 'http://localhost:3000';
let currentEditingProductId = null;
let allProducts = [];

// ========================
// HELPER FUNCTIONS
// ========================

// Get authorization header with JWT token
function getAuthHeader() {
    const token = localStorage.getItem('authToken');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}

// ========================
// INITIALIZATION
// ========================

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupSearchFilter();
});

// ========================
// API FUNCTIONS
// ========================

// Fetch all products
async function fetchProducts() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        
        if (data.success) {
            allProducts = data.products;
            renderProducts(allProducts);
        } else {
            showAlert('Error loading products', 'error');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        showAlert('Failed to load products. Make sure backend is running.', 'error');
    } finally {
        showLoading(false);
    }
}

// Create product
async function createProduct(productData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}

// Update product
async function updateProduct(productId, productData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

// Delete product
async function deleteProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

// ========================
// UI FUNCTIONS
// ========================

function loadProducts() {
    fetchProducts();
}

function refreshProducts() {
    fetchProducts();
}

function renderProducts(products) {
    const tbody = document.getElementById('productsBody');
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 20px;"></i>
                    <p>No products found.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.image || '/images/default.png'}" alt="${product.name}" class="product-image" onerror="this.src='/images/default.png'">
            </td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td>Rs. ${product.price}.00</td>
            <td>${product.stock || 0}</td>
            <td>${product.badge ? `<span class="badge">${product.badge}</span>` : '-'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-secondary btn-sm" onclick="editProduct('${product._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('${product._id}', '${product.name}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const filtered = allProducts.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
        renderProducts(filtered);
    });
}

// ========================
// MODAL FUNCTIONS
// ========================

function openAddProductModal() {
    currentEditingProductId = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').classList.add('active');
}

function editProduct(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    currentEditingProductId = productId;
    document.getElementById('modalTitle').textContent = 'Edit Product';
    
    document.getElementById('productName').value = product.name;
    document.getElementById('productFullName').value = product.fullName || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productBadge').value = product.badge || '';
    document.getElementById('productWeight').value = product.weight || '';
    document.getElementById('productImage').value = product.image || '';
    
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
    currentEditingProductId = null;
}

// ========================
// FORM SUBMISSION
// ========================

async function saveProduct(event) {
    event.preventDefault();

    const productData = {
        name: document.getElementById('productName').value,
        fullName: document.getElementById('productFullName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value) || 0,
        badge: document.getElementById('productBadge').value || null,
        weight: document.getElementById('productWeight').value,
        image: document.getElementById('productImage').value
    };

    try {
        showLoading(true);
        let result;

        if (currentEditingProductId) {
            // Update existing product
            result = await updateProduct(currentEditingProductId, productData);
        } else {
            // Create new product
            result = await createProduct(productData);
        }

        if (result.success) {
            showAlert(result.message, 'success');
            closeProductModal();
            loadProducts();
        } else {
            showAlert(result.message || 'Error saving product', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error saving product', 'error');
    } finally {
        showLoading(false);
    }
}

// ========================
// DELETE CONFIRMATION
// ========================

function confirmDelete(productId, productName) {
    if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
        deleteProductConfirmed(productId);
    }
}

async function deleteProductConfirmed(productId) {
    try {
        showLoading(true);
        const result = await deleteProduct(productId);

        if (result.success) {
            showAlert('Product deleted successfully', 'success');
            loadProducts();
        } else {
            showAlert(result.message || 'Error deleting product', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error deleting product', 'error');
    } finally {
        showLoading(false);
    }
}

// ========================
// UTILITY FUNCTIONS
// ========================

function showAlert(message, type = 'info') {
    const alertDiv = document.getElementById('alert');
    alertDiv.textContent = message;
    alertDiv.className = `alert active alert-${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('active');
    }, 5000);
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.style.display = 'block';
    } else {
        loading.style.display = 'none';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeProductModal();
    }
});

// Escape key to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeProductModal();
    }
});
