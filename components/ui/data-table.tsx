"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ColumnDef<T> {
    header: string | React.ReactNode
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
}

interface DataTableProps<T> {
    columns: ColumnDef<T>[]
    data: T[]
    isLoading?: boolean
    pagination?: {
        currentPage: number
        totalPages: number
        onPageChange: (page: number) => void
    }
    onRowClick?: (item: T) => void
    emptyMessage?: string
}

export function DataTable<T extends { id: string | number }>({
    columns,
    data,
    isLoading,
    pagination,
    onRowClick,
    emptyMessage = "Aucune donnée disponible.",
}: DataTableProps<T>) {
    return (
        <div className="space-y-4">
            <div className="rounded-md border border-slate-200 shadow-sm overflow-hidden bg-white dark:border-slate-800 dark:bg-slate-950">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <TableRow>
                                {columns.map((col, index) => (
                                    <TableHead key={index} className={cn("font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap", col.className)}>
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2 text-slate-500">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Chargement...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : data.length > 0 ? (
                                data.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className={cn(
                                            "hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors",
                                            onRowClick ? "cursor-pointer" : ""
                                        )}
                                        onClick={() => onRowClick && onRowClick(item)}
                                    >
                                        {columns.map((col, index) => (
                                            <TableCell key={index} className={cn("py-3", col.className)}>
                                                {col.cell
                                                    ? col.cell(item)
                                                    : col.accessorKey
                                                        ? (item[col.accessorKey] as React.ReactNode)
                                                        : null}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500 italic">
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-xs text-muted-foreground">
                        Page {pagination.currentPage} sur {pagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
