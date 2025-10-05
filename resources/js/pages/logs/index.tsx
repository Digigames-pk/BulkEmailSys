import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

export default function LogsIndex() {
    const page: any = usePage();
    const { logs } = page.props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Email Logs', href: '/logs' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Logs" />
            <div className="p-8">
                <div className="mb-2 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Email Logs</h1>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="p-2">Email</th>
                                <th className="p-2">Subject</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Template</th>
                                <th className="p-2">Contact</th>
                                <th className="p-2">Sent At</th>
                                <th className="p-2">Error</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.map((l: any) => (
                                <tr key={l.id} className="border-b">
                                    <td className="p-2">{l.email}</td>
                                    <td className="p-2">{l.subject}</td>
                                    <td className="p-2">{l.status}</td>
                                    <td className="p-2">{l.email_template?.name ?? '-'}</td>
                                    <td className="p-2">{l.contact ? `${l.contact.name} <${l.contact.email}>` : '-'}</td>
                                    <td className="p-2">{l.sent_at ?? '-'}</td>
                                    <td className="p-2">{l.error_message ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}


