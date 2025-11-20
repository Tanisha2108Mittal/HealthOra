let express= require("express") 
let connectDB= require("./connect") 
let routes= require("./routes") 
let dotenv= require("dotenv")
let cors= require("cors")
let bodyParser= require("body-parser")
let path = require("path")
dotenv.config()
try{
    connectDB()
}catch(err){
    console.log(err) 
}
let app= express();

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// CORS Configuration
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Static Files
app.use(express.static(path.join(__dirname, '..')));

// Body Parser Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

// ========================
// PAGE ROUTES
// ========================
app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/landing", (req, res) => {
    res.render("landing");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/contact", (req, res) => {
    res.render("contact");
});

app.get("/allProducts", (req, res) => {
    res.render("allProducts");
});

app.get("/productDescription", (req, res) => {
    res.render("productDescription");
});

app.get("/cart", (req, res) => {
    res.render("cart");
});

app.get("/address", (req, res) => {
    res.render("address");
});

app.get("/payment", (req, res) => {
    res.render("payment");
});

app.get("/admin-products", (req, res) => {
    res.render("admin-products");
});

app.listen(3000,()=>{ console.log(`Server running on http://localhost:3000`) });