require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://varunk41:ecom@ecommerce.sdx5b.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerce')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 }
});
const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true }
});
const Product = mongoose.model('Product', productSchema);

// Cart Schema
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 }
  }]
});
const Cart = mongoose.model('Cart', cartSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalPrice: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed'], 
    default: 'Pending' 
  },
  orderStatus: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Authentication Middleware
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('--- Auth Middleware Start ---');
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Authorization Header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid or missing Authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted Token:', token);
    
    if (!token) throw new Error('No token provided');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded Token:', decoded);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw new Error('User not found');
    console.log('User Found:', user.email);
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    console.log('--- Auth Middleware End ---');
    res.status(401).send({ error: 'Authentication failed' });
  }
};
// Public Routes
app.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({ error: 'Invalid email format' });
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send({ 
      error: error.code === 11000 ? 'Email already exists' : error.message 
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid login credentials');
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.send({ token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch products' });
  }
});

// Protected Cart Routes
app.post('/cart', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findOne({ productId });
    if (!product || product.stock < quantity) {
      throw new Error('Product not available or insufficient stock');
    }
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }
    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    await cart.save();
    res.send(cart);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/cart', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    res.send(cart || { items: [] });
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch cart' });
  }
});

app.delete('/cart/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) throw new Error('Cart not found');
    cart.items = cart.items.filter(item => item.productId !== productId);
    await cart.save();
    res.send(cart);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Protected Order Route
app.post('/orders', authMiddleware, async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).send({ error: 'Cart is empty' });
    }

    const products = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findOne({ productId: item.productId });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Product ${item.productId} not available or insufficient stock`);
        }
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        };
      })
    );

    const totalPrice = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = new Order({
      userId: req.user._id,
      products,
      totalPrice,
      shippingAddress,
      paymentStatus: 'Pending',
      orderStatus: 'Pending'
    });

    // Update stock
    await Promise.all(products.map(async (item) => {
      await Product.updateOne(
        { productId: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }));

    await order.save();
    await Cart.deleteOne({ userId: req.user._id });
    res.status(201).send({ message: 'Order placed successfully', order: order.toObject() });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post('/seed-products', async (req, res) => {
  try {
    await Product.insertMany([
      { productId: 'prod1', name: 'Test Product', price: 10, stock: 100 },
    ], { ordered: false }); // ordered: false to continue on duplicates
    res.status(200).send('Products seeded');
  } catch (error) {
    console.error('Seed products error:', error); // Log the error for debugging
    if (error.code === 11000) {
      res.status(200).send('Products already seeded');
    } else {
      res.status(500).send({ error: 'Failed to seed products', details: error.message });
    }
  }
});

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));
module.exports = app;