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
    Users,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Group {
    id: number;
    name: string;
    description: string | null;
    color: string;
    contacts_count: number;
    created_at: string;
    updated_at: string;
}

interface GroupsIndexProps {
    groups: {
        data: Group[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function GroupsIndex({ groups }: GroupsIndexProps) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGroups = groups.data.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = (groupId: number) => {
        if (confirm(t('confirm_delete_group'))) {
            router.delete(route('groups.destroy', groupId));
        }
    };

    return (
        <AppLayout>
            <Head title={t('groups')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{t('groups')}</h1>
                        <p className="text-muted-foreground">
                            {t('manage_contact_groups')}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('groups.create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('create_group')}
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder={t('search_groups')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Groups Grid */}
                {filteredGroups.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredGroups.map((group) => (
                            <Card key={group.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-4 h-4 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: group.color }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg">{group.name}</CardTitle>
                                                {group.description && (
                                                    <CardDescription className="mt-1">
                                                        {group.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {/* <DropdownMenuItem asChild>
                                                    <Link href={route('groups.show', group.id)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        {t('view')}
                                                    </Link>
                                                </DropdownMenuItem> */}
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('groups.edit', group.id)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        {t('edit')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(group.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    {t('delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                {group.contacts_count} {t('contacts')}
                                            </span>
                                        </div>
                                        <Badge variant="secondary">
                                            {new Date(group.created_at).toLocaleDateString()}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {searchTerm ? t('no_groups_found') : t('no_groups_yet')}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm
                                ? t('try_different_search')
                                : t('create_first_group')
                            }
                        </p>
                        {!searchTerm && (
                            <Button asChild>
                                <Link href={route('groups.create')}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('create_group')}
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
