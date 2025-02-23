import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [cart, setCart] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null); // Manage order state here
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    const fetchCart = async () => {
      if (storedToken) {
        try {
          const response = await axios.get('http://localhost:3000/cart', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setCart(response.data);
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          setCart({ items: [] });
        }
      } else {
        setCart(null);
      }
    };
    fetchCart();
  }, [token]);

  const updateCart = (newCart) => {
    setCart(newCart);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCart(null);
    setCurrentOrder(null);
    navigate('/login');
  };

  const isCartEmpty = !cart || (cart.items && cart.items.length === 0);

  return (
    <div className="min-h-screen flex flex-col" 
      style={{ background: 'url("https://www.transparenttextures.com/patterns/dark-denim.png"), linear-gradient(to bottom right, #1a202c, #2d3748)' }}>
      <nav className="bg-gray-800 text-white p-6">
        <ul className="flex justify-center space-x-6">
          <li><Link to="/" className="hover:text-gray-300">Home</Link></li>
          <li><Link to="/register" className="hover:text-gray-300">Register</Link></li>
          {token ? (
            <>
              <li><Link to="/cart" className="hover:text-gray-300">Cart</Link></li>
              {!isCartEmpty && (
                <li><Link to="/checkout" className="hover:text-gray-300">Checkout</Link></li>
              )}
              <li>
                <button onClick={handleLogout} className="hover:text-gray-300 focus:outline-none">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/login" className="hover:text-gray-300">Login</Link></li>
          )}
        </ul>
      </nav>
      <main className="flex-grow flex items-center justify-center">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart updateCart={updateCart} />} />
          <Route path="/checkout" element={
            <Checkout 
              currentOrder={currentOrder}
              setCurrentOrder={setCurrentOrder}
            />
          } />
          <Route path="/" element={
            <h1 className="text-3xl font-bold text-center text-white">
              Welcome to E-commerce
            </h1>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;