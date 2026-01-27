import { login } from '@/routes';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import AuthLayout from '@/layouts/auth-layout';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';

export default function Register() {
    const { t } = useTranslation();

    useEffect(() => {
        // Redirect to login since registration is disabled
        router.visit(login());
    }, []);

    return (
        <AuthLayout
            title={t('create_account')}
            description={t('enter_details_below')}
        >
            <Head title={t('create_account')} />
            <div className="flex flex-col gap-6 text-center">
                <p className="text-muted-foreground">
                    Registration is currently disabled.
                </p>
                <Button asChild>
                    <TextLink href={login()}>
                        {t('log_in')}
                    </TextLink>
                </Button>
            </div>
        </AuthLayout>
    );
}
