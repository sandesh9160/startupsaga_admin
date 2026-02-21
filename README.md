# StartupSaga Admin Console (CMS)

## 🎛️ Overview

The **StartupSaga Admin Console** is a powerful Content Management System (CMS) built with **Next.js 15**. It empowers administrators and editors to manage stories, startups, categories, and system-wide settings through a seamless, modern interface.

Unlike traditional Django Admin panels, this console offers a fully customized, client-side rendered experience with rich text editing, real-time analytics, and AI integration.

---

## 🛠️ Tech Stack & Dependencies

This application is built on the **React** ecosystem, leveraging the following key technologies:

| Component | Library | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15** | App Router, Server Actions, API Routes |
| **Language** | **TypeScript** | Strict typing for API responses and component props |
| **UI Components** | **Shadcn UI** | Accessible, headless UI primitives (Radix) |
| **Charts** | **Recharts** | Data visualization for Dashboard analytics |
| **Editor** | **Tiptap** | Headless, extensible Rich Text Editor (WYSIWYG) |
| **Forms** | **React Hook Form** | Performant form state management and validation |
| **Validation** | **Zod** | Schema validation for forms and API data |
| **Icons** | **Lucide React** | Consistent SVG iconography |
| **Animations** | **Framer Motion** | Smooth UI transitions and interactions |

---

## 📂 Project Structure

```bash
admin/
├── src/
│   ├── app/
│   │   ├── dashboard/       # Protected routes (CMS Main Interface)
│   │   ├── (auth)/          # Public routes (Login)
│   │   ├── layout.tsx       # Root layout with Sidebar and Theme Provider
│   │   └── page.tsx         # Redirects
│   │
│   ├── components/
│   │   ├── dashboard/       # Dashboard specific widgets (Stats, Sidebar)
│   │   ├── ui/              # Shared UI components (Buttons, Inputs, Cards)
│   │   └── RichTextEditor.tsx # Custom Tiptap implementation
│   │
│   └── lib/
│       ├── api.ts           # Centralized API client (fetches from Backend)
│       └── utils.ts         # Helper functions (cn, formatters)
│
├── public/                  # Static assets
└── next.config.mjs          # Next.js configuration
```

---

## 🚀 Key Features

*   **Unified Content Dashboard:** Visualize platform metrics (Total Stories, Active Startups) at a glance.
*   **Prompt Master:** Create and manage AI prompts used for generating SEO metadata and content.
*   **Media Library:** Managing uploaded assets.
*   **Settings Management:** Configure site identity (Logo, Name), footer links, and SEO defaults without redeployment.
*   **Menu Builder:** Drag-and-drop or form-based builder for site navigation menus.

---

## ⚙️ Configuration

### Environment Variables

The Admin Console communicates with the Backend API. Ensure `.env.local` exists in the root of the `admin` directory:

```env
# URL of the running Django Backend
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

# Public URL of the main website (for previews)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Authentication
The admin panel uses session-based authentication or JWT (depending on backend configuration) to secure `/dashboard` routes. Ensure a superuser exists in the Django backend (`python manage.py createsuperuser`).

---

## 🏃‍♂️ Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Access the console at `http://localhost:3000/dashboard` (or port 3001 if frontend is running).

3.  **Build for Production:**
    ```bash
    npm run build
    npm start
    ```
