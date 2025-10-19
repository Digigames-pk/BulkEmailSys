import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: 0,
        currency: 'usd',
        interval: 'month',
        trial_days: 0,
        is_active: true,
        is_featured: false,
        max_templates: 0,
        max_contacts: 0,
        max_emails_per_month: 0,
        features: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('plans.store'));
    };

    return (
        <AppLayout>
            <Head title="Create Subscription Plan" />

            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('plans.index')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Plans
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Create Subscription Plan</h1>
                        <p className="text-muted-foreground">
                            Create a new subscription plan with custom limits and pricing
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Plan Details</CardTitle>
                        <CardDescription>
                            Configure the subscription plan settings and limits
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Plan Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Professional Plan"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                        className={errors.price ? 'border-destructive' : ''}
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-destructive">{errors.price}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="usd">USD</SelectItem>
                                            <SelectItem value="eur">EUR</SelectItem>
                                            <SelectItem value="gbp">GBP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="interval">Billing Interval</Label>
                                    <Select value={data.interval} onValueChange={(value) => setData('interval', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="month">Monthly</SelectItem>
                                            <SelectItem value="year">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="trial_days">Trial Days</Label>
                                    <Input
                                        id="trial_days"
                                        type="number"
                                        min="0"
                                        value={data.trial_days}
                                        onChange={(e) => setData('trial_days', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe the plan features and benefits"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Plan Limits</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="max_templates">Max Templates</Label>
                                        <Input
                                            id="max_templates"
                                            type="number"
                                            min="0"
                                            value={data.max_templates}
                                            onChange={(e) => setData('max_templates', parseInt(e.target.value) || 0)}
                                            placeholder="0 = Unlimited"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Set to 0 for unlimited templates
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max_contacts">Max Contacts</Label>
                                        <Input
                                            id="max_contacts"
                                            type="number"
                                            min="0"
                                            value={data.max_contacts}
                                            onChange={(e) => setData('max_contacts', parseInt(e.target.value) || 0)}
                                            placeholder="0 = Unlimited"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Set to 0 for unlimited contacts
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max_emails_per_month">Max Emails/Month</Label>
                                        <Input
                                            id="max_emails_per_month"
                                            type="number"
                                            min="0"
                                            value={data.max_emails_per_month}
                                            onChange={(e) => setData('max_emails_per_month', parseInt(e.target.value) || 0)}
                                            placeholder="0 = Unlimited"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Set to 0 for unlimited emails
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Plan Settings</h3>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active">Active Plan</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Make this plan available for subscription
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_featured">Featured Plan</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Highlight this plan as recommended
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(checked) => setData('is_featured', checked)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('plans.index')}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Plan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
