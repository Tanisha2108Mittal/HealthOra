let express = require("express");
let router = express.Router();
const {
    signup,
    login,
    postFeedback,
    getAllFeedback,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require("./controller");
const authMiddleware = require("./authMiddlware");

// ========================
// AUTH ROUTES (PUBLIC)
// ========================
router.post("/signup", signup);
router.post("/login", login);

// ========================
// FEEDBACK ROUTES
// ========================
router.post("/feedback", postFeedback);
router.get("/feedback", getAllFeedback);

// ========================
// PRODUCT ROUTES (CRUD)
// ========================
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", authMiddleware, createProduct);
router.put("/products/:id", authMiddleware, updateProduct);
router.delete("/products/:id", authMiddleware, deleteProduct);

// ========================
// CART ROUTES
// ========================
router.get("/cart/:userId",authMiddleware, getCart);
router.post("/cart/add", authMiddleware,addToCart);
router.put("/cart/update", authMiddleware,updateCartItem);
router.post("/cart/remove",authMiddleware, removeFromCart);
router.delete("/cart/clear/:userId", authMiddleware,clearCart);

module.exports = router;
