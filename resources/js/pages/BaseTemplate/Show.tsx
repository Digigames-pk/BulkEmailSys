import React from 'react';
import { Head } from "@inertiajs/react";
import AppLayout from '@/layouts/app-layout';
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
}

const Show = ({ baseTemplate }: Props) => {
    return (
        <AppLayout>
            <Head title={`Preview: ${baseTemplate.name}`} />

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded shadow border p-8">
                    <div className="page-header mb-6">
                        <div>
                            <h1 className="page-title text-2xl mb-2">
                                {baseTemplate.name}
                            </h1>
                            <div className="text-muted text-sm">
                                Created: {new Date(baseTemplate.created_at).toLocaleDateString()}
                            </div>
                        </div>
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
