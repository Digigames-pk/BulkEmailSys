import React from 'react';
import { Head, useForm } from "@inertiajs/react";
import AppLayout from '@/layouts/app-layout';
import { useToast } from '@/hooks/use-toast';
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
}

const Show = ({ baseTemplate }: Props) => {
    const { toast } = useToast();
    const { post } = useForm({});

    const useTemplate = () => {
        post(`/use-template/${baseTemplate.id}`, {
            onError: (errors) => {
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
