import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';

interface Contact {
    id: number;
    name: string;
    email: string;
    mobile?: string;
    gender?: string;
}

interface CreateGroupProps {
    contacts: Contact[];
}

const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
];

export default function CreateGroup({ contacts }: CreateGroupProps) {
    const { t } = useTranslation();

    // === State ===
    const [selectedColor, setSelectedColor] = useState('#3B82F6');
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        color: '#3B82F6',
        contact_ids: [] as number[],
    });


    // === Handlers ===
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Selected contacts before submit:', selectedContacts);

        // Submit with the current data plus contact_ids
        post(route('groups.store'), {
            ...data,
            contact_ids: selectedContacts
        } as any);
    };

    const handleColorSelect = (color: string) => {
        if (color !== selectedColor) {
            setSelectedColor(color);
            setData('color', color);
        }
    };

    const handleSelectContact = (contactId: number) => {
        setSelectedContacts(prev => {
            const exists = prev.includes(contactId);
            return exists ? prev.filter(id => id !== contactId) : [...prev, contactId];
        });
    };

    const handleSelectAll = () => {
        setSelectedContacts(prev =>
            prev.length === contacts.length
                ? []
                : contacts.map(c => c.id)
        );
    };

    // === Render ===
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
                        <h1 className="text-2xl font-semibold">{t('create_group')}</h1>
                        <p className="text-muted-foreground">{t('create_new_contact_group')}</p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('group_details')}</CardTitle>
                        <CardDescription>{t('fill_in_group_information')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Group Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('group_name')} *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={t('enter_group_name')}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">{t('description')}</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder={t('enter_group_description')}
                                    rows={3}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Color Selection */}
                            <div className="space-y-2">
                                <Label>{t('group_color')}</Label>
                                <div className="flex flex-wrap gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => handleColorSelect(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color
                                                ? 'border-gray-900 scale-110'
                                                : 'border-gray-300 hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                {errors.color && (
                                    <p className="text-sm text-red-500">{errors.color}</p>
                                )}
                            </div>

                            {/* Contact Selection */}
                            <div className="space-y-4 pt-6 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">{t('select_contacts')}</Label>
                                    <div className="text-sm text-muted-foreground">
                                        {selectedContacts.length} {t('selected')}
                                    </div>
                                </div>

                                {/* Select All */}
                                <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                                    <Checkbox
                                        checked={
                                            selectedContacts.length === contacts.length &&
                                            contacts.length > 0
                                        }
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <span className="text-sm font-medium">
                                        {t('select_all')} ({contacts.length})
                                    </span>
                                </div>

                                {/* Contact Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                                    {contacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className={`relative p-3 border rounded-lg transition-all hover:shadow-md ${selectedContacts.includes(contact.id)
                                                ? 'border-primary bg-primary/5'
                                                : 'hover:bg-muted/50'
                                                }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <Checkbox
                                                    checked={selectedContacts.includes(contact.id)}
                                                    onCheckedChange={() => handleSelectContact(contact.id)}
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

                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('creating') : t('create_group')}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('groups.index')}>
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
