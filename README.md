# Farmilky - Frontend Web Client 🥛

Farmilky is a premium, full-stack milk and dairy product delivery application designed for seamless user experiences. This repository contains the customer-facing frontend, built entirely using **React 19**, **Vite**, and **Tailwind CSS v4**. It provides a fast, optimistic UI for browsing products, managing a cart, handling subscriptions, checking out, tracking orders, filing complaints, and viewing passbook balances.

---

## 🚀 Built With
* **Framework:** React 19 (Hooks, Context, lazy-loaded routes)
* **Build Tool:** Vite 7 (fast HMR and optimized production bundles)
* **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` (utility-first CSS)
* **State Management:** Redux Toolkit + RTK Query (API caching, optimistic UI updates, re-auth handling)
* **Routing:** React Router v7
* **Notifications:** React Hot Toast
* **Icons:** Lucide React
* **Maps:** Leaflet + React Leaflet

---

## 📂 Project Structure

```text
frontend/
├── public/                     # Static assets (logo, hero images)
├── src/
│   ├── app/                    # Redux store, baseQueryWithReauth, cache resets
│   ├── assets/                 # Project icons/assets
│   ├── components/             # Reusable UI (Navbar, Footer, Hero, Cards, Loaders...)
│   ├── features/
│   │   ├── api/                # RTK Query slices (auth, cart, order, subscription,
│   │   │                       #  product, passbook, complaint, return, contact)
│   │   └── authSlice.js        # Redux slice for authentication state
│   ├── hooks/                  # useDocumentTitle
│   ├── pages/                  # Route-level page components
│   ├── utils/                  # formatCurrency
│   ├── App.jsx                 # Routes + Providers (lazy pages)
│   ├── index.css               # Global Tailwind + custom styles
│   └── main.jsx                # React DOM rendering + Redux Provider
├── .env                        # Local environment variables
├── package.json
├── vercel.json                 # SPA rewrites
└── vite.config.js
```

---

## 🌟 Core Features
* **Optimistic UI Updates:** RTK Query intercepts `addToCart` / `updateCart` mutations and updates the local cache before the server responds.
* **Session Re-Auth:** `baseQueryWithReauth` refreshes authentication and resets user-scoped cache on re-login/role change (`src/app/`).
* **Dynamic Delivery Tracking:** Order and subscription pages compute the next delivery and surface "Arriving Today!" states without constant polling.
* **Persistent Authentication:** HTTP-only cookies managed by the backend; `ProtectedRoute` guards account areas.
* **Customer Service:** File and track complaints and returns; view the passbook ledger and contact the team.
* **Lazy-Loaded Pages:** Every page is code-split; `Suspense` shows a branded loader.
* **Responsive Design:** Mobile-first shopping, checkout, and navigation built with Tailwind.

---

## 🗺️ Routes

| Path                  | Page                     | Access |
| --------------------- | ------------------------ | ------ |
| `/`                   | Home                     | Public |
| `/why-farmilky`       | Why Farmilky             | Public |
| `/contact`            | Contact                  | Public |
| `/order`              | Order Now (product pick) | Public |
| `/product/:id`        | Product Detail           | Public |
| `/cart`               | Cart                     | Public |
| `/login`, `/signup`   | Auth                     | Public |
| `/subscribe`          | Subscription plan        | Logged in |
| `/checkout`           | Checkout                 | Logged in |
| `/order-success/:id`  | Order confirmation       | Logged in |
| `/my-orders`, `/my-orders/:id` | Orders list/detail | Logged in |
| `/subscriptions`, `/subscriptions/:id` | My subscriptions | Logged in |
| `/passbook`           | Account passbook         | Logged in |
| `/profile`            | Profile                  | Logged in |
| `/my-complaints`      | My complaints            | Logged in |
| `/raise-complaint`    | Raise a complaint        | Logged in |
| `*`                   | 404                      | Public |

---

## 🛠️ Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the `frontend` directory pointing at your backend:
   ```env
   VITE_REACT_APP_BACKEND_BASEURL=http://localhost:4000
   ```

3. **Start the Vite dev server:**
   ```bash
   npm run dev
   ```
   The app runs on `http://localhost:5173`.

4. **Lint the code:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🌐 Deployment (Vercel)
1. Push this `frontend` directory to its own GitHub repository.
2. Link the repository to your Vercel account.
3. `vercel.json` rewrites all routes to `index.html`, so React Router works on refresh/deep links.
4. Add the `VITE_REACT_APP_BACKEND_BASEURL` environment variable to your Vercel project, pointing to the deployed backend URL (e.g. `https://farmilky-backend.vercel.app`).

---

## 🔗 Related Projects
- **backend/** - Express + MongoDB REST API powering this client
- **farmilky-management/** - Staff/admin portal (orders, subscriptions, deliveries, suppliers, etc.)