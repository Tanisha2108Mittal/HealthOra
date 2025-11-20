// ========================
// CART API INTEGRATION
// ========================

const API_BASE_URL = 'http://localhost:3000';

class CartManager {
    constructor() {
        this.userId = this.getUserId();
        this.cart = [];
        this.loadCart();
    }

    // Get user ID from localStorage
    getUserId() {
        const user = localStorage.getItem('user');
        if (user) {
            return JSON.parse(user).id;
        }
        return 'guest-' + Math.random().toString(36).substr(2, 9);
    }

    // Fetch cart from backend
    async loadCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/${this.userId}`, {
                headers: getAuthHeader()
            });
            const data = await response.json();
            
            if (data.success) {
                this.cart = data.cart.items || [];
                this.updateCartUI();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    // Add item to cart
    async addToCart(itemId, productName, price, qty = 1) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    userId: this.userId,
                    itemId: itemId.toString(),
                    qty,
                    price
                })
            });

            const data = await response.json();
            if (data.success) {
                this.cart = data.cart.items || [];
                this.updateCartUI();
                this.showNotification(`${productName} added to cart!`, 'success');
                return true;
            } else {
                this.showNotification(data.message || 'Error adding to cart', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Error adding to cart', 'error');
            return false;
        }
    }

    // Update item quantity
    async updateItemQuantity(itemId, quantity) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    userId: this.userId,
                    itemId: itemId.toString(),
                    qty: quantity
                })
            });

            const data = await response.json();
            if (data.success) {
                this.cart = data.cart.items || [];
                this.updateCartUI();
                return true;
            } else {
                this.showNotification(data.message || 'Error updating cart', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            this.showNotification('Error updating cart', 'error');
            return false;
        }
    }

    // Remove item from cart
    async removeFromCart(itemId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    userId: this.userId,
                    itemId: itemId.toString()
                })
            });

            const data = await response.json();
            if (data.success) {
                this.cart = data.cart.items || [];
                this.updateCartUI();
                this.showNotification('Item removed from cart', 'success');
                return true;
            } else {
                this.showNotification(data.message || 'Error removing from cart', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            this.showNotification('Error removing from cart', 'error');
            return false;
        }
    }

    // Clear entire cart
    async clearCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/clear/${this.userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });

            const data = await response.json();
            if (data.success) {
                this.cart = [];
                this.updateCartUI();
                this.showNotification('Cart cleared', 'success');
                return true;
            } else {
                this.showNotification(data.message || 'Error clearing cart', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            this.showNotification('Error clearing cart', 'error');
            return false;
        }
    }

    // Get cart count
    getCartCount() {
        return this.cart.reduce((total, item) => total + item.qty, 0);
    }

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.qty), 0);
    }

    // Update cart UI
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');

        if (cartCount) {
            cartCount.textContent = this.getCartCount();
        }

        if (cartTotal) {
            cartTotal.textContent = `Rs. ${this.getCartTotal().toFixed(2)}`;
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.cart }));
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Create global cart manager instance
const cartManager = new CartManager();

// ========================
// AUTHENTICATION FUNCTIONS
// ========================

// Get authorization header with JWT token
function getAuthHeader() {
    const token = localStorage.getItem('authToken');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}

async function signup(email, password, fullname, userName) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                fullname,
                userName
            })
        });

        const data = await response.json();
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            return { success: true, message: data.message, user: data.user, token: data.token };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Error during signup:', error);
        return { success: false, message: 'Error during signup' };
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            return { success: true, message: data.message, user: data.user, token: data.token };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Error during login:', error);
        return { success: false, message: 'Error during login' };
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    location.href = '/login';
}

function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// ========================
// FEEDBACK SUBMISSION
// ========================

async function submitFeedback(firstname, lastname, email, feedback) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({
                firstname,
                lastname,
                email,
                feedback
            })
        });

        const data = await response.json();
        if (data.success) {
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, message: 'Error submitting feedback' };
    }
}

// ========================
// PRODUCT FETCHING
// ========================

async function fetchAllProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        if (data.success) {
            return data.products;
        }
        return [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function fetchProductById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const data = await response.json();
        if (data.success) {
            return data.product;
        }
        return null;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

