import React from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from '@/layouts/app-layout';
import { useToast } from '@/hooks/use-toast';
import { useUpgradeModal } from '@/contexts/UpgradeModalContext';
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
    baseTemplates: BaseTemplate[];
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

const Index = ({ baseTemplates, plans, currentSubscription, limits, usage }: Props) => {
    const { toast } = useToast();
    const { post } = useForm({});
    const { showUpgradeModal } = useUpgradeModal();

    const useTemplate = (id: number) => {
        post(`/use-template/${id}`, {
            onError: (errors) => {
                console.log('Error received:', errors); // Debug log

                // Check if it's a limit reached error
                if (errors.limit_reached && errors.limit_type) {
                    console.log('Showing upgrade modal for:', errors.limit_type); // Debug log
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

    const previewTemplate = (id: number) => {
        const url = `/base-template/${id}`;
        const win = window.open(url, '_blank');
        if (win) {
            win.focus();
        } else {
            toast({
                title: "Popup Blocked",
                description: "Please allow popups for this site.",
                variant: "destructive",
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Base Templates" />

            <div className="container mx-auto px-4 py-8">
                <div className="page-header">
                    <h1 className="page-title">Base Templates</h1>
                    <Link
                        href={'/email-template'}
                        className="btn btn-secondary"
                    >
                        My Email Templates
                    </Link>
                </div>

                <div className="template-grid">
                    {baseTemplates.map((template) => (
                        <div key={template.id} className="templateCard">
                            <div className="card-header">
                                {template.name}
                            </div>
                            <div className="card-body">
                                <div className="templateImageWrapper">
                                    <img
                                        src={
                                            template.thumbnail
                                                ? `/storage/${template.thumbnail}`
                                                : 'https://via.placeholder.com/300x200?text=No+Preview'
                                        }
                                        alt="Template Thumbnail"
                                        className="templateImage"
                                    />
                                    <div className="hoverButtons">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                                useTemplate(template.id);
                                            }}
                                        >
                                            Use Template
                                        </button>
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={() => previewTemplate(template.id)}
                                        >
                                            Preview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {baseTemplates.length === 0 && (
                    <div className="empty-state">
                        <div className="text-muted text-lg">No base templates available</div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default Index;
