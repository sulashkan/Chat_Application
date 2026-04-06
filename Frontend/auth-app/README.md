# Auth App — Vite + TypeScript + React

A production-ready authentication UI matching the glassmorphic sky design, with full API integration and OAuth support.

---

## Folder Structure

```
auth-app/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios instance + interceptors (token injection, 401 handling)
│   │   └── auth.ts            # All auth API calls (register, login, protected, OAuth)
│   │
│   ├── components/
│   │   └── auth/
│   │       ├── AuthCard.tsx           # Reusable card wrapper
│   │       ├── AuthCard.module.css
│   │       ├── InputField.tsx         # Controlled input with icon support
│   │       ├── InputField.module.css
│   │       ├── OAuthButtons.tsx       # Google / Facebook / Apple OAuth
│   │       └── OAuthButtons.module.css
│   │
│   ├── context/
│   │   └── AuthContext.tsx    # Global auth state (user, token, setAuth, logout)
│   │
│   ├── hooks/
│   │   └── useAuthForm.ts     # Login + register logic with loading/error state
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx  # Protected — shows token copy + GET /api/protected
│   │   ├── OAuthCallbackPage.tsx  # Handles /auth/callback?token=&user=
│   │   └── AuthPages.module.css
│   │
│   ├── types/
│   │   └── auth.ts            # TypeScript interfaces
│   │
│   ├── utils/
│   │   └── ProtectedRoute.tsx # Route guard (redirects to /login if unauthenticated)
│   │
│   ├── App.tsx                # Router setup
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit VITE_API_URL to point to your backend

# 3. Start dev server
npm run dev
```

---

## API Integration

### Endpoints used

| Method | Endpoint              | Description                      |
|--------|-----------------------|----------------------------------|
| POST   | `/api/auth/register`  | Register new user, returns token |
| POST   | `/api/auth/login`     | Login, returns token             |
| GET    | `/api/protected`      | Protected route (requires token) |
| GET    | `/api/auth/oauth/:provider` | OAuth redirect (Google/Facebook/Apple) |

### Token handling

- Token is stored in `localStorage` as `auth_token`
- Automatically attached to every request via Axios request interceptor
- On 401 response: token is cleared and user is redirected to `/login`
- Dashboard has a **Copy Token** button

### OAuth Flow

1. User clicks Google / Facebook / Apple button
2. Browser redirects to `GET /api/auth/oauth/:provider` on your backend
3. After consent, backend redirects to `/auth/callback?token=xxx&user=<base64-json>`
4. `OAuthCallbackPage` decodes the user, sets auth state, navigates to `/dashboard`

---

## Routes

| Path              | Access    | Description          |
|-------------------|-----------|----------------------|
| `/login`          | Public    | Login form           |
| `/register`       | Public    | Registration form    |
| `/auth/callback`  | Public    | OAuth return handler |
| `/dashboard`      | Protected | Token + user info    |
