import { UpgradeModalProvider } from '@/contexts/UpgradeModalContext';
import { type ReactNode } from 'react';

interface AppWrapperProps {
    children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
    return (
        <UpgradeModalProvider>
            {children}
        </UpgradeModalProvider>
    );
}
