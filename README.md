
# Bookera Frontend Client

A responsive, high-performance web client for **Bookera**, an e-commerce marketplace for buying and selling books, featuring real-time chat, secure Stripe checkout, and an interactive AI book assistant.

## 🚀 Technology Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19 & TypeScript
- **Styling:** TailwindCSS v4 (Sleek modern design)
- **Animations:** Framer Motion (Fluid transitions and micro-interactions)
- **State Management:** TanStack Query (React Query) (Server-state caching)
- **Authentication:** `@react-oauth/google` (Google Sign-In)
- **Payments:** `@stripe/stripe-js` (Stripe Checkout integration)
- **Real-Time messaging:** Socket.io-client
- **UI Components:** Radix UI primitives & Lucide Icons
- **Notifications:** Sonner
- **Cloud Analytics/Messaging:** Firebase

---

## 🔑 Key Features

### 1. Modern E-Commerce UI
- Clean, intuitive book listing feed displaying book covers, condition details, and pricing.
- Advanced client-side filtering by genre, price range, book condition, and author.
- Responsive, grid-based layouts optimized for desktop, tablet, and mobile browsers.

### 2. Conversational AI Assistant Interface
- Interactive, slide-out chat interface to converse with **Kera**, the AI Book Assistant.
- Markdown rendering for rich-text responses (titles, bullet lists, blockquotes, bolding, external links).
- Automated chat limits displayed to the user based on daily usage quotas.

### 3. Real-Time Chat & Inbox
- Dedicated Chat Inbox interface displaying active conversations between buyers and sellers.
- Instant, WebSocket-driven messaging using **Socket.io-client** with live typing indicators.
- Live notifications for new messages received while browsing other sections of the app.

### 4. Secure Payments Integration
- Secure checkout process integrating **Stripe elements**.
- Direct redirects to payment success/error landing pages with transaction verification.
