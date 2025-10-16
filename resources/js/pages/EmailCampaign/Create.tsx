import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Users, Calendar } from 'lucide-react';

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

interface CreateCampaignProps {
    emailTemplates: EmailTemplate[];
    groups: Group[];
}

export default function CreateCampaign({ emailTemplates, groups }: CreateCampaignProps) {
    const { t } = useTranslation();
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        subject: '',
        from_name: '',
        reply_to_email: '',
        description: '',
        email_template_id: '',
        group_id: '',
        scheduled_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('email-campaigns.store'));
    };

    const handleTemplateChange = (templateId: string) => {
        const template = emailTemplates.find(t => t.id.toString() === templateId);
        setSelectedTemplate(template || null);
        setData('email_template_id', templateId);

        // Auto-fill subject if template has one
        if (template?.email_subject) {
            setData('subject', template.email_subject);
        }
    };

    const handleGroupChange = (groupId: string) => {
        const group = groups.find(g => g.id.toString() === groupId);
        setSelectedGroup(group || null);
        setData('group_id', groupId);
    };

    return (
        <AppLayout>
            <Head title={t('create_campaign')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('email-campaigns.index')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('back_to_campaigns')}
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold">{t('create_campaign')}</h1>
                        <p className="text-muted-foreground">{t('create_new_email_campaign')}</p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('campaign_details')}</CardTitle>
                        <CardDescription>{t('fill_in_campaign_information')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Campaign Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('campaign_name')} *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={t('enter_campaign_name')}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Email Template Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="email_template_id">{t('email_template')} *</Label>
                                <Select value={data.email_template_id} onValueChange={handleTemplateChange}>
                                    <SelectTrigger className={errors.email_template_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={t('select_template')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {emailTemplates.map((template) => (
                                            <SelectItem key={template.id} value={template.id.toString()}>
                                                {template.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.email_template_id && (
                                    <p className="text-sm text-red-500">{errors.email_template_id}</p>
                                )}
                                {selectedTemplate && (
                                    <div className="text-sm text-muted-foreground">
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{t('template_subject')}: {selectedTemplate.email_subject}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Group Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="group_id">{t('target_group')} *</Label>
                                <Select value={data.group_id} onValueChange={handleGroupChange}>
                                    <SelectTrigger className={errors.group_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={t('select_group')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group) => (
                                            <SelectItem key={group.id} value={group.id.toString()}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.group_id && (
                                    <p className="text-sm text-red-500">{errors.group_id}</p>
                                )}
                                {selectedGroup && (
                                    <div className="text-sm text-muted-foreground">
                                        <div className="flex items-center space-x-2">
                                            <Users className="w-4 h-4" />
                                            <span>{t('recipients')}: {selectedGroup.contacts_count}</span>
                                        </div>
                                        {selectedGroup.description && (
                                            <p className="mt-1">{selectedGroup.description}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                                <Label htmlFor="subject">{t('email_subject')} *</Label>
                                <Input
                                    id="subject"
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder={t('enter_email_subject')}
                                    className={errors.subject ? 'border-red-500' : ''}
                                />
                                {errors.subject && (
                                    <p className="text-sm text-red-500">{errors.subject}</p>
                                )}
                            </div>

                            {/* From Name */}
                            <div className="space-y-2">
                                <Label htmlFor="from_name">From Name</Label>
                                <Input
                                    id="from_name"
                                    type="text"
                                    value={data.from_name}
                                    onChange={(e) => setData('from_name', e.target.value)}
                                    placeholder="Enter sender name"
                                    className={errors.from_name ? 'border-red-500' : ''}
                                />
                                {errors.from_name && (
                                    <p className="text-sm text-red-500">{errors.from_name}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Leave empty to use default
                                </p>
                            </div>

                            {/* Reply To Email */}
                            <div className="space-y-2">
                                <Label htmlFor="reply_to_email">Reply To Email</Label>
                                <Input
                                    id="reply_to_email"
                                    type="email"
                                    value={data.reply_to_email}
                                    onChange={(e) => setData('reply_to_email', e.target.value)}
                                    placeholder="Enter reply-to email address"
                                    className={errors.reply_to_email ? 'border-red-500' : ''}
                                />
                                {errors.reply_to_email && (
                                    <p className="text-sm text-red-500">{errors.reply_to_email}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Leave empty to use default
                                </p>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">{t('description')}</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder={t('enter_campaign_description')}
                                    rows={3}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Schedule */}
                            <div className="space-y-2">
                                <Label htmlFor="scheduled_at">{t('schedule_send')}</Label>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="scheduled_at"
                                        type="datetime-local"
                                        value={data.scheduled_at}
                                        onChange={(e) => setData('scheduled_at', e.target.value)}
                                        className={errors.scheduled_at ? 'border-red-500' : ''}
                                    />
                                </div>
                                {errors.scheduled_at && (
                                    <p className="text-sm text-red-500">{errors.scheduled_at}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    {t('leave_empty_to_send_immediately')}
                                </p>
                            </div>


                            {/* Actions */}
                            <div className="flex items-center space-x-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('creating') : t('create_campaign')}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('email-campaigns.index')}>
                                        {t('cancel')}
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
