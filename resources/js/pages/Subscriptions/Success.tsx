import { Head, Link } from '@inertiajs/react';
import { formatPrice } from '@/lib/price-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface UserSubscription {
    id: number;
    subscription_plan: {
        name: string;
        price: number;
        currency: string;
        interval: string;
    };
    status: string;
    current_period_end: string;
}

interface Props {
    subscription: UserSubscription;
}

export default function Success({ subscription }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AppLayout>
            <Head title="Subscription Successful" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Subscription Successful!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Welcome to your new plan
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">Your Subscription Details</CardTitle>
                            <CardDescription className="text-center">
                                You're all set up and ready to go
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-primary">
                                    {subscription.subscription_plan.name}
                                </h3>
                                <p className="text-lg text-muted-foreground">
                                    ${formatPrice(subscription.subscription_plan.price)}/{subscription.subscription_plan.interval}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <span className="text-sm font-medium capitalize">
                                        {subscription.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Next Billing Date</span>
                                    <span className="text-sm font-medium">
                                        {formatDate(subscription.current_period_end)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button asChild className="w-full">
                                    <Link href={route('subscriptions.dashboard')}>
                                        Go to Dashboard
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>

                                <Button variant="outline" asChild className="w-full">
                                    <Link href={route('dashboard')}>
                                        View Usage
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Need help?
                            <a href="mailto:support@example.com" className="font-medium text-primary hover:text-primary/80 ml-1">
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
