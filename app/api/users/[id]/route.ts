import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Liste des rôles valides pour la validation manuelle
const VALID_ROLES = ["ADMIN", "OFFICIER_ETAT_CIVIL", "MEDECIN", "OPJ", "PROCUREUR", "VIEWER", "CITOYEN"]

// GET: Récupérer un utilisateur unique (Aucun changement nécessaire ici, mais inclus pour la complétude)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }, 
) {
  try {
    // VÉRIFICATION CRITIQUE DE L'ID MANQUANT
    if (!params.id) {
        console.error("Error fetching user: Missing ID in parameters.");
        return NextResponse.json({ error: "ID utilisateur manquant ou invalide" }, { status: 400 })
    }
    
    const session = await getServerSession(authOptions)
    
    // Vérification de permission: Admin ou l'utilisateur lui-même
    if (!session || (!session.user?.roles.includes("ADMIN") && session.user?.id !== params.id)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        email: true,
        roles: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
        isUsing2FA: true,
        accountNonLocked: true,
        accountNonExpired: true,
        credentialsNonExpired: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

// PUT: Mettre à jour (Modifier rôles, statut, email/username, ou mot de passe)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // VÉRIFICATION CRITIQUE DE L'ID MANQUANT
    if (!params.id) {
        return NextResponse.json({ error: "ID utilisateur manquant ou invalide" }, { status: 400 })
    }
    
    const session = await getServerSession(authOptions)

    // Vérification de permission: Seul un ADMIN peut modifier d'autres utilisateurs
    if (!session || !session.user?.roles.includes("ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    // Extraction du nouveau mot de passe pour le gérer séparément
    const { username, email, roles, enabled, newPassword } = body
    
    const dataToUpdate: any = {}
    
    let userUpdateNeeded = false;
    let passwordUpdateSuccess = false;
    
    // 1. Préparer les données pour la mise à jour du modèle User
    if (username !== undefined) {
        if (typeof username !== 'string' || username.length < 1) {
            return NextResponse.json({ error: "Nom d'utilisateur est requis." }, { status: 400 })
        }
        dataToUpdate.username = username
        userUpdateNeeded = true;
    }
    
    if (email !== undefined) {
        if (typeof email !== 'string' || !email.includes('@')) {
            return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 })
        }
        dataToUpdate.email = email
        userUpdateNeeded = true;
    }
    
    if (roles !== undefined) {
        if (!Array.isArray(roles) || roles.length === 0 || !roles.every(role => VALID_ROLES.includes(role))) {
             return NextResponse.json({ error: "Rôles invalides spécifiés." }, { status: 400 })
        }
        dataToUpdate.roles = roles
        userUpdateNeeded = true;
    }

    if (enabled !== undefined) {
        if (typeof enabled !== 'boolean') {
             return NextResponse.json({ error: "Le statut d'activation est invalide." }, { status: 400 })
        }
        dataToUpdate.enabled = enabled
        userUpdateNeeded = true;
    }
    
    // 2. Gestion de la réinitialisation du mot de passe (Mise à jour dans la table Account)
    if (newPassword) {
        if (typeof newPassword !== 'string' || newPassword.length < 8) {
            return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères." }, { status: 400 })
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        
        // Mettre à jour l'enregistrement Account de type 'credentials'
        const accountUpdateResult = await prisma.account.updateMany({
            where: {
                userId: params.id,
                type: "credentials",
                provider: "credentials", 
            },
            data: {
                // Stockage du hachage dans le champ access_token (selon votre pattern)
                access_token: hashedPassword, 
            }
        });

        if (accountUpdateResult.count > 0) {
            passwordUpdateSuccess = true;
        } else {
             // Vous pourriez choisir de créer l'entrée ici si elle n'existe pas,
             // mais pour une simple réinitialisation, un avertissement suffit.
             console.warn(`Aucun enregistrement 'credentials' trouvé pour l'utilisateur ${params.id}. Réinitialisation du mot de passe ignorée.`);
        }
    }
    
    // 3. Exécuter la mise à jour du modèle User si nécessaire
    let finalUser;

    if (userUpdateNeeded) {
        finalUser = await prisma.user.update({
            where: { id: params.id },
            data: dataToUpdate,
            select: {
                id: true,
                username: true,
                email: true,
                roles: true,
                enabled: true,
            },
        })
    } else if (passwordUpdateSuccess) {
         // Si seul le mot de passe a été mis à jour, on renvoie les détails actuels de l'utilisateur
         finalUser = await prisma.user.findUnique({
             where: { id: params.id },
             select: {
                id: true,
                username: true,
                email: true,
                roles: true,
                enabled: true,
             }
        });
        
        if (!finalUser) {
             return NextResponse.json({ error: "Utilisateur non trouvé après mise à jour du mot de passe" }, { status: 404 })
        }
    }

    // Si aucune donnée User n'a été mise à jour ET que le mot de passe n'a pas été mis à jour
    if (!userUpdateNeeded && !passwordUpdateSuccess) {
         return NextResponse.json({ error: "Aucune donnée de mise à jour valide fournie." }, { status: 400 })
    }


    return NextResponse.json(finalUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

// DELETE: Supprimer un utilisateur (aucun changement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // VÉRIFICATION CRITIQUE DE L'ID MANQUANT
    if (!params.id) {
        return NextResponse.json({ error: "ID utilisateur manquant ou invalide" }, { status: 400 })
    }
    
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.roles.includes("ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Utilisateur supprimé" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
