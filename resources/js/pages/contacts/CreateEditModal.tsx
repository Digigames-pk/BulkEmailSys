import React, { useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContactForm = {
    id?: number;
    name: string;
    email: string;
    mobile?: string;
    gender?: string;
    _method?: "POST" | "PUT";
};

export default function CreateEditModal({
    open,
    onClose,
    contact,
}: {
    open: boolean;
    onClose: () => void;
    contact?: ContactForm | null;
}) {
    const { data, setData, post, processing, reset, errors } =
        useForm<ContactForm>({
            id: contact?.id,
            name: contact?.name || "",
            email: contact?.email || "",
            mobile: contact?.mobile || "",
            gender: contact?.gender || "",
            _method: contact?.id ? "PUT" : "POST",
        });

    useEffect(() => {
        if (contact) {
            setData({
                id: contact.id,
                name: contact.name,
                email: contact.email,
                mobile: contact.mobile || "",
                gender: contact.gender || "",
                _method: contact.id ? "PUT" : "POST",
            });
        } else {
            reset();
        }
    }, [contact]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.id) {
            post(`/contacts/${data.id}`, {
                onSuccess: () => onClose(),
            });
        } else {
            post(`/contacts`, {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{data.id ? "Edit Contact" : "Create Contact"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                        <Label htmlFor="mobile">Mobile</Label>
                        <Input
                            id="mobile"
                            value={data.mobile || ""}
                            onChange={(e) => setData("mobile", e.target.value)}
                        />
                        {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
                    </div>

                    <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Input
                            id="gender"
                            value={data.gender || ""}
                            onChange={(e) => setData("gender", e.target.value)}
                        />
                        {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing} className="w-[120px]">
                            {data.id ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


