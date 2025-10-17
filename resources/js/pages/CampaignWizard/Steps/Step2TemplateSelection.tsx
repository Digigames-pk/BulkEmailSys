import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, FileText, Palette, Plus, Eye, Check } from 'lucide-react';
import { router } from '@inertiajs/react';
import EmailEditor, { EditorRef } from 'react-email-editor';
import '../../../../css/emailtemplate.css';

interface BaseTemplate {
    id: number;
    name: string;
    editor_content: string | null;
    mail_content: string | null;
    thumbnail: string | null;
}

interface EmailTemplate {
    id: number;
    name: string;
    email_subject: string | null;
    from_name: string | null;
    reply_to_email: string | null;
    editor_content: string | null;
    mail_content: string | null;
    thumbnail: string | null;
}

interface WizardData {
    name: string;
    from_name: string;
    reply_to_email: string;
    subject: string;
    description: string;
    scheduled_at: string;
    template_type: 'base' | 'existing' | 'scratch' | null;
    selected_base_template_id: number | null;
    selected_existing_template_id: number | null;
    created_template_id: number | null;
    group_id: string;
}

interface Step2Props {
    data: WizardData;
    updateData: (data: Partial<WizardData>) => void;
    baseTemplates: BaseTemplate[];
    emailTemplates: EmailTemplate[];
    onNext: () => void;
    onPrev: () => void;
}

export default function Step2TemplateSelection({
    data,
    updateData,
    baseTemplates,
    emailTemplates,
    onNext,
    onPrev
}: Step2Props) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateSubject, setTemplateSubject] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<BaseTemplate | null>(null);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const emailEditorRef = useRef<EditorRef>(null);

    const handleTemplateTypeChange = (type: 'base' | 'existing' | 'scratch') => {
        updateData({
            template_type: type,
            selected_base_template_id: null,
            selected_existing_template_id: null,
            created_template_id: null,
        });
    };

    const handleBaseTemplateSelect = async (baseTemplateId: number) => {
        if (!templateName.trim()) {
            toast({
                title: "Template Name Required",
                description: "Please enter a template name",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Find the base template to get its content
            const baseTemplate = baseTemplates.find(t => t.id === baseTemplateId);
            if (!baseTemplate) {
                toast({
                    title: "Template Not Found",
                    description: "Base template not found",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            // Create template using the existing API route
            const response = await fetch('/api/email-templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: templateName,
                    email_subject: templateSubject || data.subject,
                    editor_content: baseTemplate.editor_content ? btoa(baseTemplate.editor_content) : '',
                    mail_content: baseTemplate.mail_content ? btoa(baseTemplate.mail_content) : '',
                }),
            });

            const result = await response.json();
            if (result.success) {
                updateData({
                    selected_base_template_id: baseTemplateId,
                    created_template_id: result.data.id,
                });
                toast({
                    title: "Template Created",
                    description: "Template created successfully! You can now proceed to the next step.",
                    variant: "success",
                });
            } else {
                toast({
                    title: "Template Creation Failed",
                    description: result.message || 'Unknown error',
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error creating template:', error);
            toast({
                title: "Error",
                description: "Error creating template",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExistingTemplateSelect = (templateId: number) => {
        updateData({
            selected_existing_template_id: templateId,
            created_template_id: null,
        });
    };

    const handleSaveEmailEditorTemplate = async () => {
        if (!emailEditorRef.current?.editor) {
            toast({
                title: "Editor Not Ready",
                description: "Email editor not ready",
                variant: "destructive",
            });
            return;
        }

        if (!templateName.trim()) {
            toast({
                title: "Template Name Required",
                description: "Please enter a template name",
                variant: "destructive",
            });
            return;
        }

        setIsSavingTemplate(true);
        try {
            emailEditorRef.current.editor.saveDesign((design) => {
                emailEditorRef.current?.editor?.exportHtml((data) => {
                    const { html } = data;

                    // Create template using the existing API route
                    fetch('/api/email-templates', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({
                            name: templateName,
                            email_subject: templateSubject || data.subject,
                            editor_content: btoa(JSON.stringify(design)), // Base64 encode
                            mail_content: btoa(html), // Base64 encode
                        }),
                    })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                updateData({
                                    created_template_id: result.data.id,
                                });
                                toast({
                                    title: "Template Created",
                                    description: "Template created successfully! You can now proceed to the next step.",
                                    variant: "success",
                                });
                            } else {
                                toast({
                                    title: "Template Creation Failed",
                                    description: result.message || 'Unknown error',
                                    variant: "destructive",
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Error saving template:', error);
                            toast({
                                title: "Error",
                                description: "Error saving template",
                                variant: "destructive",
                            });
                        })
                        .finally(() => {
                            setIsSavingTemplate(false);
                        });
                });
            });
        } catch (error) {
            console.error('Error saving template:', error);
            toast({
                title: "Error",
                description: "Error saving template",
                variant: "destructive",
            });
            setIsSavingTemplate(false);
        }
    };

    const handlePreviewTemplate = (template: BaseTemplate) => {
        setPreviewTemplate(template);
        setShowPreview(true);
    };

    const handleNext = () => {
        const hasTemplate = data.created_template_id || data.selected_existing_template_id;
        if (!hasTemplate) {
            toast({
                title: "Template Required",
                description: "Please select or create a template",
                variant: "destructive",
            });
            return;
        }
        onNext();
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Template Selection
                    </CardTitle>
                    <CardDescription>
                        Choose how you want to create your email template
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Template Name Input */}
                        {(data.template_type === 'base' || data.template_type === 'scratch') && (
                            <div className="space-y-2">
                                <Label htmlFor="template_name">Template Name *</Label>
                                <Input
                                    id="template_name"
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder="Enter template name"
                                />
                            </div>
                        )}

                        {/* Template Subject Input */}
                        {(data.template_type === 'base' || data.template_type === 'scratch') && (
                            <div className="space-y-2">
                                <Label htmlFor="template_subject">Template Subject</Label>
                                <Input
                                    id="template_subject"
                                    type="text"
                                    value={templateSubject}
                                    onChange={(e) => setTemplateSubject(e.target.value)}
                                    placeholder="Enter template subject (optional)"
                                />
                            </div>
                        )}

                        {/* Template Type Selection */}
                        <div className="space-y-4">
                            <Label>Choose Template Type</Label>

                            {/* Base Templates */}
                            <div className="space-y-2">
                                <Button
                                    variant={data.template_type === 'base' ? 'default' : 'outline'}
                                    className="w-full justify-start"
                                    onClick={() => handleTemplateTypeChange('base')}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Use Base Template
                                </Button>

                                {data.template_type === 'base' && (
                                    <div className="ml-4 space-y-4">
                                        <Label>Select Base Template ({baseTemplates.length} available)</Label>
                                        <div className="template-grid">
                                            {baseTemplates.length > 0 ? baseTemplates.map((template) => (
                                                <div
                                                    key={template.id}
                                                    className={`templateCard ${data.selected_base_template_id === template.id ? 'selected' : ''}`}
                                                >
                                                    <div className="card-header">
                                                        {template.name}
                                                        {data.selected_base_template_id === template.id && (
                                                            <span className="text-green-600 text-sm ml-2">✓ Selected</span>
                                                        )}
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
                                                                    onClick={() => handleBaseTemplateSelect(template.id)}
                                                                    disabled={isLoading}
                                                                >
                                                                    {isLoading ? 'Creating...' : 'Use Template'}
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-light"
                                                                    onClick={() => handlePreviewTemplate(template)}
                                                                >
                                                                    Preview
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : null}
                                        </div>
                                        {baseTemplates.length === 0 && (
                                            <div className="empty-state">
                                                <div className="text-muted text-lg">No base templates available</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Existing Templates */}
                            <div className="space-y-2">
                                <Button
                                    variant={data.template_type === 'existing' ? 'default' : 'outline'}
                                    className="w-full justify-start"
                                    onClick={() => handleTemplateTypeChange('existing')}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Use My Template
                                </Button>

                                {data.template_type === 'existing' && (
                                    <div className="ml-4 space-y-2">
                                        <Label>Select Your Template</Label>
                                        <Select onValueChange={(value) => handleExistingTemplateSelect(parseInt(value))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {emailTemplates.map((template) => (
                                                    <SelectItem key={template.id} value={template.id.toString()}>
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            {/* Create from Scratch */}
                            <div className="space-y-2">
                                <Button
                                    variant={data.template_type === 'scratch' ? 'default' : 'outline'}
                                    className="w-full justify-start"
                                    onClick={() => handleTemplateTypeChange('scratch')}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create from Scratch
                                </Button>

                                {data.template_type === 'scratch' && (
                                    <div className="ml-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Email Editor</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Design your email template using the editor below
                                            </p>
                                        </div>
                                        <div className="email-editor-container h-[600px]">
                                            <EmailEditor
                                                ref={emailEditorRef}
                                                options={{
                                                    appearance: {
                                                        theme: 'modern_light',
                                                    },
                                                    features: {
                                                        textEditor: {
                                                            spellCheck: true,
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                onClick={handleSaveEmailEditorTemplate}
                                                disabled={isSavingTemplate}
                                            >
                                                {isSavingTemplate ? 'Saving...' : 'Save Template'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={onPrev}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>
                            <Button
                                onClick={handleNext}
                                disabled={!data.created_template_id && !data.selected_existing_template_id}
                            >
                                {data.created_template_id || data.selected_existing_template_id ? 'Next Step' : 'Select Template First'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Template Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Template Preview: {previewTemplate?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {previewTemplate?.mail_content && (
                            <div
                                className="border rounded-lg p-4 bg-white"
                                dangerouslySetInnerHTML={{ __html: previewTemplate.mail_content }}
                            />
                        )}
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowPreview(false)}>
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    if (previewTemplate) {
                                        handleBaseTemplateSelect(previewTemplate.id);
                                        setShowPreview(false);
                                    }
                                }}
                                disabled={isLoading}
                            >
                                Use This Template
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
