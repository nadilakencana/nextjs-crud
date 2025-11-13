import NextAuth, {AuthOptions} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions: AuthOptions = {
  adapter : PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {label: "Email", type: "text"},
        password: {label:"Password", type:"password"},
      },
      async authorize(credentials){
        if(!credentials?.email || !credentials?.password){
          return null
        }
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })
        if(!user || !user.password){
          return null
        }
       const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (isPasswordValid) {
          // Hanya kembalikan data penting yang dibutuhkan session
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }

        return null;
      
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login", // Halaman login kustom
  },
  callbacks: {
    async jwt({ token, user }) {
      // Masukkan ID user ke token JWT
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Masukkan ID user ke Session
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
}
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };