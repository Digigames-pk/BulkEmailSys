import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Wand2 } from 'lucide-react';
import Step1CampaignDetails from './Steps/Step1CampaignDetails';
import Step2TemplateSelection from './Steps/Step2TemplateSelection';
import Step3RecipientsSelection from './Steps/Step3RecipientsSelection';
import '../../../css/emailtemplate.css';

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

interface Group {
    id: number;
    name: string;
    description: string | null;
    contacts_count: number;
}

interface CampaignWizardProps {
    baseTemplates: BaseTemplate[];
    emailTemplates: EmailTemplate[];
    groups: Group[];
}

interface WizardData {
    // Step 1: Campaign Details
    name: string;
    from_name: string;
    reply_to_email: string;
    subject: string;
    description: string;
    scheduled_at: string;

    // Step 2: Template Selection
    template_type: 'base' | 'existing' | 'scratch' | null;
    selected_base_template_id: number | null;
    selected_existing_template_id: number | null;
    created_template_id: number | null;

    // Step 3: Recipients
    group_id: string;
}

export default function CampaignWizard({ baseTemplates, emailTemplates, groups }: CampaignWizardProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [wizardData, setWizardData] = useState<WizardData>({
        name: '',
        from_name: '',
        reply_to_email: '',
        subject: '',
        description: '',
        scheduled_at: '',
        template_type: null,
        selected_base_template_id: null,
        selected_existing_template_id: null,
        created_template_id: null,
        group_id: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const steps = [
        { id: 1, title: 'Campaign Details', description: 'Basic campaign information' },
        { id: 2, title: 'Template Selection', description: 'Choose your email template' },
        { id: 3, title: 'Recipients', description: 'Select target audience' },
    ];

    const progress = (currentStep / steps.length) * 100;

    const updateWizardData = (data: Partial<WizardData>) => {
        setWizardData(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCreateCampaign = async () => {
        setIsLoading(true);
        try {
            const emailTemplateId = wizardData.created_template_id ||
                wizardData.selected_existing_template_id;

            if (!emailTemplateId) {
                throw new Error('No email template selected');
            }

            const campaignData = {
                name: wizardData.name,
                subject: wizardData.subject,
                from_name: wizardData.from_name,
                reply_to_email: wizardData.reply_to_email,
                description: wizardData.description,
                email_template_id: emailTemplateId,
                group_id: wizardData.group_id,
                scheduled_at: wizardData.scheduled_at || null,
            };

            // Use fetch instead of router.post to handle JSON response
            const response = await fetch('/campaign-wizard/create-campaign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(campaignData),
            });

            const result = await response.json();

            if (result.success) {
                // Show success message
                toast({
                    title: "Campaign Created",
                    description: result.message || 'Campaign created successfully!',
                    variant: "success",
                });
                // Redirect to email campaigns page on success
                router.visit('/email-campaigns');
            } else {
                console.error('Campaign creation failed:', result);
                toast({
                    title: "Campaign Creation Failed",
                    description: result.message || 'Unknown error',
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            toast({
                title: "Error",
                description: 'Error creating campaign',
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1CampaignDetails
                        data={wizardData}
                        updateData={updateWizardData}
                        onNext={nextStep}
                    />
                );
            case 2:
                return (
                    <Step2TemplateSelection
                        data={wizardData}
                        updateData={updateWizardData}
                        baseTemplates={baseTemplates}
                        emailTemplates={emailTemplates}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                );
            case 3:
                return (
                    <Step3RecipientsSelection
                        data={wizardData}
                        updateData={updateWizardData}
                        groups={groups}
                        onPrev={prevStep}
                        onCreateCampaign={handleCreateCampaign}
                        isLoading={isLoading}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <AppLayout>
            <Head title="Campaign Wizard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.visit('/email-campaigns')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Campaigns
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Wand2 className="w-6 h-6" />
                            Campaign Wizard
                        </h1>
                        <p className="text-muted-foreground">Create your email campaign step by step</p>
                    </div>
                </div>

                {/* Progress */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Step {currentStep} of {steps.length}</span>
                                <span>{Math.round(progress)}% Complete</span>
                            </div>
                            <Progress value={progress} className="w-full" />
                            <div className="flex justify-between">
                                {steps.map((step) => (
                                    <div key={step.id} className="flex flex-col items-center space-y-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                                                }`}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Step Content */}
                {renderStep()}
            </div>
        </AppLayout>
    );
}
