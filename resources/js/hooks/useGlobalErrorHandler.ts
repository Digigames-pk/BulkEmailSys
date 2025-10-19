import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useUpgradeModal } from '@/contexts/UpgradeModalContext';

interface ErrorResponse {
    error?: string;
    limit_reached?: boolean;
    limit_type?: 'templates' | 'contacts' | 'emails';
    current_usage?: number;
    limit?: number;
}

interface PageProps {
    plans?: any[];
    currentSubscription?: any;
    limits?: {
        templates: number;
        contacts: number;
        emails_per_month: number;
    };
    usage?: {
        templates: number;
        contacts: number;
        emails_this_month: number;
    };
    errors?: ErrorResponse;
}

export function useGlobalErrorHandler() {
    const { props } = usePage<PageProps>();
    const { showUpgradeModal } = useUpgradeModal();

    useEffect(() => {
        // Check for limit reached errors in props
        if (props.errors?.limit_reached && props.errors.limit_type) {
            const { limit_type, current_usage, limit } = props.errors;

            if (limit_type && current_usage !== undefined && limit !== undefined) {
                showUpgradeModal(
                    limit_type,
                    current_usage,
                    limit,
                    props.plans || [],
                    props.currentSubscription || null
                );
            }
        }
    }, [props.errors, props.plans, props.currentSubscription, showUpgradeModal]);

    // Function to handle API errors
    const handleApiError = (error: any) => {
        if (error?.response?.data?.limit_reached && error?.response?.data?.limit_type) {
            const { limit_type, current_usage, limit } = error.response.data;

            showUpgradeModal(
                limit_type,
                current_usage,
                limit,
                props.plans || [],
                props.currentSubscription || null
            );
            return true; // Error was handled
        }
        return false; // Error was not handled
    };

    return { handleApiError };
}
