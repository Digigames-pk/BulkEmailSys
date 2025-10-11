import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Search,
    Mail,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    Send,
    Calendar,
    Users
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface EmailCampaign {
    id: number;
    name: string;
    subject: string;
    description: string | null;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    scheduled_at: string | null;
    sent_at: string | null;
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    created_at: string;
    email_template: EmailTemplate;
    group: Group;
}

interface EmailCampaignsIndexProps {
    campaigns: {
        data: EmailCampaign[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function EmailCampaignsIndex({ campaigns }: EmailCampaignsIndexProps) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCampaigns = campaigns.data.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = (campaignId: number) => {
        if (confirm(t('confirm_delete_campaign'))) {
            router.delete(route('email-campaigns.destroy', campaignId));
        }
    };

    const handleSend = (campaignId: number) => {
        if (confirm(t('confirm_send_campaign'))) {
            router.post(route('email-campaigns.send', campaignId));
        }
    };

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
            <Head title={t('email_campaigns')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{t('email_campaigns')}</h1>
                        <p className="text-muted-foreground">
                            {t('manage_email_campaigns')}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('email-campaigns.create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('create_campaign')}
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder={t('search_campaigns')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Campaigns Grid */}
                {filteredCampaigns.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCampaigns.map((campaign) => (
                            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-4 h-4 rounded-full flex-shrink-0 bg-primary flex items-center justify-center">
                                                <Mail className="w-2.5 h-2.5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {campaign.subject}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('email-campaigns.show', campaign.id)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        {t('view')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                {campaign.status === 'draft' && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('email-campaigns.edit', campaign.id)}>
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                {t('edit')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleSend(campaign.id)}>
                                                            <Send className="w-4 h-4 mr-2" />
                                                            {t('send')}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {campaign.status === 'draft' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(campaign.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        {t('delete')}
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                                                    {campaign.total_recipients} {t('recipients')}
                                                </span>
                                            </div>
                                            {getStatusBadge(campaign.status)}
                                        </div>

                                        {campaign.scheduled_at && (
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                                                    {t('scheduled_for')}: {new Date(campaign.scheduled_at).toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        {(campaign.status === 'sent' || campaign.status === 'failed') && (
                                            <div className="text-sm text-muted-foreground">
                                                {t('sent')}: {campaign.sent_count} | {t('failed')}: {campaign.failed_count}
                                            </div>
                                        )}

                                        <div className="text-xs text-muted-foreground">
                                            {t('template')}: {campaign.email_template.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {t('group')}: {campaign.group.name}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {searchTerm ? t('no_campaigns_found') : t('no_campaigns_yet')}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm
                                ? t('try_different_search')
                                : t('create_first_campaign')
                            }
                        </p>
                        {!searchTerm && (
                            <Button asChild>
                                <Link href={route('email-campaigns.create')}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('create_campaign')}
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
