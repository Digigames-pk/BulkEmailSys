import React from 'react';
import { Head } from "@inertiajs/react";
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
    emailTemplate: EmailTemplate;
}

const Show = ({ emailTemplate }: Props) => {
    return (
        <AppLayout>
            <Head title={`Preview: ${emailTemplate.name}`} />

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded shadow border p-8">
                    <div className="page-header mb-6">
                        <div>
                            <h1 className="page-title text-2xl mb-2">
                                {emailTemplate.name}
                            </h1>
                            {emailTemplate.email_subject && (
                                <div className="text-lg text-primary-700 mb-2">
                                    <strong>Subject:</strong> {emailTemplate.email_subject}
                                </div>
                            )}
                            <div className="text-muted text-sm">
                                Created: {new Date(emailTemplate.created_at).toLocaleDateString()}
                                {emailTemplate.updated_at !== emailTemplate.created_at && (
                                    <span className="ml-4">
                                        Updated: {new Date(emailTemplate.updated_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            {emailTemplate.csv_file && (
                                <div className="mt-2">
                                    <a
                                        href={`/storage/${emailTemplate.csv_file}`}
                                        download
                                        className="btn btn-secondary text-sm"
                                    >
                                        📄 Download CSV File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="template-preview border rounded p-4 bg-gray-50">
                        <div
                            dangerouslySetInnerHTML={{
                                __html: emailTemplate.mail_content || '<p class="text-muted">No content available</p>',
                            }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Show;
