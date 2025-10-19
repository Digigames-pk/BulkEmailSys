import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, AlertTriangle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { formatPrice } from '@/lib/price-utils';

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

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    limitType: 'templates' | 'contacts' | 'emails';
    currentUsage: number;
    currentLimit: number;
    plans: SubscriptionPlan[];
    currentPlanId?: number;
}

export default function UpgradeModal({
    isOpen,
    onClose,
    limitType,
    currentUsage,
    currentLimit,
    plans,
    currentPlanId
}: UpgradeModalProps) {
    const getLimitMessage = () => {
        switch (limitType) {
            case 'templates':
                return {
                    title: 'Template Limit Reached',
                    description: `You've reached your limit of ${currentLimit} email templates. Upgrade your plan to create more templates.`,
                    icon: <AlertTriangle className="w-6 h-6 text-orange-500" />
                };
            case 'contacts':
                return {
                    title: 'Contact Limit Reached',
                    description: `You've reached your limit of ${currentLimit.toLocaleString()} contacts. Upgrade your plan to add more contacts.`,
                    icon: <AlertTriangle className="w-6 h-6 text-orange-500" />
                };
            case 'emails':
                return {
                    title: 'Email Limit Reached',
                    description: `You've reached your monthly limit of ${currentLimit.toLocaleString()} emails. Upgrade your plan to send more emails.`,
                    icon: <AlertTriangle className="w-6 h-6 text-orange-500" />
                };
            default:
                return {
                    title: 'Plan Limit Reached',
                    description: 'You\'ve reached your plan limit. Upgrade to continue.',
                    icon: <AlertTriangle className="w-6 h-6 text-orange-500" />
                };
        }
    };

    const limitMessage = getLimitMessage();

    // Filter out current plan and sort by price
    const availablePlans = plans
        .filter(plan => plan.id !== currentPlanId)
        .sort((a, b) => a.price - b.price);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {limitMessage.icon}
                        {limitMessage.title}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        {limitMessage.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current Usage Display */}
                    <Card className="border-orange-200 bg-orange-50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                Current Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {limitType === 'templates' ? 'Templates Used' :
                                        limitType === 'contacts' ? 'Contacts Added' : 'Emails Sent This Month'}
                                </span>
                                <span className="font-semibold text-orange-600">
                                    {currentUsage.toLocaleString()} / {currentLimit === 0 ? '∞' : currentLimit.toLocaleString()}
                                </span>
                            </div>
                            {currentLimit > 0 && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min((currentUsage / currentLimit) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Available Plans */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Upgrade Your Plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availablePlans.map((plan) => {
                                const isPopular = plan.is_featured;
                                const getLimitForType = () => {
                                    switch (limitType) {
                                        case 'templates':
                                            return plan.max_templates;
                                        case 'contacts':
                                            return plan.max_contacts;
                                        case 'emails':
                                            return plan.max_emails_per_month;
                                        default:
                                            return 0;
                                    }
                                };

                                const planLimit = getLimitForType();

                                return (
                                    <Card
                                        key={plan.id}
                                        className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
                                    >
                                        {isPopular && (
                                            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                                                <Star className="w-3 h-3 mr-1" />
                                                Popular
                                            </Badge>
                                        )}
                                        <CardHeader className="text-center pb-4">
                                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                                            <CardDescription className="text-sm">
                                                {plan.description}
                                            </CardDescription>
                                            <div className="text-3xl font-bold text-primary">
                                                {plan.price === 0 ? 'Free' : `$${formatPrice(plan.price)}`}
                                                {plan.price > 0 && (
                                                    <span className="text-sm font-normal text-muted-foreground">
                                                        /{plan.interval}
                                                    </span>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Templates</span>
                                                    <span className="font-medium">
                                                        {plan.max_templates === 0 ? 'Unlimited' : plan.max_templates.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Contacts</span>
                                                    <span className="font-medium">
                                                        {plan.max_contacts === 0 ? 'Unlimited' : plan.max_contacts.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Emails/Month</span>
                                                    <span className="font-medium">
                                                        {plan.max_emails_per_month === 0 ? 'Unlimited' : plan.max_emails_per_month.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Highlight the relevant limit */}
                                            <div className="bg-primary/10 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-primary font-semibold">
                                                    <Zap className="w-4 h-4" />
                                                    {limitType === 'templates' && `${plan.max_templates === 0 ? 'Unlimited' : plan.max_templates.toLocaleString()} Templates`}
                                                    {limitType === 'contacts' && `${plan.max_contacts === 0 ? 'Unlimited' : plan.max_contacts.toLocaleString()} Contacts`}
                                                    {limitType === 'emails' && `${plan.max_emails_per_month === 0 ? 'Unlimited' : plan.max_emails_per_month.toLocaleString()} Emails/Month`}
                                                </div>
                                            </div>

                                            <Button asChild className="w-full">
                                                <Link href={route('subscriptions.index')}>
                                                    Upgrade to {plan.name}
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Maybe Later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
