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

type UserForm = {
    id?: number;
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    _method?: "POST" | "PUT";
};

export default function CreateEditModal({
    open,
    onClose,
    user,
}: {
    open: boolean;
    onClose: () => void;
    user?: UserForm | null;
}) {
    const { data, setData, post, put, processing, reset, errors } =
        useForm<UserForm>({
            id: user?.id,
            name: user?.name || "",
            email: user?.email || "",
            password: "",
            password_confirmation: "",
            _method: user?.id ? "PUT" : "POST",
        });

    useEffect(() => {
        if (user) {
            setData({
                id: user.id,
                name: user.name,
                email: user.email,
                password: "",
                password_confirmation: "",
                _method: user.id ? "PUT" : "POST",
            });
        } else {
            reset();
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.id) {
            post(`/users/${data.id}`, {
                onSuccess: () => onClose(),
            });
        } else {
            post(`/users`, {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{data.id ? "Edit User" : "Create User"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    {/* Email */}
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

                    {/* Password */}
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password || ""}
                            onChange={(e) => setData("password", e.target.value)}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation || ""}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm text-red-500">
                                {errors.password_confirmation}
                            </p>
                        )}
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
