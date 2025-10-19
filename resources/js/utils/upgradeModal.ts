import { useUpgradeModal } from '@/contexts/UpgradeModalContext';

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

/**
 * Utility function to show upgrade modal for template limits
 */
export function showTemplateUpgradeModal(
    currentUsage: number,
    currentLimit: number,
    plans: SubscriptionPlan[],
    currentSubscription: UserSubscription | null,
    showUpgradeModal: (limitType: 'templates' | 'contacts' | 'emails', currentUsage: number, currentLimit: number, plans: SubscriptionPlan[], currentSubscription: UserSubscription | null) => void
) {
    showUpgradeModal('templates', currentUsage, currentLimit, plans, currentSubscription);
}

/**
 * Utility function to show upgrade modal for contact limits
 */
export function showContactUpgradeModal(
    currentUsage: number,
    currentLimit: number,
    plans: SubscriptionPlan[],
    currentSubscription: UserSubscription | null,
    showUpgradeModal: (limitType: 'templates' | 'contacts' | 'emails', currentUsage: number, currentLimit: number, plans: SubscriptionPlan[], currentSubscription: UserSubscription | null) => void
) {
    showUpgradeModal('contacts', currentUsage, currentLimit, plans, currentSubscription);
}

/**
 * Utility function to show upgrade modal for email limits
 */
export function showEmailUpgradeModal(
    currentUsage: number,
    currentLimit: number,
    plans: SubscriptionPlan[],
    currentSubscription: UserSubscription | null,
    showUpgradeModal: (limitType: 'templates' | 'contacts' | 'emails', currentUsage: number, currentLimit: number, plans: SubscriptionPlan[], currentSubscription: UserSubscription | null) => void
) {
    showUpgradeModal('emails', currentUsage, currentLimit, plans, currentSubscription);
}
