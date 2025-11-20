const jwt = require("jsonwebtoken");

// Auth Middleware for Protected Routes
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false,
            message: "No authorization header provided" 
        });
    }
    
    try {
        // Extract token from "Bearer <token>" format
        const token = authHeader.startsWith("Bearer ") 
            ? authHeader.slice(7) 
            : authHeader;
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token format" 
            });
        }
        
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        
        // Attach user info to request object
        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ 
                success: false,
                message: "Token has expired" 
            });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
        }
        return res.status(401).json({ 
            success: false,
            message: "Authorization failed", 
            error: error.message 
        });
    }
};

module.exports = authMiddleware;