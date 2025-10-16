import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, CheckCircle, Send } from 'lucide-react';

interface Group {
    id: number;
    name: string;
    description: string | null;
    contacts_count: number;
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

interface Step3Props {
    data: WizardData;
    updateData: (data: Partial<WizardData>) => void;
    groups: Group[];
    onPrev: () => void;
    onCreateCampaign: () => void;
    isLoading: boolean;
}

export default function Step3RecipientsSelection({
    data,
    updateData,
    groups,
    onPrev,
    onCreateCampaign,
    isLoading
}: Step3Props) {
    const selectedGroup = groups.find(g => g.id.toString() === data.group_id);

    const handleGroupSelect = (groupId: string) => {
        updateData({ group_id: groupId });
    };

    const handleCreateCampaign = () => {
        if (!data.group_id) {
            alert('Please select a recipient group');
            return;
        }
        onCreateCampaign();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Recipients Selection
                </CardTitle>
                <CardDescription>
                    Choose the target audience for your campaign
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Group Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Recipient Group *</label>
                        <Select value={data.group_id} onValueChange={handleGroupSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a group" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map((group) => (
                                    <SelectItem key={group.id} value={group.id.toString()}>
                                        {group.name} ({group.contacts_count} contacts)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selected Group Info */}
                    {selectedGroup && (
                        <Card className="bg-muted/50">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <h4 className="font-medium">{selectedGroup.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedGroup.contacts_count} recipients
                                        </p>
                                        {selectedGroup.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {selectedGroup.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Campaign Summary */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Campaign Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Campaign Name:</span>
                                    <p className="text-muted-foreground">{data.name}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Subject:</span>
                                    <p className="text-muted-foreground">{data.subject}</p>
                                </div>
                                <div>
                                    <span className="font-medium">From Name:</span>
                                    <p className="text-muted-foreground">{data.from_name || 'Default'}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Reply To:</span>
                                    <p className="text-muted-foreground">{data.reply_to_email || 'Default'}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Recipients:</span>
                                    <p className="text-muted-foreground">
                                        {selectedGroup ? `${selectedGroup.contacts_count} contacts` : 'Not selected'}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium">Schedule:</span>
                                    <p className="text-muted-foreground">
                                        {data.scheduled_at ? new Date(data.scheduled_at).toLocaleString() : 'Send immediately'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={onPrev}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>
                        <Button
                            onClick={handleCreateCampaign}
                            disabled={!data.group_id || isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? (
                                'Creating Campaign...'
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Create Campaign
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
