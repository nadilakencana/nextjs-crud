# 📚 Dokumentasi Authentication Flow - Next.js + NextAuth + Prisma

## 🎯 Overview
Dokumentasi lengkap tentang bagaimana authentication bekerja di Next.js menggunakan NextAuth.js dan Prisma ORM.

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │    │   (NextAuth)    │    │   (PostgreSQL)  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Login Form    │◄──►│ • Authentication│◄──►│ • Users Table   │
│ • Register Form │    │ • Session Mgmt  │    │ • Password Hash │
│ • Session Check │    │ • JWT Tokens    │    │ • User Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📁 File Structure & Routing

### File-Based Routing (Next.js App Router)
```
app/
├── 🏠 page.tsx                           → http://localhost:3000/
├── 🔐 login/
│   └── page.tsx                         → http://localhost:3000/login
├── 📝 register/
│   └── page.tsx                         → http://localhost:3000/register
├── 🔧 api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts                 → http://localhost:3000/api/auth/*
├── ⚙️ providers.tsx                     → Session Provider
└── 🎨 layout.tsx                        → Root Layout
```

### Penjelasan Routing:
- **Folder** = URL path segment
- **page.tsx** = Halaman yang di-render
- **[...nextauth]** = Catch-all dynamic route
- **route.ts** = API endpoint handler

---

## 🔄 Authentication Flow Diagram

### 1. Registration Flow
```mermaid
graph TD
    A[User buka /register] --> B[Render register/page.tsx]
    B --> C[User isi form]
    C --> D[Submit form]
    D --> E[fetch /api/auth/regist]
    E --> F[handlerRegister function]
    F --> G[Hash password dengan bcrypt]
    G --> H[Save ke database via Prisma]
    H --> I[Return success response]
    I --> J[Redirect ke /login]
```

### 2. Login Flow
```mermaid
graph TD
    A[User buka /login] --> B[Render login/page.tsx]
    B --> C[User isi form]
    C --> D[Submit form]
    D --> E[signIn credentials]
    E --> F[NextAuth panggil authorize]
    F --> G[Verify password dengan bcrypt]
    G --> H[Create JWT token]
    H --> I[Set httpOnly cookie]
    I --> J[Redirect ke /]
```

### 3. Session Management Flow
```mermaid
graph TD
    A[User akses halaman] --> B[useSession hook]
    B --> C[Cek JWT cookie]
    C --> D{Token valid?}
    D -->|Yes| E[Return user data]
    D -->|No| F[Return null]
    E --> G[Render authenticated UI]
    F --> H[Render login prompt]
```

---

## 🔧 Komponen Utama

### 1. NextAuth.js
**Fungsi:** Authentication framework untuk Next.js
```typescript
// Fitur utama:
- Session management
- JWT token handling
- Cookie security
- Provider integration
- Callback customization
```

### 2. Prisma ORM
**Fungsi:** Database toolkit dan ORM
```typescript
// Fitur utama:
- Type-safe database queries
- Schema management
- Migration handling
- Connection pooling
```

### 3. bcryptjs
**Fungsi:** Password hashing library
```typescript
// Fitur utama:
- Hash passwords securely
- Compare hashed passwords
- Salt generation
- Configurable rounds
```

---

## 🔐 Security Implementation

### Password Security
```typescript
// Saat Register:
const hashedPassword = await bcrypt.hash(password, 10)
// 10 = salt rounds (recommended minimum)

// Saat Login:
const isValid = await bcrypt.compare(inputPassword, hashedPassword)
```

### JWT Token Security
```typescript
// Token creation:
const token = jwt.sign(
  { userId, email },           // Payload
  process.env.NEXTAUTH_SECRET, // Secret key
  { expiresIn: "24h" }         // Expiration
)
```

### Cookie Security
```typescript
// NextAuth automatically sets:
- httpOnly: true     // Prevent XSS
- secure: true       // HTTPS only (production)
- sameSite: "lax"    // CSRF protection
```

---

## 📊 Database Schema

### User Model (Prisma)
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String    // Hashed dengan bcrypt
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  products      Product[]
  
  @@map("users")
}
```

---

## 🛠️ API Endpoints

### Authentication Endpoints

| Method | Endpoint | Fungsi | Response |
|--------|----------|--------|----------|
| `POST` | `/api/auth/regist` | User registration | JSON |
| `POST` | `/api/auth/login` | Custom login (JWT) | JSON + Token |
| `POST` | `/api/auth/signin` | NextAuth login | Cookie + Redirect |
| `GET` | `/api/auth/session` | Get current session | JSON |
| `POST` | `/api/auth/signout` | Logout user | Cookie clear |

### Custom vs NextAuth Endpoints

#### Custom API (untuk Mobile/API clients):
```bash
# Register
POST /api/auth/regist
Content-Type: application/json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}

# Response
{
  "success": true,
  "message": "Registrasi berhasil",
  "user": { "id": "...", "name": "...", "email": "..." }
}

# Login
POST /api/auth/login
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "password123"
}

# Response
{
  "success": true,
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

#### NextAuth API (untuk Web App):
```javascript
// Login
import { signIn } from "next-auth/react"
const result = await signIn("credentials", {
  email: "john@example.com",
  password: "password123",
  redirect: false
})

// Get Session
import { useSession } from "next-auth/react"
const { data: session, status } = useSession()

// Logout
import { signOut } from "next-auth/react"
await signOut()
```

---

## 🎨 Frontend Components

### Session Provider Setup
```typescript
// app/providers.tsx
"use client"
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### Session Usage in Components
```typescript
"use client"
import { useSession, signOut } from "next-auth/react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Loading...</p>
  if (!session) return <p>Please login</p>
  
  return (
    <div>
      <h1>Welcome {session.user?.name}</h1>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  )
}
```

---

## ⚙️ Environment Variables

### Required Variables
```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Variable Explanations:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: JWT signing secret (min 32 characters)
- `NEXTAUTH_URL`: Base URL of your application

---

## 🔄 State Management

### Session States
```typescript
type SessionStatus = "loading" | "authenticated" | "unauthenticated"

// Usage
const { data: session, status } = useSession()

switch (status) {
  case "loading":
    return <LoadingSpinner />
  case "authenticated":
    return <AuthenticatedContent session={session} />
  case "unauthenticated":
    return <LoginPrompt />
}
```

### Form State Management
```typescript
// Register/Login forms
const [formData, setFormData] = useState({
  email: "",
  password: "",
  name: "" // Only for register
})

const [loading, setLoading] = useState(false)
const [error, setError] = useState("")
```

---

## 🚀 Deployment Considerations

### Production Environment
```bash
# Production .env
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="super-secure-secret-key-32-chars-min"
DATABASE_URL="postgresql://user:pass@prod-db:5432/db"
```

### Security Checklist
- ✅ Use HTTPS in production
- ✅ Set strong NEXTAUTH_SECRET
- ✅ Enable database SSL
- ✅ Set proper CORS headers
- ✅ Use environment variables
- ✅ Enable rate limiting

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "SessionProvider not found"
```typescript
// Solution: Wrap app with SessionProvider
// File: app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

#### 2. "Cannot destructure property 'nextauth'"
```typescript
// Solution: Fix route handler parameters
export async function POST(
  request: Request, 
  { params }: { params: { nextauth: string[] } }
) {
  return nextAuthHandler(request, { params })
}
```

#### 3. "Database connection failed"
```bash
# Solution: Check DATABASE_URL format
DATABASE_URL="postgresql://username:password@host:port/database"
```

#### 4. "JWT token invalid"
```bash
# Solution: Set proper NEXTAUTH_SECRET
NEXTAUTH_SECRET="your-32-character-secret-key-here"
```

---

## 📈 Performance Optimization

### Database Optimization
```typescript
// Use connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Index on email for faster lookups
// In schema.prisma:
model User {
  email String @unique // Automatically creates index
}
```

### Session Optimization
```typescript
// Minimize session data
callbacks: {
  async session({ session, token }) {
    // Only include necessary data
    return {
      ...session,
      user: {
        id: token.sub,
        email: token.email,
        name: token.name
      }
    }
  }
}
```

---

## 🧪 Testing

### API Testing with curl
```bash
# Test Registration
curl -X POST http://localhost:3000/api/auth/regist \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Frontend Testing
```typescript
// Test session in component
import { useSession } from "next-auth/react"

export default function TestComponent() {
  const { data: session, status } = useSession()
  
  console.log("Session status:", status)
  console.log("Session data:", session)
  
  return <div>Check console for session info</div>
}
```

---

## 📚 Additional Resources

### Documentation Links
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

### Best Practices
- Always hash passwords before storing
- Use environment variables for secrets
- Implement proper error handling
- Add loading states for better UX
- Use TypeScript for type safety
- Implement rate limiting for APIs

---

## 🏁 Kesimpulan

Authentication flow di Next.js dengan NextAuth dan Prisma melibatkan:

1. **Frontend**: React components dengan forms dan session management
2. **Backend**: NextAuth handlers untuk authentication logic
3. **Database**: Prisma ORM untuk data persistence
4. **Security**: bcrypt untuk password hashing, JWT untuk tokens

Flow utama: **UI Form → NextAuth → Database → Session → Cookies → UI Update**

Sistem ini memberikan authentication yang aman, scalable, dan mudah di-maintain untuk aplikasi Next.js modern.

---

*Dokumentasi ini dibuat untuk membantu pemahaman lengkap tentang authentication flow di Next.js. Update sesuai kebutuhan project Anda.*