"use client";

import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Key } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleGuard } from "@/components/auth/role-guard";
import Link from "next/link";

type UserData = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  enabled: boolean;
};

const allAvailableRoles = [
  { value: "ADMIN", label: "Administrateur" },
  { value: "OFFICIER_ETAT_CIVIL", label: "Officier d'État Civil" },
  { value: "MEDECIN", label: "Médecin" },
  { value: "OPJ", label: "Officier de Police Judiciaire" },
  { value: "PROCUREUR", label: "Procureur" },
  { value: "VIEWER", label: "Observateur" },
  { value: "CITOYEN", label: "Citoyen" },
];

// Composant simplifié pour la sélection du rôle (suppose un rôle principal)
const RoleSelect = ({ selected, onChange }: { selected: string[], onChange: (roles: string[]) => void }) => {
    const primaryRole = selected[0] || 'VIEWER';
    
    return (
        <Select 
            value={primaryRole} 
            onValueChange={(newRole) => onChange(newRole ? [newRole] : [])} // Envoie un tableau avec le rôle unique
        >
            <SelectTrigger>
                <SelectValue placeholder="Sélectionner le rôle" />
            </SelectTrigger>
            <SelectContent>
                {allAvailableRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};


export default function UserEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordResetting, setIsPasswordResetting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    roles: [] as string[],
    enabled: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
  });

  // 1. Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            return notFound();
          }
          throw new Error("Failed to fetch user data");
        }
        const userData: UserData = await res.json();
        setUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email,
          roles: userData.roles,
          enabled: userData.enabled,
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  // 2. Handle General Information Update (Username, Email, Roles, Enabled/Blocked)
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
    }));
  };

  const handleEnabledChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, enabled: checked }));
  };

  const handleRolesChange = (newRoles: string[]) => {
    setFormData((prev) => ({ ...prev, roles: newRoles }));
  };


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSend = {
          username: formData.username,
          email: formData.email,
          roles: formData.roles,
          enabled: formData.enabled,
      };

      const res = await fetch(`/api/users/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Échec de la mise à jour de l'utilisateur.");
      }

      // Mise à jour de l'état local pour refléter les changements
      setUser(prev => prev ? {...prev, ...dataToSend} : null);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  // 3. Handle Password Reset
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordResetting(true);
    try {
        const dataToSend = { newPassword: passwordForm.newPassword };

        const res = await fetch(`/api/users/${params.id}`, {
            method: "PUT", // Utilise la même route PUT que la mise à jour
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Échec de la réinitialisation du mot de passe.");
        }

        setPasswordForm({ newPassword: "" }); // Vider le champ
    } catch (error: any) {
        console.error("Error:", error);
    } finally {
        setIsPasswordResetting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return notFound();
  }

  return (
    <RoleGuard permission="users.write">
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Modifier l'utilisateur {user.username}</h1>
                    <p className="text-muted-foreground">Mettez à jour les informations du compte et les permissions.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/dashboard/users/${user.id}`}>Retour aux détails</Link>
                </Button>
            </div>

            {/* General Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations Générales et Rôles</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Nom d'utilisateur</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="roles">Rôle principal</Label>
                            <RoleSelect 
                                selected={formData.roles}
                                onChange={handleRolesChange}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="enabled"
                                name="enabled"
                                checked={formData.enabled}
                                onCheckedChange={handleEnabledChange}
                            />
                            <Label htmlFor="enabled">Compte activé (décocher pour bloquer l'utilisateur)</Label>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sauvegarder les modifications
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Password Reset Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Key className="mr-2 h-5 w-5" />
                        Réinitialiser le mot de passe
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength={8}
                                placeholder="Entrer le nouveau mot de passe (min. 8 caractères)"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button 
                                type="submit" 
                                variant="destructive" 
                                disabled={isPasswordResetting || passwordForm.newPassword.length < 8}
                            >
                                {isPasswordResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Réinitialiser le mot de passe
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    </RoleGuard>
  );
}