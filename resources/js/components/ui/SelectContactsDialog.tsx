import React, { useEffect, useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface Contact {
    id: number;
    name: string;
    email: string;
}

interface SelectContactsDialogProps {
    appCode: string;
    onSelect: (contacts: Contact[]) => void;
    selectedContactIds?: number[];
}

const SelectContactsDialog: React.FC<SelectContactsDialogProps> = ({
    appCode,
    onSelect,
    selectedContactIds = [],
}) => {
    const [open, setOpen] = useState(false);
    const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<number[]>(selectedContactIds);
    const [loading, setLoading] = useState(false);

    // ✅ Fetch contacts only once when the component mounts (or if appCode changes)
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/groups/contacts/all`);
                if (!response.ok) throw new Error("Failed to fetch contacts");
                const data = await response.json();
                setAvailableContacts(data.contacts || []);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [appCode]); // 👈 Added appCode to deps for safety if it can change

    // ✅ Update local selected state when parent changes
    useEffect(() => {
        setSelectedContacts(selectedContactIds);
    }, [selectedContactIds]);

    // ✅ Toggle individual contact (using suggested checked value)
    const handleSelectContact = useCallback((contactId: number, checked: boolean) => {
        setSelectedContacts((prev) =>
            checked
                ? [...prev, contactId]
                : prev.filter((id) => id !== contactId)
        );
    }, []);

    // ✅ Select / Deselect all (using suggested checked value)
    const handleSelectAll = useCallback((checked: boolean) => {
        setSelectedContacts(checked ? availableContacts.map((c) => c.id) : []);
    }, [availableContacts]);

    // ✅ Confirm and send selected contacts to parent
    const handleConfirmSelection = () => {
        const selected = availableContacts.filter((c) =>
            selectedContacts.includes(c.id)
        );
        onSelect(selected);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Open Button */}
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-white hover:bg-gray-50">
                    Select Contacts
                </Button>
            </DialogTrigger>

            {/* Dialog Content */}
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-lg">
                <DialogHeader className="flex justify-between items-center border-b pb-2">
                    <DialogTitle className="text-xl font-semibold">Select Contacts</DialogTitle>
                    <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </DialogHeader>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto mt-3 pr-2">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                        </div>
                    ) : availableContacts.length > 0 ? (
                        <div className="space-y-2">
                            {/* Select All */}
                            <div className="flex items-center space-x-2 border-b pb-2 mb-2">
                                <Checkbox
                                    checked={
                                        selectedContacts.length === availableContacts.length &&
                                        availableContacts.length > 0
                                    }
                                    onCheckedChange={handleSelectAll}
                                    className="h-4 w-4 mt-0.5"
                                />
                                <span className="font-medium text-gray-700">Select All</span>
                            </div>

                            {/* Contact List */}
                            {availableContacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            checked={selectedContacts.includes(contact.id)}
                                            onCheckedChange={(checked) => handleSelectContact(contact.id, !!checked)}
                                            className="h-4 w-4 mt-0.5"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-800">{contact.name}</div>
                                            <div className="text-sm text-gray-500">{contact.email}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-10">
                            No contacts found.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="flex justify-end border-t pt-3 mt-3">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmSelection}
                        disabled={selectedContacts.length === 0}
                        className="ml-2"
                    >
                        Confirm Selection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SelectContactsDialog;
