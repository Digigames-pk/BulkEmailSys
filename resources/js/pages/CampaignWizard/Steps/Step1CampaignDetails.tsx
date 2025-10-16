import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Calendar, Mail, User, MessageSquare } from 'lucide-react';

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

interface Step1Props {
    data: WizardData;
    updateData: (data: Partial<WizardData>) => void;
    onNext: () => void;
}

export default function Step1CampaignDetails({ data, updateData, onNext }: Step1Props) {
    const handleNext = () => {
        // Basic validation
        if (!data.name || !data.subject) {
            return;
        }
        onNext();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Campaign Details
                </CardTitle>
                <CardDescription>
                    Provide basic information about your email campaign
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Campaign Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Campaign Name *</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => updateData({ name: e.target.value })}
                            placeholder="Enter campaign name"
                        />
                    </div>

                    {/* Email Subject */}
                    <div className="space-y-2">
                        <Label htmlFor="subject">Email Subject *</Label>
                        <Input
                            id="subject"
                            type="text"
                            value={data.subject}
                            onChange={(e) => updateData({ subject: e.target.value })}
                            placeholder="Enter email subject"
                        />
                    </div>

                    {/* From Name */}
                    <div className="space-y-2">
                        <Label htmlFor="from_name">From Name</Label>
                        <Input
                            id="from_name"
                            type="text"
                            value={data.from_name}
                            onChange={(e) => updateData({ from_name: e.target.value })}
                            placeholder="Enter sender name"
                        />
                        <p className="text-sm text-muted-foreground">
                            Leave empty to use default
                        </p>
                    </div>

                    {/* Reply To Email */}
                    <div className="space-y-2">
                        <Label htmlFor="reply_to_email">Reply To Email</Label>
                        <Input
                            id="reply_to_email"
                            type="email"
                            value={data.reply_to_email}
                            onChange={(e) => updateData({ reply_to_email: e.target.value })}
                            placeholder="Enter reply-to email address"
                        />
                        <p className="text-sm text-muted-foreground">
                            Leave empty to use default
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => updateData({ description: e.target.value })}
                            placeholder="Enter campaign description"
                            rows={3}
                        />
                    </div>

                    {/* Schedule */}
                    <div className="space-y-2">
                        <Label htmlFor="scheduled_at">Schedule Send</Label>
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <Input
                                id="scheduled_at"
                                type="datetime-local"
                                value={data.scheduled_at}
                                onChange={(e) => updateData({ scheduled_at: e.target.value })}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Leave empty to send immediately
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleNext} disabled={!data.name || !data.subject}>
                            Next Step
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
