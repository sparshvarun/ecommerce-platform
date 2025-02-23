# E-commerce Platform

This project is a full-stack e-commerce platform built with a **Node.js/Express** backend and a **React** frontend. It allows users to register, log in, add products to a cart, and place orders, with data stored in **MongoDB**. The backend provides RESTful APIs, secured with JWT authentication, while the frontend offers a user-friendly interface.

## Features
- **User Registration**: Create an account with full name, email, and password.
- **User Login**: Authenticate users and receive a JWT token.
- **Cart Management**: Add products to the cart, view cart, and remove items.
- **Order Placement**: Place orders with items from the cart and a shipping address.
- **Product Seeding**: Seed the database with test products.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt.js
- **Frontend**: React, React Router, Axios, Tailwind CSS
- **Database**: MongoDB Atlas

## Prerequisites
- Node.js (v20.x or later recommended)
- MongoDB Atlas account (or local MongoDB instance)
- Postman (for API testing)

## Project Structure
ecommerce-platform/
├── backend/
│   ├── server.js         # Backend server code
│   ├── .env             # Environment variables (not in Git)
│   └── package.json     # Backend dependencies
├── src/                 # Frontend source code
│   ├── components/      # React components (Cart, Checkout, etc.)
│   ├── App.js           # Main React app
│   ├── index.js         # Entry point
│   ├── index.css        # Tailwind CSS styles
│   └── package.json     # Frontend dependencies
└── README.md            # This file

## Setup Instructions

### Backend
1. **Navigate to the Backend Directory:**
   cd backend
Install Dependencies:

npm install
Configure Environment Variables:
Create a .env file in the backend/ directory:

touch .env
Add the following:
MONGO_URI=mongodb+srv://varunk41:ecom@ecommerce.sdx5b.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerce
JWT_SECRET=<your-secret-key>
Run the Server:

node server.js
Expected output:
Connected to MongoDB Atlas
Server running on port 3000
API Endpoints
POST /register: Register a new user
POST /login: Log in and get a JWT token
POST /seed-products: Seed test products
GET /products: List all products (public)
POST /cart: Add a product to the cart (authenticated)
GET /cart: View the cart (authenticated)
DELETE /cart/:productId: Remove a product from the cart (authenticated)
POST /orders: Place an order (authenticated)
Testing with Postman
A Postman Collection is provided to test all API endpoints related to user registration, login, adding products to the cart, and placing orders.
Postman Collection Instructions
Copy the Collection:
Click the button below to copy the Postman Collection JSON to your clipboard:
<button onclick="navigator.clipboard.writeText(`{
  "info": {
"name": "E-commerce API Updated",
"description": "A Postman collection to test the e-commerce platform APIs.",
"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
{
  "name": "Register User",
  "request": {
    "method": "POST",
    "header": [{"key": "Content-Type", "value": "application/json", "type": "text"}],
    "body": {
      "mode": "raw",
      "raw": "{\"fullName\": \"John Doe\", \"email\": \"john.doe@example.com\", \"password\": \"password123\"}"
    },
    "url": "http://localhost:3000/register"
  }
},
{
  "name": "Login User",
  "event": [{
    "listen": "test",
    "script": {
      "exec": [
        "pm.test(\"Login successful and token received\", function () {",
        "    pm.response.to.have.status(200);",
        "    var jsonData = pm.response.json();",
        "    pm.expect(jsonData.token).to.exist;",
        "    pm.environment.set(\"token\", jsonData.token);",
        "    console.log(\"Token set:\", jsonData.token);",
        "});"
      ],
      "type": "text/javascript"
    }
  }],
  "request": {
    "method": "POST",
    "header": [{"key": "Content-Type", "value": "application/json", "type": "text"}],
    "body": {
      "mode": "raw",
      "raw": "{\"email\": \"john.doe@example.com\", \"password\": \"password123\"}"
    },
    "url": "http://localhost:3000/login"
  }
},
{
  "name": "Seed Products",
  "request": {
    "method": "POST",
    "header": [],
    "url": "http://localhost:3000/seed-products"
  }
},
{
  "name": "Get Products",
  "request": {
    "method": "GET",
    "header": [],
    "url": "http://localhost:3000/products"
  }
},
{
  "name": "Add Product to Cart",
  "event": [{
    "listen": "prerequest",
    "script": {
      "exec": ["console.log(\"Using token:\", pm.environment.get(\"token\"));"],
      "type": "text/javascript"
    }
  }],
  "request": {
    "method": "POST",
    "header": [
      {"key": "Content-Type", "value": "application/json", "type": "text"},
      {"key": "Authorization", "value": "Bearer {{token}}", "type": "text"}
    ],
    "body": {
      "mode": "raw",
      "raw": "{\"productId\": \"prod1\", \"quantity\": 1}"
    },
    "url": "http://localhost:3000/cart"
  }
},
{
  "name": "Get Cart",
  "request": {
    "method": "GET",
    "header": [{"key": "Authorization", "value": "Bearer {{token}}", "type": "text"}],
    "url": "http://localhost:3000/cart"
  }
},
{
  "name": "Remove Product from Cart",
  "request": {
    "method": "DELETE",
    "header": [{"key": "Authorization", "value": "Bearer {{token}}", "type": "text"}],
    "url": "http://localhost:3000/cart/prod1"
  }
},
{
  "name": "Place Order",
  "request": {
    "method": "POST",
    "header": [
      {"key": "Content-Type", "value": "application/json", "type": "text"},
      {"key": "Authorization", "value": "Bearer {{token}}", "type": "text"}
    ],
    "body": {
      "mode": "raw",
      "raw": "{\"shippingAddress\": \"123 Main St, City, Country\"}"
    },
    "url": "http://localhost:3000/orders"
  }
}
  ],
  "variable": [
{"key": "token", "value": "", "type": "string", "description": "JWT token from login"}
  ]
}`)">Copy Postman Collection</button><script>
  document.querySelector('button').addEventListener('click', () => alert('Postman Collection copied to clipboard!'));
</script>
Note: GitHub renders this as raw HTML, enabling the copy functionality when viewed on the web.
Import into Postman:
Open Postman > Click Import > Paste the copied JSON into Raw Text > Click Import.
The collection "E-commerce API Updated" will appear in your sidebar.
Set Up Environment:
Go to Environments > Click + > Name it "E-commerce Local".
Add variable: token (leave Initial and Current values blank).
Save and select "E-commerce Local" from the top-right dropdown.
Test the Endpoints:
Register User: POST /register → 201 Created
Login User: POST /login → 200 OK (sets token)
Seed Products: POST /seed-products → 200 OK
Add Product to Cart: POST /cart → 200 OK with cart object
Get Cart: GET /cart → 200 OK
Place Order: POST /orders → 201 Created
Remove Product from Cart: DELETE /cart/prod1 → 200 OK
