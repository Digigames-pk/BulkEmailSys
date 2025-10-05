import React, { useState, useEffect } from 'react';

interface ApiTokenManagerProps {
    onTokenSet?: (token: string) => void;
}

const ApiTokenManager: React.FC<ApiTokenManagerProps> = ({ onTokenSet }) => {
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
            alert('API token saved successfully!');
        } else {
            alert('Please enter a valid API token.');
        }
    };

    const handleClearToken = () => {
        localStorage.removeItem('api_token');
        sessionStorage.removeItem('api_token');
        setToken('');
        onTokenSet?.('');
        alert('API token cleared.');
    };

    const generateTestToken = async () => {
        const email = prompt('Enter your email address to generate a token:');
        if (!email) return;

        try {
            const response = await fetch('/api/generate-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setToken(result.token);
                localStorage.setItem('api_token', result.token);
                onTokenSet?.(result.token);
                alert('Token generated and saved successfully!');
            } else {
                alert(result.message || 'Error generating token.');
            }
        } catch (error) {
            alert('Error generating token. Please try again.');
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
