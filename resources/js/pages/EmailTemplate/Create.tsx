import React, { useRef, useState } from 'react';
import EmailEditor, { EditorRef } from 'react-email-editor';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import '../../../css/emailtemplate.css';

// Interface removed as it's not used in this component

const Create = () => {
    const emailEditorRef = useRef<EditorRef>(null);

    const { data, setData, errors, processing, setError, reset } = useForm({
        name: '',
        email_subject: '',
        csv_file: null as File | null,
        thumbnail: null as File | null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('thumbnail', file);
    };

    const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('csv_file', file);
    };

    const handleSubmit = async () => {
        if (!data.name) {
            setError('name', 'Template name is required');
            return;
        }

        try {
            setIsSubmitting(true);

            const design: unknown = await new Promise((resolve) => {
                emailEditorRef.current?.editor?.saveDesign((d: unknown) => resolve(d));
            });

            const html: string = await new Promise((resolve) => {
                emailEditorRef.current?.editor?.exportHtml((data: { html: string }) => resolve(data.html));
            });
            const encodedHtml = btoa(unescape(encodeURIComponent(html)));
            const encodedMailContent = btoa(unescape(encodeURIComponent(JSON.stringify(design))));
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email_subject', data.email_subject || '');
            formData.append('editor_content', encodedMailContent);
            formData.append('mail_content', encodedHtml);
            if (data.thumbnail) {
                formData.append('thumbnail', data.thumbnail);
            }
            if (data.csv_file) {
                formData.append('csv_file', data.csv_file);
            }

            // Make API request using fetch (no authentication required)
            try {
                const response = await fetch('/api/email-templates', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                    },
                    body: formData,
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    reset();
                    router.visit(route('email-template.index'));
                } else {
                    // Handle API errors
                    if (result.errors) {
                        Object.keys(result.errors).forEach(key => {
                            if (key === 'name' || key === 'email_subject' || key === 'csv_file' || key === 'thumbnail') {
                                setError(key, result.errors[key][0]);
                            }
                        });
                    } else {
                        setError('name', result.message || 'An error occurred while creating the template.');
                    }
                    setIsSubmitting(false);
                }
            } catch {
                setError('name', 'Network error occurred. Please try again.');
                setIsSubmitting(false);
            }
        } catch {
            setIsSubmitting(false);
            setError('name', 'Something went wrong during submission.');
        }
    };

    return (
        <AppLayout>
            <Head title="Create Email Template" />

            <div className="container mx-auto py-6">
                <div className="mx-auto">
                    <div className="bg-white rounded shadow border">
                        <div className="page-header">
                            <h2 className="page-title text-xl p-2">Create Email Template</h2>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={isSubmitting || processing}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner mr-2"></span>
                                        Saving...
                                    </>
                                ) : (
                                    'Create Template'
                                )}
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Template Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter template name"
                                    />
                                    {errors.name && (
                                        <div className="form-error">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email_subject" className="form-label">Email Subject</label>
                                    <input
                                        type="text"
                                        id="email_subject"
                                        className={`form-input ${errors.email_subject ? 'border-red-500' : ''}`}
                                        value={data.email_subject}
                                        onChange={(e) => setData('email_subject', e.target.value)}
                                        placeholder="Enter email subject"
                                    />
                                    {errors.email_subject && (
                                        <div className="form-error">
                                            {errors.email_subject}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="csv_file" className="form-label">CSV File (Optional)</label>
                                    <div className="file-input-wrapper">
                                        <input
                                            type="file"
                                            id="csv_file"
                                            className="file-input"
                                            onChange={handleCsvChange}
                                            accept=".csv"
                                        />
                                        <label htmlFor="csv_file" className="file-input-label">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Choose CSV File
                                        </label>
                                    </div>
                                    {errors.csv_file && (
                                        <div className="form-error">
                                            {errors.csv_file}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
                                <div className="form-group">
                                    <label htmlFor="image" className="form-label">Preview Image (Optional)</label>
                                    <div className="file-input-wrapper">
                                        <input
                                            type="file"
                                            id="image"
                                            className="file-input"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                        <label htmlFor="image" className="file-input-label">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Choose Thumbnail
                                        </label>
                                    </div>
                                    {errors.thumbnail && (
                                        <div className="form-error">
                                            {errors.thumbnail}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="email-editor-container">
                                <EmailEditor ref={emailEditorRef} minHeight="800px" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Create;
