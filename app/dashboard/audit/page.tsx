import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Search } from "lucide-react"

export default async function AuditLogsPage() {
    const session = await getServerSession(authOptions)

    // Strict RBAC: Only ADMINs can view audit logs
    if (!session || !session.user || !session.user.roles.includes("ADMIN")) {
        redirect("/dashboard")
    }

    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
            user: {
                select: { username: true, email: true },
            },
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    Journal d'Audit
                </h1>
                <p className="text-slate-500">
                    Traçabilité complète des actions critiques du système.
                </p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-base font-bold uppercase tracking-tight text-slate-700">
                                100 Derniers événements
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="w-[180px] font-bold text-slate-700">Date & Heure</TableHead>
                                <TableHead className="font-bold text-slate-700">Utilisateur</TableHead>
                                <TableHead className="font-bold text-slate-700">Action</TableHead>
                                <TableHead className="font-bold text-slate-700">Entité Cible</TableHead>
                                <TableHead className="font-bold text-slate-700">Détails</TableHead>
                                <TableHead className="font-bold text-slate-700 text-right">IP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log: any) => (
                                <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                    <TableCell className="font-medium text-xs text-slate-500 tabular-nums">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm text-slate-900">{log.user.username}</span>
                                            <span className="text-[10px] text-slate-400">{log.user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`
                      font-bold tracking-tigher text-[10px] px-2 py-0.5
                      ${log.action === 'CREATE' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      ${log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                      ${log.action === 'LOGIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                    `}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-slate-700">
                                        {log.entity} <span className="text-slate-400 text-xs font-normal">#{log.entityId?.slice(-6) || 'N/A'}</span>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate text-xs text-slate-500" title={log.details || ""}>
                                        {log.details || "-"}
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-mono text-slate-400">
                                        {log.ipAddress || "Unknown"}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500 italic">
                                        Aucun événement enregistré.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
