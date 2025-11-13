// NEXTAUTH IMPORTS
import NextAuth, {AuthOptions} from "next-auth" // Core NextAuth dan types
import CredentialsProvider from "next-auth/providers/credentials" // Provider untuk email/password
import { PrismaAdapter } from "@auth/prisma-adapter" // Adapter untuk koneksi database
import { PrismaClient } from "../../../generated/prisma/client" // Prisma client dari generated folder
import bcrypt from "bcryptjs" // Library untuk hash/compare password


// DATABASE CONNECTION
// Membuat instance Prisma Client untuk koneksi ke database
const prisma = new PrismaClient()

// NEXTAUTH CONFIGURATION
// Konfigurasi utama NextAuth dengan semua pengaturan autentikasi
export const authOptions: AuthOptions = {
  // DATABASE ADAPTER
  // Menghubungkan NextAuth dengan database melalui Prisma
  adapter : PrismaAdapter(prisma),
  
  // AUTHENTICATION PROVIDERS
  // Daftar metode login yang tersedia (bisa multiple providers)
  providers: [
    // CREDENTIALS PROVIDER
    // Provider untuk login dengan email/password
    CredentialsProvider({
      name: "Credentials", // Nama provider yang ditampilkan
      
      // FORM FIELDS CONFIGURATION
      // Mendefinisikan field input untuk form login
      credentials: {
        email: {label: "Email", type: "text"}, // Field email dengan label dan type
        password: {label:"Password", type:"password"}, // Field password (hidden)
      },
      
      // AUTHORIZATION FUNCTION
      // Fungsi yang dipanggil saat user submit form login
      async authorize(credentials){

        // STEP 1: INPUT VALIDATION
        // Cek apakah email dan password ada/tidak kosong
        if(!credentials?.email || !credentials?.password){
          return null // Return null = login gagal
        }
        
        // STEP 2: DATABASE LOOKUP
        // Cari user di database berdasarkan email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email // Cari berdasarkan email yang diinput
          }
        })
        
        // STEP 3: USER EXISTENCE CHECK
        // Cek apakah user ditemukan dan punya password
        if(!user || !user.password){
          return null // User tidak ditemukan atau tidak punya password
        }
        
        // STEP 4: PASSWORD VERIFICATION
        // Bandingkan password input dengan hash di database
       const isPasswordValid = await bcrypt.compare(
          credentials.password, // Password yang diinput user
          user.password // Password hash dari database
        );

        // STEP 5: RETURN RESULT
        if (isPasswordValid) {
          // Password benar - return user data untuk session
          return {
            id: user.id, // ID user (wajib untuk NextAuth)
            name: user.name, // Nama user
            email: user.email, // Email user
          };
        }

        return null; // Password salah - login gagal
      
      },
    }),
  ],
  
  // SESSION CONFIGURATION
  // Pengaturan bagaimana session disimpan
  session: {
    strategy: "jwt", // Menggunakan JWT token (bukan database session)
  },
  
  // CUSTOM PAGES
  // Redirect ke halaman custom alih-alih default NextAuth
  pages: {
    signIn: "/login", // Halaman login kustom di /login
  },
  
  // CALLBACKS
  // Fungsi yang dipanggil pada event tertentu untuk memodifikasi data
  callbacks: {
    // JWT CALLBACK
    // Dipanggil saat JWT token dibuat/diperbarui
    async jwt({ token, user }) {
      // Saat login pertama kali, user object tersedia
      if (user) {
        token.email = user.email; // Simpan email ke JWT token
      }
      return token; // Return token yang sudah dimodifikasi
    },
    
    // SESSION CALLBACK
    // Dipanggil saat session diakses (getSession, useSession)
    async session({ session, token }) {
      // Transfer data dari JWT token ke session object
      if (token && session.user) {
        session.user.email = token.email as string; // Ambil email dari token
      }
      return session; // Return session yang sudah dimodifikasi
    },
  },
}

// NEXTAUTH HANDLER
// Membuat handler NextAuth dengan konfigurasi di atas
const handler = NextAuth(authOptions);

// EXPORT HANDLERS
// Export handler untuk HTTP GET dan POST requests
// Next.js App Router membutuhkan named exports untuk HTTP methods
export { handler as GET, handler as POST };

/*
FLOW AUTENTIKASI:

1. USER SUBMIT FORM LOGIN
   ↓
2. NextAuth panggil authorize() function
   ↓
3. authorize() validasi credentials dan return user data
   ↓
4. NextAuth panggil jwt() callback untuk buat JWT token
   ↓
5. JWT token disimpan di browser (httpOnly cookie)
   ↓
6. Saat akses session, NextAuth panggil session() callback
   ↓
7. session() callback return data yang bisa diakses komponen

KENAPA BUTUH CALLBACKS:
- jwt() callback: Untuk menyimpan data tambahan ke JWT token
- session() callback: Untuk mengambil data dari JWT dan expose ke komponen
- Tanpa callbacks, session hanya berisi data default (name, email, image)

STRATEGY JWT vs DATABASE:
- JWT: Token disimpan di browser, stateless, cocok untuk serverless
- Database: Session disimpan di database, stateful, lebih secure
*/