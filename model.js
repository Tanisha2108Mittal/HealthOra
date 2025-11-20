let mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: String,
    password: String,
    fullname: String,
    userName: String
});

const feedbackSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    feedback: String
});

const productSchema = mongoose.Schema({
    name: String,
    fullName: String,
    price: Number,
    image: String,
    category: String,
    badge: String,
    weight: String,
    stock: Number
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      itemId: { type: String, required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ]
});


module.exports = {
    User: mongoose.model('User', userSchema),
    Feedback: mongoose.model('Feedback', feedbackSchema),
    Product: mongoose.model('Product', productSchema),
    Cart: mongoose.model('Cart', cartSchema)
};