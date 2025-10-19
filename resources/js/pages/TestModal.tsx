import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useUpgradeModal } from '@/contexts/UpgradeModalContext';
import { Button } from '@/components/ui/button';

export default function TestModal() {
    const { showUpgradeModal } = useUpgradeModal();

    const testModal = () => {
        showUpgradeModal(
            'templates',
            5,
            3,
            [
                {
                    id: 1,
                    name: 'Free',
                    description: 'Basic plan',
                    price: 0,
                    currency: 'usd',
                    interval: 'month',
                    max_templates: 3,
                    max_contacts: 100,
                    max_emails_per_month: 50,
                    is_featured: false,
                    features: ['3 Templates', '100 Contacts', '50 Emails']
                },
                {
                    id: 2,
                    name: 'Pro',
                    description: 'Professional plan',
                    price: 29.99,
                    currency: 'usd',
                    interval: 'month',
                    max_templates: 50,
                    max_contacts: 1000,
                    max_emails_per_month: 500,
                    is_featured: true,
                    features: ['50 Templates', '1000 Contacts', '500 Emails']
                }
            ],
            null
        );
    };

    return (
        <AppLayout>
            <Head title="Test Modal" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Test Upgrade Modal</h1>
                <Button onClick={testModal}>
                    Show Upgrade Modal
                </Button>
            </div>
        </AppLayout>
    );
}
