const { User, Feedback, Product, Cart } = require('./model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ========================
// JWT TOKEN GENERATION
// ========================
const generateToken = (userId, email) => {
    const payload = {
        id: userId,
        email: email
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "your_secret_key", {
        expiresIn: "7d"
    });
    return token;
};


// Sign Up Controller
exports.signup = async (req, res) => {
    try {
        const { email, password, fullname, userName } = req.body;

        // Validate input
        if (!email || !password || !fullname || !userName) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Check if user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists with this email' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        let user = new User({
            email,
            password: hashedPassword,
            fullname,
            userName
        });

        await user.save();
        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email,
                fullname: user.fullname,
                userName: user.userName
            }
        });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error during signup',
            error: err.message 
        });
    }
};

// Login Controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.email);

        res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                email: user.email,
                fullname: user.fullname,
                userName: user.userName
            }
        });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error during login',
            error: err.message 
        });
    }
};

// FEEDBACK CONTROLLER

exports.postFeedback = async (req, res) => {
    try {
        const { firstname, lastname, email, feedback } = req.body;

        // Validate input
        if (!firstname || !lastname || !email || !feedback) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Create feedback
        let newFeedback = new Feedback({
            firstname,
            lastname,
            email,
            feedback
        });

        await newFeedback.save();
        res.status(201).json({ 
            success: true, 
            message: 'Feedback submitted successfully',
            feedback: newFeedback
        });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error submitting feedback',
            error: err.message 
        });
    }
};

// Get all feedback (for admin)
exports.getAllFeedback = async (req, res) => {
    try {
        const allFeedback = await Feedback.find();
        res.status(200).json({ 
            success: true, 
            count: allFeedback.length,
            feedback: allFeedback 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching feedback',
            error: err.message 
        });
    }
};


// PRODUCT CONTROLLERS (CRUD)

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ 
            success: true, 
            count: products.length,
            products 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching products',
            error: err.message 
        });
    }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            product 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching product',
            error: err.message 
        });
    }
};

// Create product (for admin)
exports.createProduct = async (req, res) => {
    try {
        const { name, fullName, price, image, category, badge, weight, stock } = req.body;

        // Validate input
        if (!name || !price || !category) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, price, and category are required' 
            });
        }

        let newProduct = new Product({
            name,
            fullName: fullName || name,
            price,
            image: image || '/images/default.png',
            category,
            badge: badge || null,
            weight: weight || 'N/A',
            stock: stock || 0
        });

        await newProduct.save();
        res.status(201).json({ 
            success: true, 
            message: 'Product created successfully',
            product: newProduct
        });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error creating product',
            error: err.message 
        });
    }
};

// Update product (for admin)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, fullName, price, image, category, badge, weight, stock } = req.body;

        let product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        // Update fields
        if (name) product.name = name;
        if (fullName) product.fullName = fullName;
        if (price) product.price = price;
        if (image) product.image = image;
        if (category) product.category = category;
        if (badge !== undefined) product.badge = badge;
        if (weight) product.weight = weight;
        if (stock !== undefined) product.stock = stock;

        await product.save();
        res.status(200).json({ 
            success: true, 
            message: 'Product updated successfully',
            product
        });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating product',
            error: err.message 
        });
    }
};

// Delete product (for admin)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        let product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Product deleted successfully',
            product
        });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting product',
            error: err.message 
        });
    }
};

// ========================
// CART CONTROLLERS
// ========================

// Get user cart
exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            // Create empty cart if doesn't exist
            cart = new Cart({ userId, items: [] });
            await cart.save();
        }

        res.status(200).json({ 
            success: true, 
            cart 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching cart',
            error: err.message 
        });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { userId, itemId, qty, price } = req.body;

        if (!userId || !itemId || !qty || !price) {
            return res.status(400).json({ 
                success: false, 
                message: 'UserId, itemId, qty, and price are required' 
            });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if item already in cart
        let itemIndex = cart.items.findIndex(item => item.itemId === itemId);
        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].qty += qty;
        } else {
            // Add new item
            cart.items.push({ itemId, qty, price });
        }

        await cart.save();
        res.status(200).json({ 
            success: true, 
            message: 'Item added to cart',
            cart 
        });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error adding to cart',
            error: err.message 
        });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { userId, itemId, qty } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        let itemIndex = cart.items.findIndex(item => item.itemId === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not in cart' 
            });
        }

        if (qty <= 0) {
            // Remove item if quantity is 0 or negative
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].qty = qty;
        }

        await cart.save();
        res.status(200).json({ 
            success: true, 
            message: 'Cart updated',
            cart 
        });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating cart',
            error: err.message 
        });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { userId, itemId } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        cart.items = cart.items.filter(item => item.itemId !== itemId);
        await cart.save();

        res.status(200).json({ 
            success: true, 
            message: 'Item removed from cart',
            cart 
        });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error removing from cart',
            error: err.message 
        });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const { userId } = req.params;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({ 
            success: true, 
            message: 'Cart cleared',
            cart 
        });

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error clearing cart',
            error: err.message 
        });
    }
};
