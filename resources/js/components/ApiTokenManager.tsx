import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/utils/csrf';

interface ApiTokenManagerProps {
    onTokenSet?: (token: string) => void;
}

const ApiTokenManager: React.FC<ApiTokenManagerProps> = ({ onTokenSet }) => {
    const { toast } = useToast();
    const [token, setToken] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Load existing token from localStorage
        const existingToken = localStorage.getItem('api_token') || sessionStorage.getItem('api_token');
        if (existingToken) {
            setToken(existingToken);
        }
    }, []);

    const handleSaveToken = () => {
        if (token.trim()) {
            localStorage.setItem('api_token', token.trim());
            onTokenSet?.(token.trim());
            toast({
                title: "Token Saved",
                description: "API token saved successfully!",
                variant: "success",
            });
        } else {
            toast({
                title: "Invalid Token",
                description: "Please enter a valid API token.",
                variant: "destructive",
            });
        }
    };

    const handleClearToken = () => {
        localStorage.removeItem('api_token');
        sessionStorage.removeItem('api_token');
        setToken('');
        onTokenSet?.('');
        toast({
            title: "Token Cleared",
            description: "API token cleared.",
            variant: "success",
        });
    };

    const generateTestToken = async () => {
        const email = prompt('Enter your email address to generate a token:');
        if (!email) return;

        try {
            const response = await apiRequest('/api/generate-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setToken(result.token);
                localStorage.setItem('api_token', result.token);
                onTokenSet?.(result.token);
                toast({
                    title: "Token Generated",
                    description: "Token generated and saved successfully!",
                    variant: "success",
                });
            } else {
                toast({
                    title: "Token Generation Failed",
                    description: result.message || 'Error generating token.',
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error generating token. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">API Token Configuration</h3>
            <p className="text-sm text-yellow-700 mb-4">
                You need to set an API token to use the Create and Edit features.
                Click "Generate Token" and enter your email address, or use: <code className="bg-yellow-100 px-2 py-1 rounded">php artisan api:token your-email@example.com</code>
            </p>

            <div className="space-y-3">
                <div>
                    <label htmlFor="api-token" className="block text-sm font-medium text-gray-700 mb-1">
                        API Token
                    </label>
                    <div className="flex space-x-2">
                        <input
                            type={isVisible ? 'text' : 'password'}
                            id="api-token"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Enter your API token"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setIsVisible(!isVisible)}
                            className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                        >
                            {isVisible ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={handleSaveToken}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                        Save Token
                    </button>
                    <button
                        onClick={handleClearToken}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                        Clear Token
                    </button>
                    <button
                        onClick={generateTestToken}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                        Generate Token
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiTokenManager;
