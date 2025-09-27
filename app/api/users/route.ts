import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Liste des rôles valides pour la validation manuelle
const VALID_ROLES = ["ADMIN", "OFFICIER_ETAT_CIVIL", "MEDECIN", "OPJ", "PROCUREUR", "VIEWER", "CITOYEN"]

// GET: Récupérer tous les utilisateurs avec filtre et recherche
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.roles.includes("ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    let whereClause: any = {}

    // 1. Filtrer par rôle
    if (role && role !== "all") {
      whereClause.roles = {
        has: role,
      }
    }

    // 2. Recherche par nom d'utilisateur ou email
    if (search) {
      whereClause.OR = [
        {
          username: {
            contains: search,
            mode: "insensitive", // Recherche insensible à la casse
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ]
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        roles: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        username: "asc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if the user is authenticated and has the ADMIN role
    // You should adapt this based on your specific role-based access control (RBAC) logic.
    if (!session || !session.user.roles.includes("ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { name, email, password, role, department, position } = await request.json()

    // Basic validation to ensure required fields are present
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })
    }

    // Check if a user with the same email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: name } // Assuming 'name' from the form is used as the 'username' in the DB
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Un utilisateur avec cet email ou nom existe déjà." }, { status: 409 })
    }

    // Securely hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
      username: name,
      email,
      roles: [role],
      ...(department ? { department } : {}),
      ...(position ? { position } : {}),
      },
      select: {
      id: true,
      username: true,
      email: true,
      roles: true,
      },
    })

    // Create corresponding credentials/account record and store the hashed password there
    await prisma.account.create({
      data: {
      userId: newUser.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: newUser.email,
      access_token: hashedPassword,
      },
    })

    // Return the newly created user object with a 201 status
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}