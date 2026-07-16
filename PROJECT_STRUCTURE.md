# Vishwa Patrakar Mahasangh - Project Structure & Directory Guidelines

This document details the file directory mappings, module responsibilities, coding styles, and instructions for adding new features.

---

## Directory Mappings

```text
/ (root)
├── backend/
│   ├── src/
│   │   ├── config/          # Mailer and global configuration setup
│   │   ├── database/        # Mongoose connections
│   │   ├── models/          # Central database schemas (User.js, OTP.js, AuditLog.js)
│   │   ├── middlewares/     # Auth checks, multer upload config
│   │   ├── utils/           # Helper scripts (cloudinary.js)
│   │   ├── modules/         # Modular domain routes, controllers, and services
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── member/
│   │   │   └── payment/
│   │   ├── app.js           # Server application initialization
│   │   └── server.js        # DB connect & startup listener
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static media, logos, background images
│   │   ├── api/             # Split API modules and central index.ts exporter
│   │   ├── components/
│   │   │   ├── common/      # Generic layouts (Navbar, Footer, Layout)
│   │   │   └── ui/          # Raw reusable effects (Tilt, GlobeCanvas)
│   │   ├── features/        # Feature components and UI logic
│   │   ├── App.tsx          # Client-side router mappings
│   │   ├── main.tsx         # Main entry file
│   │   └── index.css        # Tailwind style entry
│   ├── vite.config.ts
│   └── tsconfig.json
```

---

## Coding Conventions & Naming Guidelines

- **Backend Modules**: Inside any module in `backend/src/modules/<name>/`, use the format `<name>.<type>.js`:
  - `auth.routes.js` for routes.
  - `auth.controller.js` for handler triggers.
  - `auth.service.js` for database logic.
- **Central Models**: Use PascalCase for mongoose models under `backend/src/models/` (e.g. `User.js`, `OTP.js`).
- **Frontend Features**: Capitalize feature page files (e.g., `Login.tsx`, `Registration.tsx`). Place helper components under `features/<feature_name>/components/` if needed.
- **Path Aliasing**: Always prefer `@/` imports instead of relative paths (e.g., `@/components/common/Navbar` instead of `../../components/common/Navbar`).

---

## Guide: How to Add a New Feature

When creating a new feature (e.g., a "News Feed" module):

### 1. Backend Integration
1. Define any required schema inside `backend/src/models/` if it requires database storage.
2. Create a new module folder under `backend/src/modules/news-feed/`.
3. Add `news-feed.service.js`, `news-feed.controller.js`, and `news-feed.routes.js`.
4. Register the new router in `backend/src/app.js`:
   ```javascript
   import newsFeedRouter from "./modules/news-feed/index.js";
   app.use("/api/news-feed", newsFeedRouter);
   ```

### 2. Frontend Integration
1. Define the API request handlers inside a new file `frontend/src/api/news-feed.api.ts`.
2. Export the new functions in `frontend/src/api/index.ts`.
3. Create a feature folder `frontend/src/features/news-feed/` and add UI components (e.g. `NewsFeed.tsx`).
4. Mount the routes inside `frontend/src/App.tsx`.
