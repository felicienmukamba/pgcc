import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Heart, Shield, Scale, Baby } from "lucide-react" 
import { Separator } from "@/components/ui/separator" 
import { RecordsOverviewChart } from "@/components/RecordsOverviewChart" 

// --- Composants Réutilisables ---

// Composant pour les 4 indicateurs principaux
const StatCard = ({ title, value, description, icon: Icon, colorClass }) => (
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
const StatSecondary = ({ title, value, icon: Icon, colorClass }) => (
    <div className="text-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
        <Icon className={`h-6 w-6 mx-auto mb-1 ${colorClass}`} />
        <div className="text-lg font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{title}</p>
    </div>
)


// --- Logique d'Accès aux Données (Serveur) ---

/**
 * Récupère le compte total des enregistrements pour le tableau de bord.
 */
async function getDashboardStats() {
  const [citizensCount, birthRecordsCount, deathRecordCount, marriageRecordCount, consultationsCount, complaintsCount, convictionCount] = await Promise.all([
    prisma.citizen.count(),
    prisma.birthRecord.count(),
    prisma.deathRecord.count(),
    prisma.marriageRecord.count(),
    prisma.consultation.count(),
    prisma.complaint.count(),
    prisma.conviction.count(),
  ])

  return {
    citizensCount,
    birthRecordsCount,
    consultationsCount,
    complaintsCount,
    deathRecordCount,
    marriageRecordCount,
    convictionCount,
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
    
    return annualData.map(d => ({
        year: String(d.year), 
        citizens: Number(d.citizens),
        births: Number(d.births),
        consultations: Number(d.consultations),
    }));
}

/**
 * Récupère toutes les données mensuelles pour une année donnée.
 */
async function getMonthlyRecordsByYear(year) {
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

    return monthlyData.map(d => ({
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

    const [stats, annualData] = await Promise.all([
        getDashboardStats(),
        getAnnualRecords(),
    ]);

    const initialMonthlyData = await getMonthlyRecordsByYear(currentYear);

    const availableYears = annualData.map(d => d.year).filter(y => y);
    const uniqueYears = [...new Set(availableYears)].sort((a, b) => b - a);

    const mainCards = [
        { title: "Citoyens enregistrés", value: stats.citizensCount, description: "Total général dans le système", icon: Users, colorClass: "text-blue-500 bg-blue-500/10 p-1 rounded-full" },
        { title: "Actes de naissance", value: stats.birthRecordsCount, description: "Total des enregistrements", icon: Baby, colorClass: "text-green-500 bg-green-500/10 p-1 rounded-full" },
        { title: "Consultations", value: stats.consultationsCount, description: "Dossiers médicaux enregistrés", icon: Heart, colorClass: "text-red-500 bg-red-500/10 p-1 rounded-full" },
        { title: "Plaintes déposées", value: stats.complaintsCount, description: "Plaintes archivées/en cours", icon: Scale, colorClass: "text-amber-500 bg-amber-500/10 p-1 rounded-full" },
    ]

    const secondaryStats = [
        { title: "Actes de décès", value: stats.deathRecordCount, icon: FileText, colorClass: "text-gray-500" },
        { title: "Actes de mariage", value: stats.marriageRecordCount, icon: Heart, colorClass: "text-pink-500" },
        { title: "Condamnations", value: stats.convictionCount, icon: Shield, colorClass: "text-purple-500" },
    ]

    return (
        <div className="space-y-8 p-6">
            {/* En-tête du Tableau de Bord */}
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight">Tableau de bord Général</h1>
                <p className="text-lg text-muted-foreground mt-1">
                    Bienvenue, <span className="font-semibold">{session?.user?.username || 'Utilisateur'}.</span> Aperçu des données clés.
                </p>
            </div>

            <Separator />

            {/* Section des Statistiques Clés */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {mainCards.map((card) => (<StatCard key={card.title} {...card} />))}
            </div>
            
            {/* Section Graphique et Statistiques Secondaires */}
            <div className="grid gap-6 lg:grid-cols-7">
                
                <RecordsOverviewChart 
                    annualData={annualData} 
                    initialMonthlyData={initialMonthlyData}
                    availableYears={uniqueYears}
                    currentYear={currentYear}
                />
                
                <Card className="col-span-3 shadow-lg">
                    <CardHeader>
                        <CardTitle>Autres Statistiques</CardTitle>
                        <CardDescription>Aperçu des dossiers administratifs clés.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            {secondaryStats.map(stat => (<StatSecondary key={stat.title} {...stat} />))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}