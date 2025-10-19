import { useState } from 'react';
import UpgradeModal from '@/components/UpgradeModal';

interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    max_templates: number;
    max_contacts: number;
    max_emails_per_month: number;
    is_featured: boolean;
    features: string[];
}

interface UserSubscription {
    id: number;
    subscription_plan_id: number;
    subscription_plan: SubscriptionPlan;
}

interface PlanLimitServiceProps {
    currentSubscription: UserSubscription | null;
    limits: {
        templates: number;
        contacts: number;
        emails_per_month: number;
    };
    usage: {
        templates: number;
        contacts: number;
        emails_this_month: number;
    };
    plans: SubscriptionPlan[];
}

export function usePlanLimits({
    currentSubscription,
    limits,
    usage,
    plans
}: PlanLimitServiceProps) {
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [limitType, setLimitType] = useState<'templates' | 'contacts' | 'emails'>('templates');

    const checkTemplateLimit = (): boolean => {
        if (limits.templates === 0) return true; // Unlimited
        return usage.templates < limits.templates;
    };

    const checkContactLimit = (): boolean => {
        if (limits.contacts === 0) return true; // Unlimited
        return usage.contacts < limits.contacts;
    };

    const checkEmailLimit = (): boolean => {
        if (limits.emails_per_month === 0) return true; // Unlimited
        return usage.emails_this_month < limits.emails_per_month;
    };

    const showUpgradeModal = (type: 'templates' | 'contacts' | 'emails') => {
        setLimitType(type);
        setUpgradeModalOpen(true);
    };

    const handleTemplateAction = (action: () => void) => {
        if (checkTemplateLimit()) {
            action();
        } else {
            showUpgradeModal('templates');
        }
    };

    const handleContactAction = (action: () => void) => {
        if (checkContactLimit()) {
            action();
        } else {
            showUpgradeModal('contacts');
        }
    };

    const handleEmailAction = (action: () => void) => {
        if (checkEmailLimit()) {
            action();
        } else {
            showUpgradeModal('emails');
        }
    };

    const getCurrentLimit = (type: 'templates' | 'contacts' | 'emails') => {
        switch (type) {
            case 'templates':
                return limits.templates;
            case 'contacts':
                return limits.contacts;
            case 'emails':
                return limits.emails_per_month;
            default:
                return 0;
        }
    };

    const getCurrentUsage = (type: 'templates' | 'contacts' | 'emails') => {
        switch (type) {
            case 'templates':
                return usage.templates;
            case 'contacts':
                return usage.contacts;
            case 'emails':
                return usage.emails_this_month;
            default:
                return 0;
        }
    };

    const UpgradeModalComponent = () => (
        <UpgradeModal
            isOpen={upgradeModalOpen}
            onClose={() => setUpgradeModalOpen(false)}
            limitType={limitType}
            currentUsage={getCurrentUsage(limitType)}
            currentLimit={getCurrentLimit(limitType)}
            plans={plans}
            currentPlanId={currentSubscription?.subscription_plan_id}
        />
    );

    return {
        // Limit checks
        checkTemplateLimit,
        checkContactLimit,
        checkEmailLimit,

        // Action handlers
        handleTemplateAction,
        handleContactAction,
        handleEmailAction,

        // Modal controls
        showUpgradeModal,
        UpgradeModalComponent,

        // Utility functions
        getCurrentLimit,
        getCurrentUsage,

        // State
        upgradeModalOpen,
        limitType
    };
}
