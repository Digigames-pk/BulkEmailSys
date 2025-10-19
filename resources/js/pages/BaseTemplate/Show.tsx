import React from 'react';
import { Head, useForm } from "@inertiajs/react";
import AppLayout from '@/layouts/app-layout';
import { useToast } from '@/hooks/use-toast';
import { useUpgradeModal } from '@/contexts/UpgradeModalContext';
import { Button } from '@/components/ui/button';
import '../../../css/emailtemplate.css';

interface BaseTemplate {
    id: number;
    name: string;
    thumbnail: string | null;
    editor_content: string | null;
    mail_content: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    baseTemplate: BaseTemplate;
    plans?: any[];
    currentSubscription?: any;
    limits?: {
        templates: number;
        contacts: number;
        emails_per_month: number;
    };
    usage?: {
        templates: number;
        contacts: number;
        emails_this_month: number;
    };
}

const Show = ({ baseTemplate, plans, currentSubscription, limits, usage }: Props) => {
    const { toast } = useToast();
    const { post } = useForm({});
    const { showUpgradeModal } = useUpgradeModal();

    const useTemplate = () => {
        post(`/use-template/${baseTemplate.id}`, {
            onError: (errors) => {
                // Check if it's a limit reached error
                if (errors.limit_reached && errors.limit_type) {
                    // Show upgrade modal manually
                    showUpgradeModal(
                        errors.limit_type,
                        errors.current_usage || 0,
                        errors.limit || 0,
                        plans || [],
                        currentSubscription || null
                    );
                    return;
                }

                // Handle other errors
                if (errors.message) {
                    toast({
                        title: "Error",
                        description: errors.message,
                        variant: "destructive",
                    });
                }
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`Preview: ${baseTemplate.name}`} />

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded shadow border p-8">
                    <div className="page-header mb-6 flex justify-between items-start">
                        <div>
                            <h1 className="page-title text-2xl mb-2">
                                {baseTemplate.name}
                            </h1>
                            <div className="text-muted text-sm">
                                Created: {new Date(baseTemplate.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <Button onClick={useTemplate} className="ml-4">
                            Use This Template
                        </Button>
                    </div>

                    <div className="template-preview border rounded p-4 bg-gray-50">
                        <div
                            dangerouslySetInnerHTML={{
                                __html: baseTemplate.mail_content || '<p class="text-muted">No content available</p>',
                            }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Show;
