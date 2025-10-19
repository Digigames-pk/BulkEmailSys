import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { formatPrice } from '@/lib/price-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';

interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    is_active: boolean;
    is_featured: boolean;
    max_templates: number;
    max_contacts: number;
    max_emails_per_month: number;
    user_subscriptions_count: number;
}

interface Props {
    plans: SubscriptionPlan[];
}

export default function Index({ plans }: Props) {
    const { delete: destroy } = useForm();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

    const handleDeleteClick = (plan: SubscriptionPlan) => {
        setPlanToDelete(plan);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (planToDelete) {
            destroy(route('plans.destroy', { subscriptionPlan: planToDelete.id }));
            setDeleteModalOpen(false);
            setPlanToDelete(null);
        }
    };

    const formatLimit = (limit: number) => {
        return limit === 0 ? 'Unlimited' : limit.toLocaleString();
    };

    return (
        <AppLayout>
            <Head title="Subscription Plans" />

            <div className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Subscription Plans</h1>
                        <p className="text-muted-foreground">
                            Manage your subscription plans and pricing
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('plans.create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Plan
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Plans</CardTitle>
                        <CardDescription>
                            View and manage all subscription plans
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {plans.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plan Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Templates</TableHead>
                                        <TableHead>Contacts</TableHead>
                                        <TableHead>Emails/Month</TableHead>
                                        <TableHead>Subscribers</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plans.map((plan) => (
                                        <TableRow key={plan.id}>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium">{plan.name}</div>
                                                    {plan.is_featured && (
                                                        <Badge variant="secondary">Featured</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatPrice(plan.price)}/{plan.interval}
                                            </TableCell>
                                            <TableCell>
                                                {formatLimit(plan.max_templates)}
                                            </TableCell>
                                            <TableCell>
                                                {formatLimit(plan.max_contacts)}
                                            </TableCell>
                                            <TableCell>
                                                {formatLimit(plan.max_emails_per_month)}
                                            </TableCell>
                                            <TableCell>
                                                {plan.user_subscriptions_count || 0}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                                                    {plan.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('plans.show', { subscriptionPlan: plan.id })}>
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('plans.edit', { subscriptionPlan: plan.id })}>
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(plan)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-muted-foreground mb-4">
                                    <Plus className="h-12 w-12 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No subscription plans</h3>
                                    <p>Create your first subscription plan to get started.</p>
                                </div>
                                <Button asChild>
                                    <Link href={route('plans.create')}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Plan
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Subscription Plan</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone.
                            All users subscribed to this plan will need to choose a different plan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                        >
                            Delete Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
