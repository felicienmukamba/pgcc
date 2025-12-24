"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Mail, Phone, Calendar, MapPin, User, KeyRound } from "lucide-react"

interface ProfileData {
    nationalId: string
    mfaEnabled: boolean
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
    birthDate: string
    address?: string
}

export default function SecureProfilePage({ params }: { params: { identityId: string } }) {
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await fetch(`/api/profile/decrypt?identityId=${params.identityId}`)
            if (response.ok) {
                const data = await response.json()
                setProfile(data)
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!profile) {
        return <div className="text-center py-12">Profile not found</div>
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        Secure Identity Profile
                    </h1>
                    <p className="text-slate-500 mt-1">Decrypted on-the-fly from secure storage</p>
                </div>
                <Badge variant={profile.mfaEnabled ? "default" : "secondary"} className="h-7">
                    {profile.mfaEnabled ? "MFA Enabled" : "MFA Disabled"}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <dt className="text-sm text-slate-500 mb-1">National ID</dt>
                            <dd className="font-mono font-bold text-blue-900">{profile.nationalId}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-500 mb-1">Full Name</dt>
                            <dd className="font-semibold">{profile.firstName} {profile.lastName}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Birth Date
                            </dt>
                            <dd className="font-medium">{new Date(profile.birthDate).toLocaleDateString("fr-FR")}</dd>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <dt className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                Email
                            </dt>
                            <dd className="font-medium">{profile.email}</dd>
                        </div>
                        {profile.phoneNumber && (
                            <div>
                                <dt className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    Phone
                                </dt>
                                <dd className="font-medium">{profile.phoneNumber}</dd>
                            </div>
                        )}
                        {profile.address && (
                            <div>
                                <dt className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Address
                                </dt>
                                <dd className="font-medium">{profile.address}</dd>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-blue-900">
                        <KeyRound className="h-4 w-4" />
                        Security Notice
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-blue-800">
                        This profile data is encrypted using AES-256-GCM in the database and decrypted on-the-fly for authorized viewing only.
                        All access to this profile is logged in the tamper-evident audit trail.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
