import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Checkout({ currentOrder, setCurrentOrder }) {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Please log in to proceed to checkout');
        navigate('/login');
        return;
      }
      try {
        const cartResponse = await axios.get('http://localhost:3000/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(cartResponse.data);

        const productsResponse = await axios.get('http://localhost:3000/products');
        setProducts(productsResponse.data);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to load checkout data');
      }
    };
    fetchData();
  }, [token, navigate]);

  const calculateTotal = () => {
    if (!cart || !cart.items || !products.length) return 0;
    return cart.items.reduce((total, item) => {
      const product = products.find((p) => p.productId === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!shippingAddress) {
      setMessage('Please enter a shipping address');
      return;
    }
    if (!cart || !cart.items || cart.items.length === 0) {
      setMessage('Your cart is empty. Add items to proceed.');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:3000/orders',
        { shippingAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Order response:', response.data); // Debug log
      setCurrentOrder(response.data.order); // Set order in parent state
      setCart({ items: [] });
      setShippingAddress('');
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Checkout failed');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full p-6 bg-white rounded-lg shadow-lg">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full p-6 bg-white rounded-lg shadow-lg">
        {currentOrder ? (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Order Confirmation</h2>
            <p className="text-green-600 text-center">Order placed successfully</p>
            <div className="mt-6 p-4 border border-green-500 rounded">
              <p>Order ID: {currentOrder._id}</p>
              <p>Total: Rs. {currentOrder.totalPrice.toFixed(2)}</p>
              <p>Shipping Address: {currentOrder.shippingAddress}</p>
              <p>Order Status: {currentOrder.orderStatus}</p>
              <p>Payment Status: {currentOrder.paymentStatus}</p>
              <ul className="list-none p-0">
                {currentOrder.products.map((item, index) => {
                  const product = products.find((p) => p.productId === item.productId);
                  return (
                    <li key={index} className="p-2 border-b border-gray-200">
                      {product ? product.name : item.productId}, Quantity: {item.quantity}, Price: Rs. {item.price}
                    </li>
                  );
                })}
              </ul>
            </div>
            <button
              onClick={() => {
                setCurrentOrder(null); // Clear order to allow new checkout
                navigate('/cart');
              }}
              className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
            >
              Back to Cart
            </button>
          </div>
        ) : !token ? (
          <p className="text-red-500 text-center">Please log in to checkout.</p>
        ) : !cart || !cart.items || cart.items.length === 0 ? (
          <p className="text-gray-600 text-center">Your cart is empty. Add items to proceed.</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Checkout</h2>
            <h3 className="text-xl font-semibold mb-2 text-center">Review Your Cart</h3>
            <ul className="list-none p-0">
              {cart.items.map((item, index) => {
                const product = products.find((p) => p.productId === item.productId);
                return (
                  <li key={index} className="p-2 border-b border-gray-200">
                    {product ? `${product.name} (Rs. ${product.price})` : item.productId}, Quantity: {item.quantity}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 font-bold text-center">Total: Rs. {calculateTotal().toFixed(2)}</p>
            <form onSubmit={handleCheckout} className="mt-4">
              <label className="block mb-2">
                Shipping Address:
                <textarea
                  className="w-full h-20 mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your shipping address"
                  required
                />
              </label>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
              >
                Place Order
              </button>
            </form>
          </>
        )}
        {message && (
          <p className={`mt-2 text-center ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Checkout;