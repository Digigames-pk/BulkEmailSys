import React, { useState, useEffect, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Users, Mail, Phone } from 'lucide-react';
import { Link } from '@inertiajs/react';

const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
];

interface Contact {
    id: number;
    name: string;
    email: string;
    mobile?: string;
    gender?: string;
}

interface CreateWithContactsProps {
    contactsUrl: string;
}

export default function CreateGroupWithContacts({ contactsUrl }: CreateWithContactsProps) {
    const { t } = useTranslation();
    const [selectedColor, setSelectedColor] = useState('#3B82F6');
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [hasMoreContacts, setHasMoreContacts] = useState(true);
    const [contactPage, setContactPage] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        color: '#3B82F6',
        contact_ids: [] as number[],
    });

    const fetchAvailableContacts = useCallback(async (page = 1, reset = false) => {
        try {
            setLoadingContacts(true);
            const response = await fetch(`${contactsUrl}?page=${page}&per_page=10`);
            const data = await response.json();

            if (reset) {
                setAvailableContacts(data.data || data);
                setContactPage(1);
            } else {
                setAvailableContacts(prev => [...prev, ...(data.data || data)]);
                setContactPage(page);
            }

            setHasMoreContacts(data.has_more || (data.data && data.data.length === 10) || false);
        } catch (error) {
            console.error('Error fetching available contacts:', error);
        } finally {
            setLoadingContacts(false);
        }
    }, [contactsUrl]);

    useEffect(() => {
        fetchAvailableContacts(1, true);
    }, [fetchAvailableContacts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('contact_ids', selectedContacts);
        post(route('groups.store'));
    };

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setData('color', color);
    };

    const handleSelectContact = (contactId: number) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleSelectAll = () => {
        if (selectedContacts.length === availableContacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(availableContacts.map(contact => contact.id));
        }
    };

    return (
        <AppLayout>
            <Head title={t('create_group')} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('groups.index')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('back_to_groups')}
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{t('create_group')}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t('create_new_contact_group')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Group Details Form */}
                    <Card>
                        <CardHeader className="pb-6">
                            <CardTitle className="text-2xl">{t('group_details')}</CardTitle>
                            <CardDescription className="text-base">
                                {t('fill_in_group_information')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Group Name */}
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-base font-medium">{t('group_name')} *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('enter_group_name')}
                                        className={`h-12 text-base ${errors.name ? 'border-red-500' : ''}`}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-base font-medium">{t('description')}</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder={t('enter_group_description')}
                                        rows={3}
                                        className={`text-base ${errors.description ? 'border-red-500' : ''}`}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                    )}
                                </div>

                                {/* Color Selection */}
                                <div className="space-y-4">
                                    <Label className="text-base font-medium">{t('group_color')}</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => handleColorSelect(color)}
                                                className={`w-10 h-10 rounded-full border-3 transition-all hover:scale-110 ${selectedColor === color
                                                    ? 'border-gray-900 scale-110 shadow-lg'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    {errors.color && (
                                        <p className="text-sm text-red-500 mt-1">{errors.color}</p>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Contact Selection */}
                    <Card>
                        <CardHeader className="pb-6">
                            <CardTitle className="text-2xl">{t('select_contacts')}</CardTitle>
                            <CardDescription className="text-base">
                                {t('choose_contacts_to_add_to_group')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Select All */}
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        checked={selectedContacts.length === availableContacts.length && availableContacts.length > 0}
                                        onCheckedChange={handleSelectAll}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm font-medium">
                                        {t('select_all')} ({availableContacts.length})
                                    </span>
                                </div>
                                {selectedContacts.length > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        {selectedContacts.length} {t('selected')}
                                    </div>
                                )}
                            </div>

                            {/* Contact Grid */}
                            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                                {availableContacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className={`relative p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedContacts.includes(contact.id)
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted/50'
                                            }`}
                                        onClick={() => handleSelectContact(contact.id)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                checked={selectedContacts.includes(contact.id)}
                                                onChange={() => handleSelectContact(contact.id)}
                                                className="h-4 w-4 mt-0.5"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{contact.name}</h4>
                                                <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                                                {contact.mobile && (
                                                    <p className="text-xs text-muted-foreground truncate">{contact.mobile}</p>
                                                )}
                                                {contact.gender && (
                                                    <Badge variant="outline" className="text-xs mt-1">
                                                        {contact.gender}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More Button */}
                            {hasMoreContacts && (
                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => fetchAvailableContacts(contactPage + 1)}
                                        disabled={loadingContacts}
                                        size="sm"
                                    >
                                        {loadingContacts ? t('loading') : t('load_more')}
                                    </Button>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center space-x-4 pt-4 border-t">
                                <Button
                                    type="submit"
                                    disabled={processing || selectedContacts.length === 0}
                                    onClick={handleSubmit}
                                    size="lg"
                                    className="px-8"
                                >
                                    {processing ? t('creating') : t('create_group')} ({selectedContacts.length})
                                </Button>
                                <Button type="button" variant="outline" size="lg" asChild>
                                    <Link href={route('groups.index')}>
                                        {t('cancel')}
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
