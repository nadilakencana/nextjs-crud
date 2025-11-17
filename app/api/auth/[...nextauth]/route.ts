import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "../../../generated/prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

// ==================== NEXTAUTH CONFIGURATION ====================
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔐 Login attempt:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          console.log('❌ User not found or no password');
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (isPasswordValid) {
          console.log('✅ Login successful for:', user.email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }

        console.log('❌ Invalid password');
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
}

const nextAuthHandler = NextAuth(authOptions);

// ==================== CUSTOM API HANDLERS ====================

// LOGIN API - Returns JSON with token
async function handlerLogin(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: "Email dan password harus diisi" 
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.password) {
      return NextResponse.json({ 
        success: false, 
        message: "Email atau password salah" 
      }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ 
        success: false, 
        message: "Email atau password salah" 
      }, { status: 401 })
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.NEXTAUTH_SECRET || "secret",
      { expiresIn: "24h" }
    )

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Server error" 
    }, { status: 500 })
  }
}

// REGISTER API - Returns JSON
async function handlerRegister(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Email sudah terdaftar"
      }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error("Error saat registrasi:", error);
    return NextResponse.json({
      success: false,
      message: "Server error"
    }, { status: 500 });
  }
}

// ==================== ROUTE HANDLERS ====================

export async function POST(request: Request, { params }: { params: { nextauth: string[] } }) {
  const url = new URL(request.url);

  // Custom API endpoints
  if (url.pathname.endsWith("auth/regist")) {
    return handlerRegister(request);
  }
  
  if (url.pathname.endsWith("auth/login")) {
    return handlerLogin(request);
  }

  // Default NextAuth endpoints
  return nextAuthHandler(request, { params });
}

export async function GET(request: Request, { params }: { params: { nextauth: string[] } }) {
  return nextAuthHandler(request, { params });
}