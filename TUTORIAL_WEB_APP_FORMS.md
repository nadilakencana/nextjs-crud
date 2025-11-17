# Tutorial: Bikin Web App Form Login & Register dengan NextAuth

## Overview
Tutorial ini menjelaskan cara membuat form login dan register untuk web app menggunakan NextAuth.js dengan Next.js App Router.

## Struktur File yang Dibutuhkan
```
app/
├── api/auth/[...nextauth]/route.ts ✅ (sudah ada)
├── login/page.tsx (akan dibuat)
├── register/page.tsx (akan dibuat)
├── page.tsx (akan diupdate)
├── layout.tsx (akan diupdate)
└── providers.tsx ✅ (sudah ada)
```

---

## Step 1: Setup NextAuth Provider

### File: `app/providers.tsx` (sudah ada)
```typescript
"use client"
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

**Penjelasan:**
- `"use client"` → Karena SessionProvider butuh client-side rendering
- `SessionProvider` → Wrapper untuk share session ke semua component
- `children` → Semua component di dalam provider bisa akses session

### Update File: `app/layout.tsx`
```typescript
import { Providers } from './providers'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**Penjelasan:**
- Wrap semua app dengan `Providers` agar semua page bisa akses session
- Import providers dari file yang sudah dibuat

---

## Step 2: Bikin Halaman Register

### File: `app/register/page.tsx`
```typescript
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  // State untuk menyimpan data form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })
  
  // State untuk loading indicator
  const [loading, setLoading] = useState(false)
  
  // Router untuk redirect setelah register berhasil
  const router = useRouter()

  // Function untuk handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent page reload
    setLoading(true)

    try {
      // Kirim data ke API register
      const response = await fetch('/api/auth/regist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        alert('Registrasi berhasil!')
        router.push('/login') // Redirect ke halaman login
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert('Error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Register</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Nama Lengkap"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Sudah punya akun? <Link href="/login">Login di sini</Link>
      </p>
    </div>
  )
}
```

**Penjelasan:**
- `useState` → Untuk menyimpan data form dan loading state
- `useRouter` → Untuk redirect setelah register berhasil
- `fetch` → Untuk kirim data ke API `/api/auth/regist`
- `e.preventDefault()` → Mencegah page reload saat submit form
- `...formData` → Spread operator untuk update state tanpa mengubah state lain

---

## Step 3: Bikin Halaman Login

### File: `app/login/page.tsx`
```typescript
"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  // State untuk menyimpan data form
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  
  // State untuk loading indicator
  const [loading, setLoading] = useState(false)
  
  // Router untuk redirect setelah login berhasil
  const router = useRouter()

  // Function untuk handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Menggunakan NextAuth signIn function
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false // Jangan auto redirect, kita handle sendiri
      })

      if (result?.ok) {
        alert('Login berhasil!')
        router.push('/') // Redirect ke home page
      } else {
        alert('Login gagal! Periksa email dan password Anda.')
      }
    } catch (error) {
      alert('Error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Login</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px', 
            backgroundColor: loading ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Belum punya akun? <Link href="/register">Register di sini</Link>
      </p>
    </div>
  )
}
```

**Penjelasan:**
- `signIn` → NextAuth function untuk login
- `redirect: false` → Biar kita yang handle redirect, bukan NextAuth
- `result?.ok` → Cek apakah login berhasil
- Menggunakan NextAuth karena lebih aman dan terintegrasi dengan session

---

## Step 4: Update Home Page dengan Session

### File: `app/page.tsx`
```typescript
"use client"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function HomePage() {
  // Hook untuk mendapatkan session data
  const { data: session, status } = useSession()

  // Loading state
  if (status === "loading") {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Loading...</p>
      </div>
    )
  }

  // Jika user sudah login
  if (session) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <h1>Welcome to Our App!</h1>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h2>Hello, {session.user?.name}! 👋</h2>
          <p><strong>Email:</strong> {session.user?.email}</p>
          <p><strong>Status:</strong> Logged In</p>
        </div>
        
        <button 
          onClick={() => signOut()}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Logout
        </button>
      </div>
    )
  }

  // Jika user belum login
  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to Our App!</h1>
      <p>Please login or register to continue</p>
      
      <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <Link 
          href="/login"
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          Login
        </Link>
        
        <Link 
          href="/register"
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          Register
        </Link>
      </div>
    </div>
  )
}
```

**Penjelasan:**
- `useSession` → Hook untuk mendapatkan data session user
- `status` → Status session (loading, authenticated, unauthenticated)
- `signOut` → NextAuth function untuk logout
- Conditional rendering berdasarkan status login

---

## Flow Kerja Aplikasi

### 1. Register Flow:
```
User mengisi form → Submit → API /api/auth/regist → Database → Redirect ke /login
```

### 2. Login Flow:
```
User mengisi form → Submit → NextAuth signIn → Verify credentials → Create session → Redirect ke /
```

### 3. Session Management:
```
Setiap page load → useSession → Cek session → Show appropriate content
```

---

## Dependencies yang Dibutuhkan

```bash
npm install next-auth
npm install @types/bcryptjs bcryptjs
npm install jsonwebtoken @types/jsonwebtoken
```

---

## Testing

### 1. Test Register:
1. Buka `http://localhost:3000/register`
2. Isi form dan submit
3. Harus redirect ke `/login`

### 2. Test Login:
1. Buka `http://localhost:3000/login`
2. Login dengan akun yang sudah dibuat
3. Harus redirect ke `/` dan show user info

### 3. Test Session:
1. Setelah login, refresh page
2. User info harus tetap muncul (session persistent)
3. Click logout, harus kembali ke state belum login

---

## Troubleshooting

### Error: "SessionProvider not found"
- Pastikan `Providers` sudah di-wrap di `layout.tsx`

### Error: "signIn is not a function"
- Pastikan sudah install `next-auth`
- Pastikan import `signIn` dari `next-auth/react`

### Error: "useSession returns null"
- Pastikan NextAuth route sudah benar di `/api/auth/[...nextauth]/route.ts`
- Pastikan environment variables sudah di-set

---

## File Structure Final

```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts ✅
├── login/
│   └── page.tsx ✅
├── register/
│   └── page.tsx ✅
├── layout.tsx ✅
├── page.tsx ✅
├── providers.tsx ✅
└── globals.css
```

Selamat! Sekarang Anda punya web app dengan authentication lengkap! 🎉