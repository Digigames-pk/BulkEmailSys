import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function TestEmailTemplateApi() {
    const [result, setResult] = useState<string>('');
    const { toast } = useToast();

    const testCreate = async () => {
        try {
            // Get CSRF token
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('CSRF Token:', token);

            const formData = new FormData();
            formData.append('name', 'Test Template');
            formData.append('email_subject', 'Test Subject');

            const response = await fetch('/api/email-templates', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            const data = await response.json();
            console.log('Response:', data);

            if (response.ok) {
                setResult('Success: ' + JSON.stringify(data));
                toast({
                    title: "Success",
                    description: "Email template created successfully",
                });
            } else {
                setResult('Error: ' + JSON.stringify(data));
                if (data.message?.includes('CSRF token mismatch')) {
                    toast({
                        title: "CSRF Error",
                        description: "CSRF token mismatch detected",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Other Error",
                        description: data.message || 'Unknown error',
                        variant: "destructive",
                    });
                }
            }
        } catch (error) {
            console.error('Network error:', error);
            setResult('Network Error: ' + error);
            toast({
                title: "Network Error",
                description: "Failed to make request",
                variant: "destructive",
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Test Email Template API" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Test Email Template API with CSRF</h1>
                <Button onClick={testCreate} className="mb-4">
                    Test Create Email Template
                </Button>
                {result && (
                    <div className="bg-gray-100 p-4 rounded">
                        <pre>{result}</pre>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
