"use client"

import { useState } from 'react';
import { Card } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile/profile-form" 
import { ProfileImageUpload } from "@/components/profile/profile-image-upload" 

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
    console.log("Image de profil mise à jour localement:", newImage); 
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-bold">Mon Profil</h1>
      </div>
      <Card className="md:grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
        <div className="md:col-span-1 flex flex-col items-center justify-center p-6">
          <ProfileImageUpload
            currentImage={profile.image || null} 
            username={profile.username}
            onImageUpdated={handleImageUpdate} 
          />
        </div>

        <ProfileForm
          initialData={{
            username: profile.username,
            email: profile.email,
          }}
        />
      </Card>
      
      <div className="text-sm text-gray-500 pt-4 border-t">
        <p>ID utilisateur: <span className="font-mono text-gray-700">{profile.id}</span></p>
        <p>Compte créé le: {new Date(profile.createdAt).toLocaleDateString("fr-FR", { dateStyle: 'long' })}</p>
      </div>
    </div>
  );
}