# Farmilky - Frontend Web Client 🥛

Farmilky is a premium, full-stack milk and dairy product delivery application designed for seamless user experiences. This repository contains the frontend client, built entirely using **React**, **Vite**, and **Tailwind CSS**. It provides a blazing-fast, optimistic UI for browsing products, managing a cart, handling subscriptions, checking out, and tracking orders.

---

## 🚀 Built With
* **Framework:** React 19 (Hooks, Context)
* **Build Tool:** Vite (For lightning-fast HMR and optimized production bundles)
* **Styling:** Tailwind CSS v4 (Utility-first CSS framework for rapid UI development)
* **State Management:** Redux Toolkit
* **Data Fetching:** RTK Query (Handles API caching, optimistic UI updates, and synchronization)
* **Routing:** React Router v7
* **Notifications:** React Hot Toast
* **Icons:** React Icons

---

## 📂 Project Structure

```text
frontend/
├── public/                 # Static assets like favicons and images
├── src/
│   ├── components/         # Reusable UI components (ProductCard, Navbar, Footer, etc.)
│   ├── features/
│   │   ├── api/            # RTK Query API slices (authApi, cartApi, orderApi, etc.)
│   │   └── authSlice.js    # Standard Redux slice for authentication state
│   ├── pages/              # Full-page view components (Home, Cart, Checkout, MyOrders)
│   ├── App.jsx             # Main application entry point and Router provider
│   ├── index.css           # Global Tailwind and custom CSS styles
│   └── main.jsx            # React DOM rendering and Redux Provider wrapper
├── .env                    # Local environment variables
├── package.json            # Frontend dependency and script definitions
├── tailwind.config.js      # Tailwind theme customizations
└── vite.config.js          # Vite build configurations
```

---

## 🌟 Core Features
* **Optimistic UI Updates:** Redux RTK Query intercepts `addToCart` and `updateCart` mutations, updating the local UI cache *before* the server responds so users instantly see their cart updates.
* **Dynamic Delivery Tracking:** The `MyOrders` and `OrderSuccess` components dynamically calculate "Expected Delivery" and swap automatically to "Arriving Today!" without needing constant backend polling.
* **Persistent Authentication:** Fully leverages HTTP-only cookies managed via the backend for highly secure, frictionless login/registration flows.
* **Responsive Design:** Completely mobile-friendly shopping layouts, checkout grids, and navigation drawers implemented with Tailwind CSS.

---

## 🛠️ Local Development Setup

To run the Farmilky frontend on your local machine, follow these steps:

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root of the `frontend` directory. If you are running the Node.js backend locally on port 4000, your config should look like this:
   ```env
   VITE_REACT_APP_BACKEND_BASEURL=http://localhost:4000
   ```
   *(Note: This variable tells RTK Query where to route the `/api/*` endpoints during local development)*

3. **Start the Vite Development Server:**
   ```bash
   npm run dev
   ```
   This will start the application locally, typically on `http://localhost:5173`. Open your browser to view the application!

4. **Build for Production:**
   To compile and minify the assets for deployment:
   ```bash
   npm run build
   ```

---

## 🌐 Deployment Architecture (Vercel)

This frontend is designed to be deployed as a standalone static site on Vercel. 

To deploy:
1. Push this `frontend` directory to its own GitHub repository.
2. Link the repository to your Vercel account.
3. The included `vercel.json` file automatically enables Single Page Application (SPA) tracking, so React Router works perfectly when users refresh a page.
4. Add the `VITE_REACT_APP_BACKEND_BASEURL` environment variable to your Vercel project settings, explicitly pointing it to your deployed Backend URL (e.g., `https://farmilky-backend.vercel.app`).
