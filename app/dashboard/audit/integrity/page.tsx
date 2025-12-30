"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react"


export const dynamic = 'force-dynamic';
interface IntegrityResult {
    totalLogs: number
    compromisedCount: number
    isIntact: boolean
    compromisedLogs: Array<{
        id: string
        reason: string
        expectedHash?: string
        actualHash?: string
    }>
}

export default function AuditIntegrityPage() {
    const [result, setResult] = useState<IntegrityResult | null>(null)
    const [loading, setLoading] = useState(false)

    const verifyIntegrity = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/audit/verify-integrity")
            if (response.ok) {
                const data = await response.json()
                setResult(data)
            }
        } catch (error) {
            console.error("Integrity check failed:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldAlert className="h-8 w-8 text-blue-600" />
                        Audit Chain Integrity
                    </h1>
                    <p className="text-slate-500 mt-1">Tamper-evident log verification (Estonia Model)</p>
                </div>
                <Button onClick={verifyIntegrity} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Verifying...' : 'Run Verification'}
                </Button>
            </div>

            {result && (
                <div className="space-y-4">
                    <Alert variant={result.isIntact ? "default" : "destructive"} className={result.isIntact ? "border-green-500 bg-green-50" : ""}>
                        <div className="flex items-center gap-3">
                            {result.isIntact ? (
                                <ShieldCheck className="h-6 w-6 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-6 w-6" />
                            )}
                            <div className="flex-1">
                                <AlertDescription className={result.isIntact ? "text-green-900 font-semibold" : "font-semibold"}>
                                    {result.isIntact
                                        ? "✓ Audit chain is intact. No tampering detected."
                                        : `⚠ WARNING: ${result.compromisedCount} compromised log(s) detected!`
                                    }
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>

                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Logs</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{result.totalLogs}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Verified</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{result.totalLogs - result.compromisedCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Compromised</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">{result.compromisedCount}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {result.compromisedLogs.length > 0 && (
                        <Card className="border-red-500">
                            <CardHeader className="bg-red-50 border-b border-red-200">
                                <CardTitle className="text-red-900">Compromised Logs</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {result.compromisedLogs.map((log) => (
                                        <div key={log.id} className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                            <p className="font-mono text-sm mb-2">ID: {log.id}</p>
                                            <p className="text-red-900 font-semibold mb-2">{log.reason}</p>
                                            {log.expectedHash && (
                                                <div className="text-xs space-y-1">
                                                    <p><span className="font-semibold">Expected:</span> <code className="bg-white px-1 py-0.5 rounded">{log.expectedHash.slice(0, 32)}...</code></p>
                                                    <p><span className="font-semibold">Actual:</span> <code className="bg-white px-1 py-0.5 rounded">{log.actualHash?.slice(0, 32)}...</code></p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {!result && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <ShieldAlert className="h-16 w-16 text-slate-300 mb-4" />
                        <p className="text-slate-500 mb-4">No verification run yet</p>
                        <p className="text-sm text-slate-400">Click "Run Verification" to check audit log integrity</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
