"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile/profile-form"
import { ProfileImageUpload } from "@/components/profile/profile-image-upload"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Shield, Calendar, Mail, Hash } from "lucide-react"

interface UserProfileData {
  id: string;
  username: string;
  email: string;
  image: string | null;
  roles: any;
  createdAt: string;
}

interface ProfilePageClientWrapperProps {
  initialProfile: UserProfileData;
}

export function ProfilePageClientWrapper({ initialProfile }: ProfilePageClientWrapperProps) {

  const [profile, setProfile] = useState<UserProfileData>(initialProfile);

  const handleImageUpdate = (newImage: string) => {
    setProfile(prev => ({
      ...prev,
      image: newImage,
    }));
  };

  // Callback pour mettre à jour l'état local après modification du formulaire
  const handleProfileUpdate = (updatedData: any) => {
    setProfile(prev => ({
      ...prev,
      username: updatedData.username,
      email: updatedData.email,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-muted-foreground mt-1">Gérez vos informations personnelles et vos préférences de compte.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">

        {/* Left Column: Identity Card */}
        <div className="md:col-span-4 space-y-6">
          <Card className="overflow-hidden border-2 shadow-sm">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400 relative">
              <div className="absolute overflow-hidden -bottom-12 left-1/2 -translate-x-1/2 p-1 bg-background rounded-full">
                <ProfileImageUpload
                  currentImage={profile.image || null}
                  username={profile.username}
                  onImageUpdated={handleImageUpdate}
                />
              </div>
            </div>
            <CardHeader className="pt-14 text-center pb-6">
              <CardTitle className="text-2xl">{profile.username}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-1">
                <Mail className="h-3 w-3" /> {profile.email}
              </CardDescription>
              <div className="pt-4 flex flex-wrap justify-center gap-2">
                {Array.isArray(profile.roles) && profile.roles.map((role: string) => (
                  <Badge key={role} variant="secondary" className="uppercase text-xs font-bold tracking-wider">
                    {role.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Sécurité & Accès
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-md shadow-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Identifiant Unique</p>
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">{profile.id}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-md shadow-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Membre depuis</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(profile.createdAt).toLocaleDateString("fr-FR", { dateStyle: 'long' })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-8">
          <Card className="h-full border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informations Personnelles
              </CardTitle>
              <CardDescription>
                Mettez à jour vos informations de base.
              </CardDescription>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent>
              <ProfileForm
                initialData={{
                  username: profile.username,
                  email: profile.email,
                }}
              />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}