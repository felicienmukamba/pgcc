"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Loader2, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    isLoading?: boolean
    pagination?: {
        currentPage: number
        totalPages: number
        onPageChange: (page: number) => void
    }
    emptyMessage?: string
    // Legacy prop support if needed, though mostly moved to column definitions
    onRowClick?: (item: TData) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    isLoading,
    pagination,
    emptyMessage = "Aucune donnée disponible.",
    onRowClick
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
        // If server-side pagination is used, we might want to disable client-side pagination here
        // or ensure page count is handled correctly. For now, we keep default behavior for client-side
        // arrays, and rely on external control for server-side logic if 'pagination' prop is provided.
        manualPagination: !!pagination,
        pageCount: pagination?.totalPages,
    })

    return (
        <div className="space-y-4">
            {/* Search Input for Client-Side filtering if not using server side */}
            {searchKey && !pagination && (
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Rechercher..."
                        value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(searchKey)?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                </div>
            )}

            <div className="rounded-xl border border-border/50 shadow-sm overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl transition-all hover:shadow-md">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-border/60">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                // Skeleton Loader
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="hover:bg-transparent">
                                        {columns.map((_, j) => (
                                            <TableCell key={j} className="py-4">
                                                <Skeleton className="h-4 w-full rounded-md opacity-50" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={cn(
                                            "group transition-colors border-b border-border/40 last:border-0",
                                            "hover:bg-primary/5 dark:hover:bg-primary/10",
                                            onRowClick ? "cursor-pointer" : ""
                                        )}
                                        onClick={() => onRowClick && onRowClick(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-3.5 text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                            </div>
                                            <p className="text-sm font-medium">{emptyMessage}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination ? (
                // Server-side pagination controls
                pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="text-sm text-muted-foreground font-medium">
                            Page <span className="text-foreground">{pagination.currentPage}</span> sur <span className="text-foreground">{pagination.totalPages}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-full border-border/60 hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage <= 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-full border-border/60 hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )
            ) : (
                // Client-side pagination controls
                table.getPageCount() > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Suivant
                        </Button>
                    </div>
                )
            )}
        </div>
    )
}
