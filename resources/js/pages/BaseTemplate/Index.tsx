import React from 'react';
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from '@/layouts/app-layout';
import { useToast } from '@/hooks/use-toast';
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
}

const Index = ({ baseTemplates }: Props) => {
    const { toast } = useToast();
    const { post } = useForm({});

    const useTemplate = (id: number) => {
        post(`/use-template/${id}`);
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
