import React, { useEffect, useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Datatable from "@/components/Datatable";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import CreateEditModal from "./CreateEditModal";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import CsvImportModal from "./CsvImportModal";
import { Upload } from "lucide-react";

export default function Index({ contacts, filters }: any) {
    const [search, setSearch] = useState(filters.search || "");
    const [selectedContact, setSelectedContact] = useState<any | null>(null);
    const [showCreateEditDialog, setShowCreateEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const form = useForm({});
    const { toast } = useToast();

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

    const handleImportCsv = (file: File) => {
        const formData = new FormData();
        formData.append('csv_file', file);

        // Use fetch instead of Inertia form for file uploads
        fetch('/contacts/import-csv', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'Accept': 'application/json',
            },
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setShowImportDialog(false);
                    const message = data.group
                        ? `${data.message}\n\nGroup created: ${data.group.name}\nDescription: ${data.group.description}`
                        : data.message;
                    toast({
                        title: "Import Successful",
                        description: message,
                        variant: "success",
                    });
                    // Reload the page to show updated contacts
                    window.location.reload();
                } else {
                    throw new Error(data.message || 'Import failed');
                }
            })
            .catch(error => {
                console.error('Import failed:', error);
                toast({
                    title: "Import Failed",
                    description: error.message,
                    variant: "destructive",
                });
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
                        <Button
                            variant="outline"
                            onClick={() => setShowImportDialog(true)}
                            className="flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Import CSV
                        </Button>
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
            <CsvImportModal
                open={showImportDialog}
                onClose={() => setShowImportDialog(false)}
                onImport={handleImportCsv}
                processing={form.processing}
            />
        </AppLayout>
    );
}


