import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Calendar, Mail, User, Clock, Link as LinkIcon, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { Separator } from "@/components/ui/separator";

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Administrateur";
    case "OFFICIER_ETAT_CIVIL":
      return "Officier d'État Civil";
    case "MEDECIN":
      return "Médecin";
    case "OPJ":
      return "Officier de Police Judiciaire";
    case "PROCUREUR":
      return "Procureur";
    case "CITOYEN":
        return "Citoyen";
    case "VIEWER":
      return "Observateur";
    default:
      return role;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "destructive";
    case "OFFICIER_ETAT_CIVIL":
      return "default";
    case "MEDECIN":
      return "secondary";
    case "OPJ":
      return "outline";
    case "PROCUREUR":
      return "primary";
    case "CITOYEN":
      return "default";
    case "VIEWER":
      return "secondary";
    default:
      return "outline";
  }
};

export default async function UserDetailsPage({ params }: { params: { id: string } }) {
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
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/users">
              Retour à la liste
            </Link>
          </Button>
          <RoleGuard permission="users.write">
            <Button asChild>
              <Link href={`/dashboard/users/${user.id}/edit`}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Modifier l'utilisateur
              </Link>
            </Button>
          </RoleGuard>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Nom d'utilisateur: <strong>{user.username}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>Email: <strong>{user.email}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Créé le: <strong>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Dernière mise à jour: <strong>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("fr-FR") : "Jamais"}</strong></span>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">Statut et rôles</h3>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Le statut Actif/Bloqué est géré par 'enabled' */}
              <Badge variant={user.enabled ? "default" : "destructive"} className="flex items-center">
                <Lock className="h-3 w-3 mr-1" /> {user.enabled ? "Actif" : "Bloqué"}
              </Badge>
              {/* Affichage de tous les rôles */}
              {user.roles.map((role) => (
                <Badge key={role} variant={getRoleColor(role) as any}>
                  {getRoleLabel(role)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détails de Sécurité du Compte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Compte non expiré:</span>
              <Badge variant={user.accountNonExpired ? "default" : "destructive"}>
                {user.accountNonExpired ? "Oui" : "Non"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Compte non verrouillé:</span>
              <Badge variant={user.accountNonLocked ? "default" : "destructive"}>
                {user.accountNonLocked ? "Oui" : "Non"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Identifiants non expirés:</span>
              <Badge variant={user.credentialsNonExpired ? "default" : "destructive"}>
                {user.credentialsNonExpired ? "Oui" : "Non"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Authentification à deux facteurs (2FA):</span>
              <Badge variant={user.isUsing2FA ? "default" : "secondary"}>
                {user.isUsing2FA ? "Activé" : "Désactivé"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}