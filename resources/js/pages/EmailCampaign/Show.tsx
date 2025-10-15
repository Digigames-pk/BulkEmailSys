import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Users, Calendar, Send, Edit, Trash2 } from 'lucide-react';

interface EmailTemplate {
    id: number;
    name: string;
    email_subject: string;
}

interface Group {
    id: number;
    name: string;
    description: string | null;
    contacts_count: number;
}

interface Contact {
    id: number;
    name: string;
    email: string;
    mobile?: string;
    gender?: string;
}

interface EmailLog {
    id: number;
    email: string;
    status: 'pending' | 'sent' | 'failed';
    sent_at: string | null;
    error_message?: string;
}

interface EmailCampaign {
    id: number;
    name: string;
    subject: string;
    from_name: string | null;
    reply_to_email: string | null;
    description: string | null;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    scheduled_at: string | null;
    sent_at: string | null;
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    created_at: string;
    email_template: EmailTemplate;
    group: Group & { contacts: Contact[] };
    email_logs: EmailLog[];
}

interface EmailCampaignShowProps {
    campaign: EmailCampaign;
}

export default function EmailCampaignShow({ campaign }: EmailCampaignShowProps) {
    const { t } = useTranslation();

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { variant: 'secondary', label: t('draft') },
            scheduled: { variant: 'outline', label: t('scheduled') },
            sending: { variant: 'default', label: t('sending') },
            sent: { variant: 'default', label: t('sent') },
            failed: { variant: 'destructive', label: t('failed') },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        return <Badge variant={config.variant as any}>{config.label}</Badge>;
    };

    return (
        <AppLayout>
            <Head title={campaign.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('email-campaigns.index')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('back_to_campaigns')}
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">{campaign.name}</h1>
                        <p className="text-muted-foreground">{campaign.subject}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {getStatusBadge(campaign.status)}
                        {campaign.status === 'draft' && (
                            <>
                                <Button asChild>
                                    <Link href={route('email-campaigns.edit', campaign.id)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        {t('edit')}
                                    </Link>
                                </Button>
                                <Button variant="outline">
                                    <Send className="w-4 h-4 mr-2" />
                                    {t('send')}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Campaign Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Mail className="w-5 h-5" />
                                <span>{t('campaign_details')}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">{t('name')}</label>
                                <p className="text-sm">{campaign.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">{t('subject')}</label>
                                <p className="text-sm">{campaign.subject}</p>
                            </div>
                            {campaign.description && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">{t('description')}</label>
                                    <p className="text-sm">{campaign.description}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">{t('status')}</label>
                                <div className="mt-1">{getStatusBadge(campaign.status)}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Template & Group */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="w-5 h-5" />
                                <span>{t('template_and_group')}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">{t('email_template')}</label>
                                <p className="text-sm">{campaign.email_template.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">{t('target_group')}</label>
                                <p className="text-sm">{campaign.group.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {campaign.group.contacts_count} {t('contacts')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>{t('statistics')}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">{t('total_recipients')}</label>
                                <p className="text-sm font-medium">{campaign.total_recipients}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">{t('sent')}</label>
                                <p className="text-sm font-medium text-green-600">{campaign.sent_count}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">{t('failed')}</label>
                                <p className="text-sm font-medium text-red-600">{campaign.failed_count}</p>
                            </div>
                            {campaign.scheduled_at && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">{t('scheduled_for')}</label>
                                    <p className="text-sm">{new Date(campaign.scheduled_at).toLocaleString()}</p>
                                </div>
                            )}
                            {campaign.sent_at && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">{t('sent_at')}</label>
                                    <p className="text-sm">{new Date(campaign.sent_at).toLocaleString()}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recipients List */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('recipients')}</CardTitle>
                        <CardDescription>
                            {t('contacts_in_target_group')} ({campaign.group.contacts.length})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {campaign.group.contacts.map((contact) => (
                                <div key={contact.id} className="p-3 border rounded-lg">
                                    <div className="font-medium text-sm">{contact.name}</div>
                                    <div className="text-xs text-muted-foreground">{contact.email}</div>
                                    {contact.mobile && (
                                        <div className="text-xs text-muted-foreground">{contact.mobile}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
