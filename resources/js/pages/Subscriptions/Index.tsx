import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { formatPrice } from '@/lib/price-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Star, Zap } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    max_templates: number;
    max_contacts: number;
    max_emails_per_month: number;
    is_featured: boolean;
    features: string[];
}

interface UserSubscription {
    id: number;
    subscription_plan_id: number;
    status: string;
    current_period_end: string;
}

interface Props {
    plans: SubscriptionPlan[];
    currentSubscription: UserSubscription | null;
}

export default function Index({ plans, currentSubscription }: Props) {
    const { post, processing } = useForm();
    const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);
    const { props } = usePage();
    const errorMessage = (props as any).flash?.error;

    const handleSubscribe = async (planId: number) => {
        setLoadingPlanId(planId);

        try {
            const response = await fetch(route('subscriptions.checkout'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ plan_id: planId }),
            });

            const data = await response.json();

            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                alert(data.error || 'Failed to start checkout process');
            }
        } catch (error) {
            alert('Failed to start checkout process');
        } finally {
            setLoadingPlanId(null);
        }
    };

    const formatLimit = (limit: number) => {
        return limit === 0 ? 'Unlimited' : limit.toLocaleString();
    };

    const getCurrentPlanId = () => {
        return currentSubscription?.subscription_plan_id;
    };

    return (
        <AppLayout>
            <Head title="Subscription Plans" />

            <div className="p-6 space-y-8">
                {/* Error Message */}
                {errorMessage && (
                    <Alert className="max-w-2xl mx-auto">
                        <AlertDescription>
                            {errorMessage}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">Choose Your Plan</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Select the perfect plan for your email marketing needs.
                        Upgrade or downgrade at any time.
                    </p>
                    {plans.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                            <p className="text-yellow-800 text-sm">
                                No subscription plans are currently available. Please contact support.
                            </p>
                        </div>
                    )}
                </div>

                {/* Why Choose Our Plans Section - Moved to Top */}
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold">Why Choose Our Plans?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold">Flexible Limits</h3>
                            <p className="text-sm text-muted-foreground">
                                Choose the plan that fits your needs. Upgrade anytime as you grow.
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold">No Hidden Fees</h3>
                            <p className="text-sm text-muted-foreground">
                                Transparent pricing with no setup fees or hidden charges.
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <Star className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold">Cancel Anytime</h3>
                            <p className="text-sm text-muted-foreground">
                                No long-term contracts. Cancel or change plans whenever you want.
                            </p>
                        </div>
                    </div>
                </div>

                {currentSubscription && (
                    <Card className="border-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-primary" />
                                Current Subscription
                            </CardTitle>
                            <CardDescription>
                                You are currently subscribed to a plan. You can upgrade or manage your subscription.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isCurrentPlan = getCurrentPlanId() === plan.id;
                        const isPopular = plan.is_featured;

                        return (
                            <Card
                                key={plan.id}
                                className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentPlan ? 'border-green-500' : ''}`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-primary text-primary-foreground">
                                            <Star className="w-3 h-3 mr-1" />
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}

                                {isCurrentPlan && (
                                    <div className="absolute -top-3 right-4">
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            Current Plan
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="text-center pb-4">
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription className="text-base">
                                        {plan.description}
                                    </CardDescription>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold">
                                            ${formatPrice(plan.price)}
                                        </span>
                                        <span className="text-muted-foreground">/{plan.interval}</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-500" />
                                            <span className="text-sm">
                                                <strong>{formatLimit(plan.max_templates)}</strong> Email Templates
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-500" />
                                            <span className="text-sm">
                                                <strong>{formatLimit(plan.max_contacts)}</strong> Contacts
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-500" />
                                            <span className="text-sm">
                                                <strong>{formatLimit(plan.max_emails_per_month)}</strong> Emails per Month
                                            </span>
                                        </div>
                                        {plan.features && plan.features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-500" />
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        className="w-full"
                                        variant={isPopular ? 'default' : 'outline'}
                                        disabled={isCurrentPlan || loadingPlanId === plan.id}
                                        onClick={() => handleSubscribe(plan.id)}
                                    >
                                        {isCurrentPlan ? 'Current Plan' :
                                            loadingPlanId === plan.id ? 'Processing...' : 'Subscribe'}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
