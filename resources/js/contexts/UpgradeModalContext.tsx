import React, { createContext, useContext, useState, ReactNode } from 'react';
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

interface UpgradeModalContextType {
    showUpgradeModal: (
        limitType: 'templates' | 'contacts' | 'emails',
        currentUsage: number,
        currentLimit: number,
        plans: SubscriptionPlan[],
        currentSubscription: UserSubscription | null
    ) => void;
    hideUpgradeModal: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType | undefined>(undefined);

interface UpgradeModalProviderProps {
    children: ReactNode;
}

export function UpgradeModalProvider({ children }: UpgradeModalProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState<{
        limitType: 'templates' | 'contacts' | 'emails';
        currentUsage: number;
        currentLimit: number;
        plans: SubscriptionPlan[];
        currentSubscription: UserSubscription | null;
    } | null>(null);

    const showUpgradeModal = (
        limitType: 'templates' | 'contacts' | 'emails',
        currentUsage: number,
        currentLimit: number,
        plans: SubscriptionPlan[],
        currentSubscription: UserSubscription | null
    ) => {
        console.log('showUpgradeModal called with:', { limitType, currentUsage, currentLimit, plans, currentSubscription }); // Debug log
        setModalData({
            limitType,
            currentUsage,
            currentLimit,
            plans,
            currentSubscription
        });
        setIsOpen(true);
        console.log('Modal should be open now'); // Debug log
    };

    const hideUpgradeModal = () => {
        setIsOpen(false);
        setModalData(null);
    };

    return (
        <UpgradeModalContext.Provider value={{ showUpgradeModal, hideUpgradeModal }}>
            {children}
            {modalData && (
                <UpgradeModal
                    isOpen={isOpen}
                    onClose={hideUpgradeModal}
                    limitType={modalData.limitType}
                    currentUsage={modalData.currentUsage}
                    currentLimit={modalData.currentLimit}
                    plans={modalData.plans}
                    currentPlanId={modalData.currentSubscription?.subscription_plan_id}
                />
            )}
        </UpgradeModalContext.Provider>
    );
}

export function useUpgradeModal() {
    const context = useContext(UpgradeModalContext);
    if (context === undefined) {
        throw new Error('useUpgradeModal must be used within an UpgradeModalProvider');
    }
    return context;
}
