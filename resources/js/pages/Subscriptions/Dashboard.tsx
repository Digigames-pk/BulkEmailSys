import { Head, useForm } from '@inertiajs/react';
import { formatPrice } from '@/lib/price-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CreditCard,
    Mail,
    Users,
    FileText,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Calendar
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';

interface UserSubscription {
    id: number;
    subscription_plan: {
        id: number;
        name: string;
        price: number;
        currency: string;
        interval: string;
        max_templates: number;
        max_contacts: number;
        max_emails_per_month: number;
    };
    status: string;
    current_period_start: string;
    current_period_end: string;
    trial_ends_at: string | null;
}

interface Props {
    subscription: UserSubscription | null;
    limits: {
        templates: number;
        contacts: number;
        emails_per_month: number;
    };
    usage: {
        templates: number;
        contacts: number;
        emails_this_month: number;
    };
}

export default function Dashboard({ subscription, limits, usage }: Props) {
    const { delete: destroy, processing } = useForm();

    const handleCancelSubscription = () => {
        if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
            destroy(route('subscriptions.destroy'));
        }
    };

    const getUsagePercentage = (used: number, limit: number) => {
        if (limit === 0) return 0; // Unlimited
        return Math.min((used / limit) * 100, 100);
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'text-red-500';
        if (percentage >= 75) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const isNearLimit = (used: number, limit: number) => {
        if (limit === 0) return false; // Unlimited
        return (used / limit) >= 0.9;
    };

    const isOverLimit = (used: number, limit: number) => {
        if (limit === 0) return false; // Unlimited
        return used > limit;
    };

    const formatLimit = (limit: number) => {
        return limit === 0 ? 'Unlimited' : limit.toLocaleString();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AppLayout>
            <Head title="Subscription Dashboard" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Subscription Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage your subscription and track usage
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('subscriptions.index')}>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Upgrade Plan
                            </Link>
                        </Button>
                    </div>
                </div>

                {!subscription && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            You are currently on the free plan.
                            <Link href={route('subscriptions.index')} className="underline ml-1">
                                Upgrade to unlock more features
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}

                {subscription && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Current Plan: {subscription.subscription_plan.name}
                            </CardTitle>
                            <CardDescription>
                                ${formatPrice(subscription.subscription_plan.price)}/{subscription.subscription_plan.interval}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                                        {subscription.status}
                                    </Badge>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Billing Period</p>
                                    <p className="text-sm">
                                        {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Next Billing</p>
                                    <p className="text-sm">
                                        {formatDate(subscription.current_period_end)}
                                    </p>
                                </div>
                            </div>

                            {subscription.trial_ends_at && (
                                <Alert>
                                    <Calendar className="h-4 w-4" />
                                    <AlertDescription>
                                        You are currently on a trial that ends on {formatDate(subscription.trial_ends_at)}.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Templates Usage */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="w-5 h-5" />
                                Email Templates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Used</span>
                                    <span className={getUsageColor(getUsagePercentage(usage.templates, limits.templates))}>
                                        {usage.templates.toLocaleString()} / {formatLimit(limits.templates)}
                                    </span>
                                </div>
                                <Progress
                                    value={getUsagePercentage(usage.templates, limits.templates)}
                                    className="h-2"
                                />
                            </div>

                            {isOverLimit(usage.templates, limits.templates) && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        You have exceeded your template limit!
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isNearLimit(usage.templates, limits.templates) && !isOverLimit(usage.templates, limits.templates) && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        You're approaching your template limit.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contacts Usage */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="w-5 h-5" />
                                Contacts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Used</span>
                                    <span className={getUsageColor(getUsagePercentage(usage.contacts, limits.contacts))}>
                                        {usage.contacts.toLocaleString()} / {formatLimit(limits.contacts)}
                                    </span>
                                </div>
                                <Progress
                                    value={getUsagePercentage(usage.contacts, limits.contacts)}
                                    className="h-2"
                                />
                            </div>

                            {isOverLimit(usage.contacts, limits.contacts) && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        You have exceeded your contact limit!
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isNearLimit(usage.contacts, limits.contacts) && !isOverLimit(usage.contacts, limits.contacts) && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        You're approaching your contact limit.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Emails Usage */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Mail className="w-5 h-5" />
                                Emails This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Used</span>
                                    <span className={getUsageColor(getUsagePercentage(usage.emails_this_month, limits.emails_per_month))}>
                                        {usage.emails_this_month.toLocaleString()} / {formatLimit(limits.emails_per_month)}
                                    </span>
                                </div>
                                <Progress
                                    value={getUsagePercentage(usage.emails_this_month, limits.emails_per_month)}
                                    className="h-2"
                                />
                            </div>

                            {isOverLimit(usage.emails_this_month, limits.emails_per_month) && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        You have exceeded your monthly email limit!
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isNearLimit(usage.emails_this_month, limits.emails_per_month) && !isOverLimit(usage.emails_this_month, limits.emails_per_month) && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        You're approaching your monthly email limit.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {subscription && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Management</CardTitle>
                            <CardDescription>
                                Manage your subscription settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Button variant="outline" asChild>
                                    <Link href={route('subscriptions.index')}>
                                        Change Plan
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleCancelSubscription}
                                    disabled={processing}
                                >
                                    {processing ? 'Canceling...' : 'Cancel Subscription'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
