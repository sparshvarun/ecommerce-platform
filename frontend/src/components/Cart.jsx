import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Cart({ updateCart }) {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [token, navigate]);

  const fetchCart = async () => {
    try {
      const response = await axios.get('http://localhost:3000/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(response.data.items || []);
      updateCart(response.data);
    } catch (error) {
      setError('Failed to fetch cart');
      setCartItems([]);
      updateCart({ items: [] });
    }
  };

  const addToCart = async () => {
    try {
      setError(null);
      const response = await axios.post(
        'http://localhost:3000/cart',
        { productId: 'prod1', quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.items || []);
      updateCart(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add product to cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setError(null);
      const response = await axios.delete(`http://localhost:3000/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(response.data.items || []);
      updateCart(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to remove product from cart');
    }
  };

  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Your Cart</h2>
        <button
          onClick={addToCart}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 mb-4"
          disabled={!token}
        >
          Add Test Product (prod1) to Cart
        </button>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {cartItems.map((item, index) => (
                <li key={index} className="p-2 border-b border-gray-200 flex justify-between items-center">
                  <span>Test Product (Rs. 10), Quantity: {item.quantity}</span>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition duration-300"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
            >
              Proceed to Checkout
            </button>
          </>
        )}
        {!token && <p className="text-center text-red-500">Please log in to manage your cart.</p>}
      </div>
    </div>
  );
}

export default Cart;