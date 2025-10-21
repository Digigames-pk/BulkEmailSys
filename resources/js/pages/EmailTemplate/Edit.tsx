import React, { useEffect, useRef, useState } from 'react';
import EmailEditor, { EditorRef } from 'react-email-editor';
import { router, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { redirectAfterApiCall } from '@/utils/redirect';
import { apiRequest } from '@/utils/csrf';
import '../../../css/emailtemplate.css';

interface EmailTemplate {
    id: number;
    name: string;
    email_subject: string | null;
    from_name: string | null;
    reply_to_email: string | null;
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

const Edit = ({ emailTemplate }: Props) => {
    const emailEditorRef = useRef<EditorRef>(null);
    const [name, setName] = useState(emailTemplate?.name || '');
    const [emailSubject, setEmailSubject] = useState(emailTemplate?.email_subject || '');
    const [fromName, setFromName] = useState(emailTemplate?.from_name || '');
    const [replyToEmail, setReplyToEmail] = useState(emailTemplate?.reply_to_email || '');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvFileUrl, setCsvFileUrl] = useState(emailTemplate?.csv_file || '');
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState(emailTemplate?.thumbnail || '');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showJobConfirmDialog, setShowJobConfirmDialog] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

    useEffect(() => {
        const editorLoad = () => {
            if (emailTemplate?.editor_content && emailEditorRef.current?.editor) {
                const design = JSON.parse(emailTemplate.editor_content);
                emailEditorRef.current.editor.loadDesign(design);
                clearTimeout(i);
            }
        }
        const i = setTimeout(editorLoad, 1000);
    }, [emailTemplate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setThumbnail(file);
            setThumbnailUrl(URL.createObjectURL(file));
        }
    };

    const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setCsvFile(file);
            setCsvFileUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!name) {
            setErrorMessage('Name is required');
            return;
        }

        setErrorMessage('');
        setIsSubmitting(true);

        try {
            const design = await new Promise((resolve) =>
                emailEditorRef.current?.editor?.saveDesign((d: unknown) => resolve(d))
            );

            const html = await new Promise<string>((resolve) =>
                emailEditorRef.current?.editor?.exportHtml((data: { html: string }) => resolve(data.html))
            );
            const encodedHtml = btoa(unescape(encodeURIComponent(html)));
            const encodedMailContent = btoa(unescape(encodeURIComponent(JSON.stringify(design))));
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email_subject', emailSubject);
            formData.append('from_name', fromName);
            formData.append('reply_to_email', replyToEmail);
            formData.append('editor_content', encodedMailContent);
            formData.append('mail_content', encodedHtml);

            if (thumbnail) formData.append('thumbnail', thumbnail);
            if (csvFile) formData.append('csv_file', csvFile);

            // Check if CSV file exists and ask for job dispatch confirmation
            if (csvFile || emailTemplate.csv_file) {
                setPendingFormData(formData);
                setShowJobConfirmDialog(true);
                setIsSubmitting(false);
                return;
            }

            // No CSV file, proceed with normal update
            await submitFormData(formData);
        } catch {
            setIsSubmitting(false);
            setErrorMessage('Failed to submit form.');
        }
    };

    const submitFormData = async (formData: FormData) => {
        try {
            const response = await apiRequest(`/api/email-templates/${emailTemplate.id}`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Use utility function for redirect after API call
                redirectAfterApiCall('/email-template');
            } else {
                // Handle API errors
                if (result.errors) {
                    const firstError = Object.values(result.errors)[0];
                    setErrorMessage(Array.isArray(firstError) ? firstError[0] : firstError);
                } else {
                    setErrorMessage(result.message || 'An error occurred while updating the template.');
                }
                setIsSubmitting(false);
            }
        } catch {
            setErrorMessage('Network error occurred. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleJobConfirm = async (dispatchJob: boolean) => {
        if (!pendingFormData) return;

        if (dispatchJob) {
            pendingFormData.append('dispatch_job', '1');
        }

        setShowJobConfirmDialog(false);
        setIsSubmitting(true);
        await submitFormData(pendingFormData);
        setPendingFormData(null);
    };

    return (
        <AppLayout>
            <Head title={`Edit: ${emailTemplate.name}`} />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded shadow border">
                        <div className="page-header">
                            <h2 className="page-title text-xl">Update Email Template</h2>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="btn btn-primary"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner mr-2"></span>
                                        Updating...
                                    </>
                                ) : (
                                    'Update Template'
                                )}
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="form-group">
                                    <label className="form-label">Template Name</label>
                                    <input
                                        type="text"
                                        className={`form-input ${errorMessage ? 'border-red-500' : ''}`}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter template name"
                                    />
                                    {errorMessage && (
                                        <div className="form-error">{errorMessage}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Subject</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Enter email subject"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">From Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={fromName}
                                        onChange={(e) => setFromName(e.target.value)}
                                        placeholder="Enter from name (optional)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Reply To Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={replyToEmail}
                                        onChange={(e) => setReplyToEmail(e.target.value)}
                                        placeholder="Enter reply-to email (optional)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">CSV File (Optional)</label>
                                    <div className="file-input-wrapper">
                                        <input
                                            type="file"
                                            className="file-input"
                                            onChange={handleCsvChange}
                                            accept=".csv"
                                        />
                                        <label className="file-input-label">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Choose CSV File
                                        </label>
                                    </div>
                                    {csvFileUrl && (
                                        <div className="mt-2">
                                            <span className="text-sm text-muted">
                                                {csvFileUrl.startsWith('blob:') ? 'New file selected' : 'Current file: ' + csvFileUrl.split('/').pop()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
                                <div className="form-group">
                                    <label className="form-label">Change Image (Optional)</label>
                                    <div className="file-input-wrapper">
                                        <input
                                            type="file"
                                            className="file-input"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                        <label className="file-input-label">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Choose New Image
                                        </label>
                                    </div>
                                    {thumbnailUrl && (
                                        <div className="mt-4">
                                            <img
                                                src={thumbnailUrl.startsWith('blob:') ? thumbnailUrl : `/storage/${thumbnailUrl}`}
                                                alt="Current thumbnail"
                                                className="preview-image"
                                            />
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

            {/* Job Dispatch Confirmation Dialog */}
            <Dialog open={showJobConfirmDialog} onOpenChange={setShowJobConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dispatch Email Job?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 mb-4">
                        A CSV file is attached to this template. Would you like to dispatch the email sending job now?
                        This will import contacts from the CSV and send emails to them.
                    </p>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => handleJobConfirm(false)}>
                            Update Only
                        </Button>
                        <Button onClick={() => handleJobConfirm(true)}>
                            Update & Send Emails
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default Edit;
