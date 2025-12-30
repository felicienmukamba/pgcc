import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Heart, Shield, Scale, Baby, UserMinus, Stethoscope, Plus, Search, ArrowRight, Activity, Clock, UserPlus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { RecordsOverviewChart } from "@/components/RecordsOverviewChart"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// --- Composants Réutilisables ---

// Composant pour les 4 indicateurs principaux
interface StatCardProps {
    title: string
    value: number
    description: string
    icon: any
    colorClass: string
}

const StatCard = ({ title, value, description, icon: Icon, colorClass }: StatCardProps) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-5 w-5 ${colorClass}`} />
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">{value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
    </Card>
)

// Composant pour les 3 indicateurs secondaires
interface StatSecondaryProps {
    title: string
    value: number
    icon: any
    colorClass: string
}

const StatSecondary = ({ title, value, icon: Icon, colorClass }: StatSecondaryProps) => (
    <div className="text-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
        <Icon className={`h-6 w-6 mx-auto mb-1 ${colorClass}`} />
        <div className="text-lg font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{title}</p>
    </div>
)


// --- Logique d'Accès aux Données (Serveur) ---

/**
 * Récupère les activités récentes à travers différents modules.
 */
async function getRecentActivity() {
    try {
        const [citizens, births, consultations, complaints] = await Promise.all([
            prisma.citizen.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
            prisma.birthRecord.findMany({ take: 2, orderBy: { createdAt: 'desc' }, include: { citizen: true } }),
            prisma.consultation.findMany({ take: 2, orderBy: { date: 'desc' }, include: { patient: true } }),
            prisma.complaint.findMany({ take: 2, orderBy: { createdAt: 'desc' }, include: { plaintiff: true } }),
        ])

        const activities = [
            ...citizens.map((c: any) => ({ id: c.id, type: 'CITOYEN', title: `${c.firstName} ${c.lastName}`, date: c.createdAt, icon: Users, color: 'text-blue-500' })),
            ...births.map((b: any) => ({ id: b.id, type: 'NAISSANCE', title: `Nouveau-né: ${b.childName}`, date: b.createdAt, icon: Baby, color: 'text-green-500' })),
            ...consultations.map((c: any) => ({ id: c.id, type: 'CONSULTATION', title: `Patient: ${c.patient.firstName}`, date: c.date, icon: Heart, color: 'text-red-500' })),
            ...complaints.map((c: any) => ({ id: c.id, type: 'PLAINTE', title: `Plainte: ${c.plaintiff.lastName}`, date: c.createdAt, icon: Scale, color: 'text-amber-500' })),
        ]

        return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
    } catch (error) {
        return []
    }
}

/**
 * Récupère le compte total des enregistrements pour le tableau de bord.
 */
async function getDashboardStats() {
    try {
        const [citizensCount, birthRecordsCount, deathRecordCount, marriageRecordCount, consultationsCount, complaintsCount, convictionCount, divorceRecordCount, medicalExamCount] = await Promise.all([
            prisma.citizen.count(),
            prisma.birthRecord.count(),
            prisma.deathRecord.count(),
            prisma.marriageRecord.count(),
            prisma.consultation.count(),
            prisma.complaint.count(),
            prisma.conviction.count(),
            prisma.divorceRecord.count(),
            prisma.medicalExam.count(),
        ])

        return {
            citizensCount,
            birthRecordsCount,
            consultationsCount,
            complaintsCount,
            deathRecordCount,
            marriageRecordCount,
            convictionCount,
            divorceRecordCount,
            medicalExamCount,
        }
    } catch (error: any) {
        toast({
            title: "Erreur",
            description: error.message || "Une erreur est survenue",
            variant: "destructive",
        })
        // Return default values in case of error
        return {
            citizensCount: 0,
            birthRecordsCount: 0,
            consultationsCount: 0,
            complaintsCount: 0,
            deathRecordCount: 0,
            marriageRecordCount: 0,
            convictionCount: 0,
            divorceRecordCount: 0,
            medicalExamCount: 0,
        }
    }
}

/**
 * Récupère les données agrégées pour le graphique, sur les 5 dernières années (annuel).
 */
async function getAnnualRecords() {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 4);
    fiveYearsAgo.setMonth(0);
    fiveYearsAgo.setDate(1);

    const annualData = await prisma.$queryRaw`
        WITH years AS (
            SELECT generate_series(
                date_trunc('year', ${fiveYearsAgo}::timestamp),
                date_trunc('year', NOW()),
                '1 year'::interval
            ) AS year_start
        ),
        citizen_data AS (
            SELECT EXTRACT(YEAR FROM "createdAt")::text AS year_key, COUNT(*)::int AS citizens
            FROM citizens
            WHERE "createdAt" >= ${fiveYearsAgo}::timestamp
            GROUP BY 1
        ),
        birth_data AS (
            SELECT EXTRACT(YEAR FROM "createdAt")::text AS year_key, COUNT(*)::int AS births
            FROM birth_records
            WHERE "createdAt" >= ${fiveYearsAgo}::timestamp
            GROUP BY 1
        ),
        consultation_data AS (
            SELECT EXTRACT(YEAR FROM date)::text AS year_key, COUNT(*)::int AS consultations
            FROM consultations
            WHERE date >= ${fiveYearsAgo}::timestamp
            GROUP BY 1
        )
        SELECT
            EXTRACT(YEAR FROM y.year_start)::text as year,
            COALESCE(c.citizens, 0) as citizens,
            COALESCE(b.births, 0) as births,
            COALESCE(co.consultations, 0) as consultations
        FROM years y
        LEFT JOIN citizen_data c ON EXTRACT(YEAR FROM y.year_start)::text = c.year_key
        LEFT JOIN birth_data b ON EXTRACT(YEAR FROM y.year_start)::text = b.year_key
        LEFT JOIN consultation_data co ON EXTRACT(YEAR FROM y.year_start)::text = co.year_key
        ORDER BY year ASC;
    `;

    return (annualData as any[]).map((d: any) => ({
        year: String(d.year),
        citizens: Number(d.citizens),
        births: Number(d.births),
        consultations: Number(d.consultations),
    }));
}

/**
 * Récupère toutes les données mensuelles pour une année donnée.
 */
async function getMonthlyRecordsByYear(year: string) {
    const yearStart = new Date(Number(year), 0, 1);
    const nextYearStart = new Date(Number(year) + 1, 0, 1);

    const monthlyData = await prisma.$queryRaw`
        WITH months AS (
            SELECT generate_series(
                date_trunc('month', ${yearStart}::timestamp),
                date_trunc('month', ${nextYearStart}::timestamp - interval '1 day'),
                '1 month'::interval
            ) AS month_start
        ),
        citizen_data AS (
            SELECT to_char(DATE_TRUNC('month', "createdAt"), 'MM') AS month_sort, to_char(DATE_TRUNC('month', "createdAt"), 'Mon') AS month_key, COUNT(*)::int AS citizens
            FROM citizens
            WHERE "createdAt" >= ${yearStart}::timestamp AND "createdAt" < ${nextYearStart}::timestamp
            GROUP BY 1, 2
        ),
        birth_data AS (
            SELECT to_char(DATE_TRUNC('month', "createdAt"), 'MM') AS month_sort, to_char(DATE_TRUNC('month', "createdAt"), 'Mon') AS month_key, COUNT(*)::int AS births
            FROM birth_records
            WHERE "createdAt" >= ${yearStart}::timestamp AND "createdAt" < ${nextYearStart}::timestamp
            GROUP BY 1, 2
        ),
        consultation_data AS (
            SELECT to_char(DATE_TRUNC('month', date), 'MM') AS month_sort, to_char(DATE_TRUNC('month', date), 'Mon') AS month_key, COUNT(*)::int AS consultations
            FROM consultations
            WHERE date >= ${yearStart}::timestamp AND date < ${nextYearStart}::timestamp
            GROUP BY 1, 2
        )
        SELECT
            UPPER(m.month_key) as month_name, 
            m.month_sort as month_sort,
            COALESCE(c.citizens, 0) as citizens,
            COALESCE(b.births, 0) as births,
            COALESCE(co.consultations, 0) as consultations
        FROM (
            SELECT to_char(month_start, 'MM') as month_sort, to_char(month_start, 'Mon') as month_key
            FROM months
        ) m
        LEFT JOIN citizen_data c ON m.month_sort = c.month_sort
        LEFT JOIN birth_data b ON m.month_sort = b.month_sort
        LEFT JOIN consultation_data co ON m.month_sort = co.month_sort
        ORDER BY m.month_sort ASC;
    `;

    return (monthlyData as any[]).map((d: any) => ({
        month: String(d.month_name).slice(0, 3).toUpperCase(),
        citizens: Number(d.citizens),
        births: Number(d.births),
        consultations: Number(d.consultations),
    }));
}


// --- Composant Principal de la Page (Rendu Serveur) ---

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    const currentYear = new Date().getFullYear().toString();

    const [stats, annualData, recentActivity] = await Promise.all([
        getDashboardStats(),
        getAnnualRecords(),
        getRecentActivity(),
    ]);

    const initialMonthlyData = await getMonthlyRecordsByYear(currentYear);

    const availableYears = annualData.map((d: any) => d.year).filter(y => y);
    const uniqueYears = [...new Set(availableYears)].sort((a: any, b: any) => b - a);

    const mainCards = [
        { title: "Citoyens enregistrés", value: stats.citizensCount, description: "Total général dans le système", icon: Users, colorClass: "text-blue-500 bg-blue-500/10 p-1 rounded-full" },
        { title: "Actes de naissance", value: stats.birthRecordsCount, description: "Total des enregistrements", icon: Baby, colorClass: "text-green-500 bg-green-500/10 p-1 rounded-full" },
        { title: "Consultations", value: stats.consultationsCount, description: "Dossiers médicaux enregistrés", icon: Heart, colorClass: "text-red-500 bg-red-500/10 p-1 rounded-full" },
        { title: "Plaintes déposées", value: stats.complaintsCount, description: "Plaintes archivées/en cours", icon: Scale, colorClass: "text-amber-500 bg-amber-500/10 p-1 rounded-full" },
    ]

    const secondaryStats = [
        { title: "Actes de décès", value: stats.deathRecordCount, icon: FileText, colorClass: "text-gray-500" },
        { title: "Actes de mariage", value: stats.marriageRecordCount, icon: Heart, colorClass: "text-pink-500" },
        { title: "Actes de divorce", value: stats.divorceRecordCount, icon: UserMinus, colorClass: "text-destructive" },
        { title: "Examens Médicaux", value: stats.medicalExamCount, icon: Stethoscope, colorClass: "text-blue-500" },
        { title: "Condamnations", value: stats.convictionCount, icon: Shield, colorClass: "text-purple-500" },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* En-tête Dynamique avec Actions Rapides */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-tight mb-2">
                        <Activity className="h-5 w-5" />
                        <span className="text-sm uppercase tracking-widest">Aperçu Opérationnel</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                        République Démocratique du Congo
                    </h1>
                    <h2 className="text-lg font-bold text-primary uppercase tracking-widest">
                        Système de Gestion des Citoyens
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                        Ravi de vous revoir, <span className="text-primary font-semibold underline decoration-primary/30 underline-offset-4">{session?.user?.username || 'Utilisateur'}</span>.
                        Voici les dernières mises à jour du système national de gestion.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/dashboard/citizens/new">
                        <Button className="shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Nouvel Enrôlement
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Statistiques à Gauche (Cols 3) */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Statistiques Clés */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {mainCards.map((card) => (<StatCard key={card.title} {...card} />))}
                    </div>

                    {/* Graphique de Performance */}
                    <RecordsOverviewChart
                        annualData={annualData}
                        initialMonthlyData={initialMonthlyData}
                        availableYears={uniqueYears}
                        currentYear={currentYear}
                    />

                    {/* Grille Secondaire */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold uppercase tracking-tight">Statistiques d'État Civil</CardTitle>
                                    <CardDescription>Données administratives agrégées</CardDescription>
                                </div>
                                <FileText className="h-5 w-5 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {secondaryStats.slice(0, 4).map(stat => (
                                        <div key={stat.title} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-hover hover:border-primary/30">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={cn("p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm", stat.colorClass.split(' ')[0])}>
                                                    <stat.icon className="h-4 w-4" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-500 uppercase">{stat.title.split(' ')[2] || stat.title}</span>
                                            </div>
                                            <div className="text-2xl font-black">{stat.value.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold uppercase tracking-tight">Actions Rapides</CardTitle>
                                <CardDescription>Raccourcis vers les tâches fréquentes</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 group" asChild>
                                    <Link href="/dashboard/birth-records/new">
                                        <Baby className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-semibold">Acte Naissance</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 group" asChild>
                                    <Link href="/dashboard/consultations">
                                        <Stethoscope className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-semibold">Consultation</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 group" asChild>
                                    <Link href="/dashboard/divorce-records/new">
                                        <UserMinus className="h-5 w-5 text-destructive group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-semibold">Acte Divorce</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 group" asChild>
                                    <Link href="/dashboard/complaints">
                                        <Scale className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-semibold">Nouvelle Plainte</span>
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Barre Latérale Droite (Col 1) - Activités Récentes */}
                <div className="space-y-6">
                    <Card className="h-full border-slate-200">
                        <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/50 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-sm font-bold uppercase tracking-tight">Activités Récentes</CardTitle>
                                </div>
                                <Badge variant="outline" className="text-[10px] font-bold">{recentActivity.length}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {recentActivity.map((activity, i) => (
                                    <div key={i} className="flex gap-4 group cursor-default">
                                        <div className="relative">
                                            <div className={cn("h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:border-primary transition-colors shadow-sm", activity.color)}>
                                                <activity.icon className="h-5 w-5" />
                                            </div>
                                            {i !== recentActivity.length - 1 && (
                                                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1px] h-6 bg-slate-100 dark:bg-slate-800" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 py-0.5">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-[10px] font-black tracking-widest text-primary uppercase">{activity.type}</span>
                                                <span className="text-[10px] font-medium text-slate-400">{new Date(activity.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors italic">
                                                {activity.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {recentActivity.length === 0 && (
                                    <div className="text-center py-10">
                                        <Activity className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                        <p className="text-xs text-slate-400 font-medium tracking-tight">Aucune activité récente à afficher</p>
                                    </div>
                                )}
                            </div>

                            <Button variant="ghost" className="w-full mt-6 text-xs font-bold text-slate-500 hover:text-primary transition-all group" asChild>
                                <Link href="/dashboard/citizens" className="flex items-center justify-center gap-2">
                                    Voir tout l'historique
                                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}