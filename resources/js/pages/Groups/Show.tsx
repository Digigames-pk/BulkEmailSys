import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Users,
    Plus,
    Search,
    Mail,
    Phone,
    User
} from 'lucide-react';

interface Contact {
    id: number;
    name: string;
    email: string;
    mobile: string | null;
    gender: string | null;
    pivot: {
        created_at: string;
    };
}

interface Group {
    id: number;
    name: string;
    description: string | null;
    color: string;
    contacts: Contact[];
    created_at: string;
    updated_at: string;
}

interface GroupShowProps {
    group: Group;
}

export default function ShowGroup({ group }: GroupShowProps) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
    const [showAddContacts, setShowAddContacts] = useState(false);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [hasMoreContacts, setHasMoreContacts] = useState(true);
    const [contactPage, setContactPage] = useState(1);

    const filteredContacts = group.contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (showAddContacts) {
            fetchAvailableContacts(1, true);
        }
    }, [showAddContacts]);

    const fetchAvailableContacts = async (page = 1, reset = false) => {
        try {
            setLoadingContacts(true);
            const response = await fetch(`${route('groups.available-contacts', group.id)}?page=${page}`);
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
    };

    const handleAddContacts = () => {
        if (selectedContacts.length > 0) {
            router.post(route('groups.add-contacts', group.id), {
                contact_ids: selectedContacts
            }, {
                onSuccess: () => {
                    setSelectedContacts([]);
                    setShowAddContacts(false);
                }
            });
        }
    };

    const handleRemoveContacts = () => {
        if (selectedContacts.length > 0) {
            router.post(route('groups.remove-contacts', group.id), {
                contact_ids: selectedContacts
            }, {
                onSuccess: () => {
                    setSelectedContacts([]);
                }
            });
        }
    };

    const handleSelectContact = (contactId: number) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleSelectAll = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filteredContacts.map(contact => contact.id));
        }
    };

    return (
        <AppLayout>
            <Head title={`${group.name} - ${t('groups')}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('groups.index')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t('back_to_groups')}
                            </Link>
                        </Button>
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: group.color }}
                            />
                            <div>
                                <h1 className="text-3xl font-bold">{group.name}</h1>
                                {group.description && (
                                    <p className="text-muted-foreground mt-1">
                                        {group.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('groups.edit', group.id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                {t('edit')}
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (confirm(t('confirm_delete_group'))) {
                                    router.delete(route('groups.destroy', group.id));
                                }
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('delete')}
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('total_contacts')}</p>
                                    <p className="text-2xl font-bold">{group.contacts.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <User className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('created')}</p>
                                    <p className="text-2xl font-bold">
                                        {new Date(group.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Edit className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('last_updated')}</p>
                                    <p className="text-2xl font-bold">
                                        {new Date(group.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contacts Management */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{t('contacts')}</CardTitle>
                                <CardDescription>
                                    {t('manage_contacts_in_group')}
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                {selectedContacts.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleRemoveContacts}
                                    >
                                        {t('remove_selected')} ({selectedContacts.length})
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAddContacts(!showAddContacts)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('add_contacts')}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder={t('search_contacts')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Add Contacts Modal */}
                        {showAddContacts && (
                            <div className="mb-8 p-6 border rounded-xl bg-muted/30 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">{t('add_contacts_to_group')}</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setShowAddContacts(false);
                                            setSelectedContacts([]);
                                            setAvailableContacts([]);
                                        }}
                                    >
                                        ✕
                                    </Button>
                                </div>

                                {/* Contact Selection Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
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
                                    <div className="flex justify-center mt-4">
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

                                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        {selectedContacts.length} {t('contacts')} {t('selected')}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowAddContacts(false);
                                                setSelectedContacts([]);
                                                setAvailableContacts([]);
                                            }}
                                        >
                                            {t('cancel')}
                                        </Button>
                                        <Button
                                            onClick={handleAddContacts}
                                            disabled={selectedContacts.length === 0}
                                        >
                                            {t('add_selected')} ({selectedContacts.length})
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contacts List */}
                        {filteredContacts.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                                            onCheckedChange={handleSelectAll}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm font-medium">
                                            {t('select_all')} ({filteredContacts.length})
                                        </span>
                                    </div>
                                    {selectedContacts.length > 0 && (
                                        <div className="text-sm text-muted-foreground">
                                            {selectedContacts.length} {t('selected')}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {filteredContacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className="flex items-center space-x-4 p-4 border rounded-xl hover:bg-muted/30 transition-colors"
                                        >
                                            <Checkbox
                                                checked={selectedContacts.includes(contact.id)}
                                                onCheckedChange={() => handleSelectContact(contact.id)}
                                                className="h-4 w-4"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="font-semibold text-base">{contact.name}</h4>
                                                    {contact.gender && (
                                                        <Badge variant="secondary" className="text-xs px-2 py-1">
                                                            {contact.gender}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                                    <div className="flex items-center space-x-2">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{contact.email}</span>
                                                    </div>
                                                    {contact.mobile && (
                                                        <div className="flex items-center space-x-2">
                                                            <Phone className="w-4 h-4" />
                                                            <span>{contact.mobile}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-1">
                                                <Badge variant="outline" className="text-xs px-2 py-1">
                                                    {new Date(contact.pivot.created_at).toLocaleDateString()}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 px-6">
                                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Users className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">
                                    {searchTerm ? t('no_contacts_found') : t('no_contacts_in_group')}
                                </h3>
                                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                    {searchTerm
                                        ? t('try_different_search')
                                        : t('add_contacts_to_get_started')
                                    }
                                </p>
                                {!searchTerm && (
                                    <Button
                                        onClick={() => setShowAddContacts(true)}
                                        size="lg"
                                        className="px-8 py-3"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        {t('add_contacts')}
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
