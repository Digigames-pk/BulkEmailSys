import React from 'react';
import { router, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import '../../../css/emailtemplate.css';

interface EmailTemplate {
    id: number;
    name: string;
    email_subject: string | null;
    csv_file: string | null;
    thumbnail: string | null;
    editor_content: string | null;
    mail_content: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    emailTemplates: EmailTemplate[];
}

const Index = ({ emailTemplates }: Props) => {

    const previewTemplate = (id: number) => {
        const url = `/email-template/${id}`;
        const win = window.open(url, '_blank');
        if (win) {
            win.focus();
        } else {
            alert('Popup blocked! Please allow popups for this site.');
        }
    };

    const editTemplate = (id: number) => {
        router.visit(`/email-template/${id}/edit`);
    };

    const deleteTemplate = (id: number) => {
        if (confirm(`Are you sure you want to delete template #${id}? This action cannot be undone.`)) {
            router.delete(`/email-template/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Email Templates" />

            <div className="container mx-auto px-4 py-8">
                <div className="page-header">
                    <h1 className="page-title">My Email Templates</h1>
                    <div className="flex gap-3">
                        <Link
                            href={'/base-template'}
                            className="btn btn-secondary"
                        >
                            Browse Base Templates
                        </Link>
                        <Link
                            href={'/email-template/create'}
                            className="btn btn-primary"
                        >
                            Create New Template
                        </Link>
                    </div>
                </div>

                <div className="template-grid">
                    {emailTemplates.map((template) => (
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
                                            className="btn btn-outline-light"
                                            onClick={() => previewTemplate(template.id)}
                                        >
                                            Preview
                                        </button>
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={() => editTemplate(template.id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => deleteTemplate(template.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {emailTemplates.length === 0 && (
                    <div className="empty-state">
                        <div className="text-muted text-lg mb-4">No email templates created yet</div>
                        <Link
                            href={'/email-template/create'}
                            className="btn btn-primary"
                        >
                            Create Your First Template
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default Index;
