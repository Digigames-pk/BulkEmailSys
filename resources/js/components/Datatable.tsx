import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, Tag, Trash2 } from "lucide-react";

type Column<T> = {
    header: string;
    cell: (row: T) => React.ReactNode | string | number;
    width?: string;
    classCell?: string;
    classHead?: string;
};

type Action<T> = {
    label: string;
    type?: "edit" | "view" | "ticket" | "delete";
    onClick: (row: T) => void;
    classCell?: string;
    classHead?: string;
};

type Props<T> = {
    columns: Column<T>[];
    rows: T[];
    actions?: Action<T>[];
    selectable?: boolean;
    title?: string;
    addBorder?: boolean;
};

export default function Datatable<T extends { id: number | string }>({
    columns,
    rows,
    actions = [],
    selectable = false,
    title = "",
    addBorder = true,
}: Props<T>) {
    const [selectedRows, setSelectedRows] = useState<T[]>([]);

    const toggleSelectAll = () => {
        if (selectedRows.length === rows.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows([...rows]);
        }
    };

    const toggleRow = (row: T) => {
        if (selectedRows.find((r) => r.id === row.id)) {
            setSelectedRows(selectedRows.filter((r) => r.id !== row.id));
        } else {
            setSelectedRows([...selectedRows, row]);
        }
    };

    const allSelected = rows.length > 0 && selectedRows.length === rows.length;

    return (
        <div className={addBorder ? "rounded-xl border p-4 shadow-sm" : ""}>
            {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-left text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-600">
                        <tr>
                            {selectable && (
                                <th className="px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                            )}
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className={`px-4 py-2 font-semibold ${col.classHead || ""}`}
                                    style={{ width: col.width || "auto" }}
                                >
                                    {col.header}
                                </th>
                            ))}
                            {actions.length > 0 && <th className="px-4 py-2">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                {selectable && (
                                    <td className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(row)}
                                            onChange={() => toggleRow(row)}
                                        />
                                    </td>
                                )}
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`px-4 py-2 ${col.classCell || ""}`}
                                    >
                                        {col.cell(row)}
                                    </td>
                                ))}
                                {actions.length > 0 && (
                                    <td className="px-4 py-2">
                                        <div className="flex gap-2">
                                            {actions.map((action, i) => (
                                                <Button
                                                    key={i}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => action.onClick(row)}
                                                    className="flex items-center gap-1 cursor-pointer"
                                                >
                                                    {action.type === "edit" && (
                                                        <Pencil className="h-4 w-4 text-blue-700" />
                                                    )}
                                                    {action.type === "view" && (
                                                        <Eye className="h-4 w-4 text-green-700" />
                                                    )}
                                                    {action.type === "ticket" && (
                                                        <Tag className="h-4 w-4" />
                                                    )}
                                                    {action.type === "delete" && (
                                                        <Trash2 className="h-4 w-4 text-red-700" />
                                                    )}
                                                    {action.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {rows.length === 0 && (
                    <div className="py-6 text-center text-gray-500">No data found.</div>
                )}
            </div>
        </div>
    );
}
