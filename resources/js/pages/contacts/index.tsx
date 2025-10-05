import React, { useEffect, useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import Datatable from "@/components/Datatable";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import CreateEditModal from "./CreateEditModal";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

export default function Index({ contacts, filters }: any) {
    const [search, setSearch] = useState(filters.search || "");
    const [selectedContact, setSelectedContact] = useState<any | null>(null);
    const [showCreateEditDialog, setShowCreateEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const form = useForm({});

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get('/contacts', { search }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(timeout);
    }, [search]);

    const handlePageChange = (page: number) => {
        router.get(`/contacts`, { search, page }, { preserveState: true, replace: true });
    };

    const handleCreate = () => {
        setSelectedContact(null);
        setShowCreateEditDialog(true);
    };

    const handleEdit = (contact: any) => {
        setSelectedContact(contact);
        setShowCreateEditDialog(true);
    };

    const handleDelete = (id: number) => {
        setDeletingId(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!deletingId) return;
        form.delete(`/contacts/${deletingId}`, {
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
        { header: "Mobile", cell: (row: any) => row.mobile || '-' },
        { header: "Gender", cell: (row: any) => row.gender || '-' },
    ];

    const actions = [
        { label: "Edit", type: "edit" as const, onClick: (row: any) => handleEdit(row) },
        { label: "Delete", type: "delete" as const, onClick: (row: any) => handleDelete(row.id) },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Contacts", href: "/contacts" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contacts" />
            <div className="p-8">
                <div className="mb-2 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Contacts</h1>
                    <div className="flex gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder="Search by Name, Email or Mobile"
                            className="rounded border border-gray-300 px-3 py-2"
                        />
                        <Button onClick={handleCreate}>+ Add Contact</Button>
                    </div>
                </div>

                <Datatable columns={columns} rows={contacts.data} actions={actions} />

                <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        Showing {contacts.from} to {contacts.to} of {contacts.total} results
                    </span>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={contacts.current_page === 1}
                            onClick={() => handlePageChange(contacts.current_page - 1)}
                        >
                            Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={contacts.current_page === contacts.last_page}
                            onClick={() => handlePageChange(contacts.current_page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            <CreateEditModal
                open={showCreateEditDialog}
                onClose={() => setShowCreateEditDialog(false)}
                contact={selectedContact}
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


