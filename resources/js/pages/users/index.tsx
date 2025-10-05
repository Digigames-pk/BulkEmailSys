import React, { useState, useEffect } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import Datatable from "@/components/Datatable";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import CreateEditModal from "./CreateEditModal";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

export default function Index({ allusers, filters }: any) {
    const [search, setSearch] = useState(filters.search || "");
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [showCreateEditDialog, setShowCreateEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const form = useForm({});

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get('/users', { search }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(timeout);
    }, [search]);

    const handlePageChange = (page: number) => {
        router.get(`/users`, { search, page }, { preserveState: true, replace: true });
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setShowCreateEditDialog(true);
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setShowCreateEditDialog(true);
    };

    const handleDelete = (id: number) => {
        setDeletingId(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!deletingId) return;
        form.delete(`/users/${deletingId}`, {
            preserveScroll: true,
            onFinish: () => {
                setShowDeleteDialog(false);
                setDeletingId(null);
            },
        });
    };

    const columns = [
        { header: "Name", cell: (row: any) => row.name },
        { header: "Email", cell: (row: any) => row.email },
    ];

    const actions = [
        {
            label: "Edit",
            type: "edit" as const,
            onClick: (row: any) => handleEdit(row),
        },
        {
            label: "Delete",
            type: "delete" as const,
            onClick: (row: any) => handleDelete(row.id),
        },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Users", href: "/users" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="p-8">
                <div className="mb-2 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Users</h1>
                    <div className="flex gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder="Search by Name or Email"
                            className="rounded border border-gray-300 px-3 py-2"
                        />
                        <Button onClick={handleCreate}>+ Add User</Button>
                    </div>
                </div>

                <Datatable columns={columns} rows={allusers.data} actions={actions} />

                <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        Showing {allusers.from} to {allusers.to} of {allusers.total} results
                    </span>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={allusers.current_page === 1}
                            onClick={() => handlePageChange(allusers.current_page - 1)}
                        >
                            Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={allusers.current_page === allusers.last_page}
                            onClick={() => handlePageChange(allusers.current_page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateEditModal
                open={showCreateEditDialog}
                onClose={() => setShowCreateEditDialog(false)}
                user={selectedUser}
            />
            <ConfirmDeleteDialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                processing={form.processing}
            />
        </AppLayout>
    );
}
