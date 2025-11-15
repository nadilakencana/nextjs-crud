"use client" ;
// File ini berisi komponen Providers yang berfungsi sebagai wrapper untuk menyediakan session authentication
// Directive "use client" menandakan bahwa komponen ini akan dirender di sisi client
"use client";

// Import SessionProvider dari next-auth/react untuk mengelola state autentikasi
import { SessionProvider } from "next-auth/react";

// Komponen Providers menerima props children bertipe React.ReactNode
// Komponen ini membungkus children dengan SessionProvider agar dapat mengakses session auth di komponen child
export function Providers({ children } : { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider> ;
}
