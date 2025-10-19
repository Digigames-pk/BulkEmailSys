import { Head, Link, useForm } from '@inertiajs/react';
import { formatPrice } from '@/lib/price-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Check, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    trial_days: number;
    is_active: boolean;
    is_featured: boolean;
    max_templates: number;
    max_contacts: number;
    max_emails_per_month: number;
    features: string[];
    created_at: string;
    updated_at: string;
}

interface Props {
    plan: SubscriptionPlan;
}

export default function Show({ plan }: Props) {
    const { delete: destroy } = useForm();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this subscription plan?')) {
            destroy(route('plans.destroy', { subscriptionPlan: plan.id }));
        }
    };

    const formatLimit = (limit: number) => {
        return limit === 0 ? 'Unlimited' : limit.toLocaleString();
    };

    return (
        <AppLayout>
            <Head title={`Subscription Plan: ${plan.name}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('plans.index')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Plans
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{plan.name}</h1>
                        <p className="text-muted-foreground">
                            Subscription plan details and configuration
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Plan Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plan Information</CardTitle>
                                <CardDescription>
                                    Basic plan details and pricing
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
                                        <p className="text-lg font-semibold">{plan.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Price</label>
                                        <p className="text-lg font-semibold">
                                            {formatPrice(plan.price)}/{plan.interval}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Currency</label>
                                        <p className="text-lg font-semibold uppercase">{plan.currency}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Trial Days</label>
                                        <p className="text-lg font-semibold">{plan.trial_days} days</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="text-sm mt-1">{plan.description || 'No description provided'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Plan Limits</CardTitle>
                                <CardDescription>
                                    Resource limits for this subscription plan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-primary">
                                            {formatLimit(plan.max_templates)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Email Templates</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-primary">
                                            {formatLimit(plan.max_contacts)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Contacts</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-primary">
                                            {formatLimit(plan.max_emails_per_month)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Emails per Month</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {plan.features && plan.features.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Plan Features</CardTitle>
                                    <CardDescription>
                                        Additional features included in this plan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plan Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Active</span>
                                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                                        {plan.is_active ? (
                                            <><Check className="w-3 h-3 mr-1" /> Active</>
                                        ) : (
                                            <><X className="w-3 h-3 mr-1" /> Inactive</>
                                        )}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Featured</span>
                                    <Badge variant={plan.is_featured ? 'default' : 'secondary'}>
                                        {plan.is_featured ? (
                                            <><Check className="w-3 h-3 mr-1" /> Featured</>
                                        ) : (
                                            <><X className="w-3 h-3 mr-1" /> Not Featured</>
                                        )}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button asChild className="w-full">
                                    <Link href={route('plans.edit', { subscriptionPlan: plan.id })}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Plan
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="w-full"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Plan
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Timestamps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Created:</span>
                                    <p>{new Date(plan.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Updated:</span>
                                    <p>{new Date(plan.updated_at).toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
