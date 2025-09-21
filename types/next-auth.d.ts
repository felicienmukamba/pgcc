import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      roles: Role[]
      image?: string
    }
  }

  interface User {
    id: string
    email: string
    username: string
    roles: Role[]
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles: Role[]
    username: string
  }
}
