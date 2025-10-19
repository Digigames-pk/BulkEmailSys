import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, FileText, MailCheck, TrendingUp, Users as UsersIcon, CreditCard, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from '@/route-helper';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type TimeseriesPoint = { date: string; sent: number; failed: number };

type PageProps = {
    stats: {
        contacts: number;
        templates: number;
        emails: { total: number; sent: number; failed: number };
    };
    timeseries: TimeseriesPoint[];
    topTemplates: { id: number; name: string; sent: number }[];
    recentEmails: { id: number; email: string; subject: string; status: string; created_at: string | null }[];
    subscription: {
        current: {
            id: number;
            subscription_plan: {
                name: string;
                price: number;
                currency: string;
                interval: string;
            };
            status: string;
        } | null;
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
    };
};

function numberFormat(n: number) {
    return new Intl.NumberFormat().format(n);
}

function MiniBarChart({ values, className = '' }: { values: number[]; className?: string }) {
    const max = Math.max(1, ...values);
    const width = 120;
    const height = 36;
    const barWidth = width / values.length;
    return (
        <svg width={width} height={height} className={className} aria-hidden="true">
            {values.map((v, i) => {
                const h = (v / max) * (height - 4);
                const x = i * barWidth + 1;
                const y = height - h - 2;
                return <rect key={i} x={x} y={y} width={Math.max(1, barWidth - 2)} height={h} rx={2} className="fill-primary/70" />;
            })}
        </svg>
    );
}

function MiniDualArea({ sent, failed }: { sent: number[]; failed: number[] }) {
    const width = 520;
    const height = 140;
    const padding = 24;
    const n = Math.max(sent.length, failed.length);
    const all = [...sent, ...failed];
    const max = Math.max(1, ...all);
    const xStep = (width - padding * 2) / Math.max(1, n - 1);

    const toPoints = (arr: number[]) =>
        arr.map((v, i) => [padding + i * xStep, height - padding - (v / max) * (height - padding * 2)] as const);

    const path = (pts: readonly (readonly [number, number])[]) =>
        pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');

    const sentPts = toPoints(sent);
    const failedPts = toPoints(failed);

    return (
        <svg width={width} height={height} className="w-full" role="img" aria-label="Email delivery trend">
            <defs>
                <linearGradient id="sentGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="failGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
            </defs>
            {sentPts.length > 1 && (
                <>
                    <path d={`${path(sentPts)} L ${padding + (sentPts.length - 1) * xStep},${height - padding} L ${padding},${height - padding} Z`} fill="url(#sentGrad)" />
                    <path d={path(sentPts)} className="stroke-primary" fill="none" strokeWidth={2} />
                </>
            )}
            {failedPts.length > 1 && (
                <>
                    <path d={`${path(failedPts)} L ${padding + (failedPts.length - 1) * xStep},${height - padding} L ${padding},${height - padding} Z`} fill="url(#failGrad)" />
                    <path d={path(failedPts)} className="stroke-red-500" fill="none" strokeWidth={2} />
                </>
            )}
            {/* Axes */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-muted" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="stroke-muted" />
        </svg>
    );
}

export default function Dashboard() {
    const { t } = useTranslation();
    const { props } = usePage<PageProps>();
    const stats = props.stats;
    const series = props.timeseries ?? [];
    const sentArr = series.map((d) => d.sent);
    const failArr = series.map((d) => d.failed);
    const subscription = props.subscription;

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardDescription>Total Contacts</CardDescription>
                                    <CardTitle className="text-3xl">{numberFormat(stats.contacts)}</CardTitle>
                                </div>
                                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                                    <UsersIcon className="size-5" />
                                </span>
                            </div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardDescription>Email Templates</CardDescription>
                                    <CardTitle className="text-3xl">{numberFormat(stats.templates)}</CardTitle>
                                </div>
                                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                    <FileText className="size-5" />
                                </span>
                            </div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardDescription>Emails Sent</CardDescription>
                                    <CardTitle className="text-3xl text-green-600 dark:text-green-400">{numberFormat(stats.emails.sent)}</CardTitle>
                                </div>
                                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                    <MailCheck className="size-5" />
                                </span>
                            </div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardDescription>Emails Failed</CardDescription>
                                    <CardTitle className="text-3xl text-red-600 dark:text-red-400">{numberFormat(stats.emails.failed)}</CardTitle>
                                </div>
                                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                    <AlertTriangle className="size-5" />
                                </span>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Subscription Progress */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Plan Usage
                                </CardTitle>
                                <CardDescription>
                                    {subscription.current ?
                                        `Current Plan: ${subscription.current.subscription_plan.name}` :
                                        'You are on the free plan'
                                    }
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('subscriptions.dashboard')}>
                                    Manage Subscription
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Templates Usage */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Templates
                                    </span>
                                    <span className={getUsageColor(getUsagePercentage(subscription.usage.templates, subscription.limits.templates))}>
                                        {subscription.usage.templates.toLocaleString()} / {formatLimit(subscription.limits.templates)}
                                    </span>
                                </div>
                                <Progress
                                    value={getUsagePercentage(subscription.usage.templates, subscription.limits.templates)}
                                    className="h-2"
                                />
                                {isOverLimit(subscription.usage.templates, subscription.limits.templates) && (
                                    <Alert className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            Template limit exceeded!
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {isNearLimit(subscription.usage.templates, subscription.limits.templates) && !isOverLimit(subscription.usage.templates, subscription.limits.templates) && (
                                    <Alert className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            Approaching template limit
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Contacts Usage */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <UsersIcon className="w-4 h-4" />
                                        Contacts
                                    </span>
                                    <span className={getUsageColor(getUsagePercentage(subscription.usage.contacts, subscription.limits.contacts))}>
                                        {subscription.usage.contacts.toLocaleString()} / {formatLimit(subscription.limits.contacts)}
                                    </span>
                                </div>
                                <Progress
                                    value={getUsagePercentage(subscription.usage.contacts, subscription.limits.contacts)}
                                    className="h-2"
                                />
                                {isOverLimit(subscription.usage.contacts, subscription.limits.contacts) && (
                                    <Alert className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            Contact limit exceeded!
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {isNearLimit(subscription.usage.contacts, subscription.limits.contacts) && !isOverLimit(subscription.usage.contacts, subscription.limits.contacts) && (
                                    <Alert className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            Approaching contact limit
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Emails Usage */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <MailCheck className="w-4 h-4" />
                                        Emails This Month
                                    </span>
                                    <span className={getUsageColor(getUsagePercentage(subscription.usage.emails_this_month, subscription.limits.emails_per_month))}>
                                        {subscription.usage.emails_this_month.toLocaleString()} / {formatLimit(subscription.limits.emails_per_month)}
                                    </span>
                                </div>
                                <Progress
                                    value={getUsagePercentage(subscription.usage.emails_this_month, subscription.limits.emails_per_month)}
                                    className="h-2"
                                />
                                {isOverLimit(subscription.usage.emails_this_month, subscription.limits.emails_per_month) && (
                                    <Alert className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            Monthly email limit exceeded!
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {isNearLimit(subscription.usage.emails_this_month, subscription.limits.emails_per_month) && !isOverLimit(subscription.usage.emails_this_month, subscription.limits.emails_per_month) && (
                                    <Alert className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            Approaching monthly email limit
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Trend + Breakdown */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Delivery Trend (14 days)</CardTitle>
                                    <CardDescription>Sent vs Failed</CardDescription>
                                </div>
                                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="inline-block size-2 rounded-full bg-primary" /> Sent
                                    <span className="inline-block size-2 rounded-full bg-red-500" /> Failed
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <MiniDualArea sent={sentArr} failed={failArr} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Last 14 Days Totals</CardTitle>
                                    <CardDescription>Daily sent emails</CardDescription>
                                </div>
                                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                    <TrendingUp className="size-5" />
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <MiniBarChart values={sentArr} className="mt-2" />
                            <div className="mt-4 text-sm text-muted-foreground">
                                Total: {numberFormat(stats.emails.total)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Templates + Recent Activity */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Templates</CardTitle>
                            <CardDescription>By sent emails</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="divide-y">
                                {(props.topTemplates ?? []).map((t) => (
                                    <li key={t.id} className="flex items-center justify-between py-3">
                                        <span className="flex min-w-0 items-center gap-2 truncate pr-4">
                                            <span className="inline-flex size-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                                <FileText className="size-3.5" />
                                            </span>
                                            <span className="truncate">{t.name}</span>
                                        </span>
                                        <span className="text-muted-foreground">{numberFormat(t.sent)}</span>
                                    </li>
                                ))}
                                {(!props.topTemplates || props.topTemplates.length === 0) && (
                                    <li className="py-3 text-muted-foreground">No templates yet</li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Email Activity</CardTitle>
                            <CardDescription>Latest 10 emails</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-muted-foreground">
                                            <th className="py-2 pr-4 font-medium">Email</th>
                                            <th className="py-2 pr-4 font-medium">Subject</th>
                                            <th className="py-2 pr-4 font-medium">Status</th>
                                            <th className="py-2 font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(props.recentEmails ?? []).map((r) => (
                                            <tr key={r.id} className="border-t">
                                                <td className="py-2 pr-4">{r.email}</td>
                                                <td className="py-2 pr-4 truncate max-w-[260px]">{r.subject}</td>
                                                <td className="py-2 pr-4">
                                                    <span
                                                        className={
                                                            r.status === 'sent'
                                                                ? 'inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                                : r.status === 'failed'
                                                                    ? 'inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                                    : 'inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                                        }
                                                    >
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="py-2">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                                        {(!props.recentEmails || props.recentEmails.length === 0) && (
                                            <tr>
                                                <td className="py-3 text-muted-foreground" colSpan={4}>No recent activity</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
