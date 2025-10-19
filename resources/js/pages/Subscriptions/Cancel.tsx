import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

export default function Cancel() {
    return (
        <AppLayout>
            <Head title="Subscription Canceled" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <XCircle className="mx-auto h-16 w-16 text-orange-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Subscription Canceled
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your subscription was not completed
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">What's Next?</CardTitle>
                            <CardDescription className="text-center">
                                You can try again or explore our free plan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    No worries! You can always come back and subscribe later,
                                    or start with our free plan to explore the features.
                                </p>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button asChild className="w-full">
                                    <Link href={route('subscriptions.index')}>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Try Again
                                    </Link>
                                </Button>

                                <Button variant="outline" asChild className="w-full">
                                    <Link href={route('dashboard')}>
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Dashboard
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Questions about our plans?
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
