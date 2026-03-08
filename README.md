# GadyetHub

## What this project does

A modern e-commerce marketplace platform for electronics and accessories, built with Next.js, TypeScript, and Supabase. It provides both a customer‑facing storefront and an admin dashboard, complete with authentication, product management, order workflows, and a responsive dark/light UI.

## Why it’s useful

This starter kit is intended for developers who want a working, full‑stack e‑commerce example using the latest Next.js features. It can be used as:

- A learning resource to understand client/server integration with Supabase
- A foundation for launching your own store or adapting to other domains
- A reusable template with authentication, admin tooling, and real‑time updates

## Table of Contents

- [Key features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Development](#development)
- [Contributing](#contributing)

## Key features

**Customer-Facing Features**

- **Responsive Design** – Navbar on desktop, collapsible sidebar on mobile/tablet
- **Product Browsing** – Browse products by category with detailed product pages
- **Shopping Cart** – Add items to cart and manage orders
- **Order Management** – View and track your orders
- **Notifications** – Real-time notifications and alerts
- **Dark/Light Mode** – Theme toggle for user preference

**Admin Dashboard**

- **Dashboard Overview** – High-level business metrics and KPIs
- **Orders Management** – View, filter, and update order statuses
- **Inventory Management** – Add, edit, and delete products; manage stock levels
- **User Management** – View and manage customer accounts
- **Notifications Panel** – Monitor system events and alerts

**Authentication & Authorization**

- Email/password authentication via Supabase Auth
- Role-based access control (Customer / Admin)
- Session persistence with secure cookies
- Protected routes and API endpoints

## Tech Stack

**Frontend**

- [Next.js 16](https://nextjs.org) – React framework with App Router
- [React 19](https://react.dev) – UI library
- [TypeScript](https://www.typescriptlang.org) – Type-safe code
- [Tailwind CSS 4](https://tailwindcss.com) – Utility-first styling
- [Radix UI](https://radix-ui.com) – Headless components (dialogs, dropdowns, tooltips)
- [Lucide React](https://lucide.dev) – Icon library
- [Next Themes](https://next-themes.js.org) – Dark mode support

**State & Data**

- [Zustand](https://zustand-demo.pmnd.rs/) – Lightweight state management
- [@tanstack/react-table](https://tanstack.com/table/) – Headless table component
- [Sonner](https://sonner.emilkowal.ski/) – Toast notifications

**Backend & Database**

- [Supabase](https://supabase.com) – PostgreSQL + Auth + Real-time APIs
- [@supabase/supabase-js](https://github.com/supabase/supabase-js) – JS client
- [@supabase/ssr](https://github.com/supabase/ssr) – Server-side rendering support

**Developer Tools**

- [ESLint 9](https://eslint.org) – Code linting
- [TypeScript 5](https://www.typescriptlang.org) – Type checking

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18+ or v20+ ([Download](https://nodejs.org))
- **npm** or **yarn** (comes with Node.js)
- **Supabase Account** – [Sign up free](https://supabase.com)
- **Git** for version control

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/zidvsd/gadyethub.git
   cd gadyethub
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

## Environment Setup

Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
# Supabase Public Keys (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional server‑side secret (used for service‑role operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Navigate to **Settings → API** in the sidebar
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `Anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Add these values to `.env.local`

### Database Setup

The application expects the following Supabase tables:

- **users** – Customer and admin profiles
- **products** – Product catalog with name, price, stock, image_path
- **orders** – User orders with status and total_price
- **order_items** – Line items linking orders to products

Refer to your Supabase database schema documentation or create tables using the SQL Editor in your Supabase dashboard.

## Running Locally

### Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

### Run Linter

```bash
npm run lint
```

## Project Structure

```
gadyethub/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth routes (login, signup)
│   ├── (withSidebar)/             # Customer routes with navbar/sidebar
│   │   ├── cart/
│   │   ├── inbox/
│   │   ├── products/[category]/
│   │   └── page.tsx               # Home page
│   ├── admin/                     # Admin dashboard (protected)
│   │   ├── dashboard/
│   │   │   ├── inventory/         # Product management
│   │   │   ├── orders/            # Order management
│   │   │   ├── users/             # User management
│   │   │   ├── notifications/
│   │   │   └── page.tsx
│   │   └── settings/
│   ├── api/                       # API Routes
│   │   ├── admin/                 # Admin endpoints (protected)
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   └── users/
│   │   ├── auth/                  # Authentication endpoints
│   │   │   ├── login/
│   │   │   └── signin/
│   │   ├── client/                # Customer endpoints
│   │   │   ├── orders/
│   │   │   └── user/
│   │   └── products/              # Public product endpoints
│   ├── layout.tsx                 # Root layout with Footer
│   ├── globals.css                # Global styles
│   └── page.tsx                   # Root page
├── components/
│   ├── AppSidebar.tsx             # Navigation sidebar
│   ├── client/
│   │   └── Navbar.tsx             # Top navigation bar
│   ├── admin/
│   │   └── ProductsList.tsx       # Admin product list
│   ├── ui/                        # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── sidebar.tsx
│   │   └── ...
│   └── Footer.tsx                 # Site footer
├── hooks/
│   └── use-mobile.ts              # Responsive design hook
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Client-side Supabase client
│   │   ├── server.ts              # Server-side Supabase client
│   │   └── session.ts             # Session utilities
│   ├── types/
│   │   ├── orders.ts              # Order TypeScript interfaces
│   │   └── products.ts            # Product TypeScript interfaces
│   ├── layoutMenus.tsx            # Navigation menu definitions
│   └── utils.ts                   # Helper functions
├── store/
│   ├── useOrders.tsx              # Zustand orders store
│   └── useProducts.tsx            # Zustand products store
├── public/                        # Static assets
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Project dependencies
```

## API Routes

### Products (Public)

- `GET /api/products` – Fetch all products
- `GET /api/products/[id]` – Fetch single product

### Admin Routes (Protected)

- `GET /api/admin/orders` – Get all orders
- `POST /api/admin/orders` – Create order
- `GET /api/admin/orders/[id]` – Get order details
- `PATCH /api/admin/orders/[id]` – Update order
- `GET /api/admin/products` – Get products
- `POST /api/admin/products` – Create product
- `PATCH /api/admin/products/[id]` – Update product
- `DELETE /api/admin/products/[id]` – Delete product
- `GET /api/admin/users` – Get all users
- `GET /api/admin/users/[id]` – Get user details

### Customer Routes (Protected)

- `GET /api/client/orders` – Fetch customer's orders
- `POST /api/client/orders` – Create order
- `GET /api/client/orders/[id]` – Fetch order details
- `GET /api/client/user` – Fetch user profile

### Authentication

- `POST /api/auth/login` – Login with email/password
- `POST /api/auth/signin` – Sign up new account

## Development

### Key Technologies & Patterns

**Component Architecture**

- Server components by default; use `"use client"` for interactivity
- Reusable UI components from `components/ui/`
- Custom hooks in `hooks/` for shared logic

**State Management**

- **Zustand stores** (`store/`) for products and orders
- **Local state** (React hooks) for form handling
- **Supabase real-time** for live updates

**Styling**

- Tailwind CSS for utility-first styling
- CSS modules for component-specific styles (if needed)
- Dark mode support via Next Themes

**Type Safety**

- Full TypeScript support
- Type definitions in `lib/types/`
- Strict mode enabled

### Common Development Tasks

**Add a new page**

1. Create file in `app/(withSidebar)/` or `app/admin/`
2. Use route-specific layout or create custom layout
3. Import components and data as needed

**Add a new API endpoint**

1. Create file in `app/api/<scope>/`
2. Export async handler (GET, POST, PATCH, DELETE)
3. Use `requireAdmin()` utility for admin routes
4. Return standardized response: `{ success: boolean, data?: any, error?: string }`

**Add a new component**

1. Create file in `components/`
2. Use Radix UI components for headless UI
3. Import Lucide icons for consistent iconography
4. Add TypeScript props interface

**Fetch data from Zustand store**

```tsx
import { useProducts } from "@/store/useProducts";

export default function MyComponent() {
  const { products, loading, error, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  return <div>{/* render products */}</div>;
}
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m 'Add feature'`
4. **Push** to your branch: `git push origin feature/your-feature`
5. **Open** a Pull Request with a clear description

### Code Style

- Use TypeScript for new code
- Follow ESLint rules: `npm run lint`
- Use Tailwind CSS for styling
- Keep components focused and reusable
- Add JSDoc comments for complex logic

## Support & Documentation

- **Issues** – Report bugs or request features via GitHub Issues
- **Next.js Docs** – [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs** – [supabase.com/docs](https://supabase.com/docs)
- **Tailwind Docs** – [tailwindcss.com/docs](https://tailwindcss.com/docs)

## License

This project does not include a license file; add one or contact the maintainer.

---

**Maintainer**: [@zidvsd](https://github.com/zidvsd)

Built with Next.js, React, and Supabase.
