import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Mail, Users, Send, Wand2, CreditCard, Settings } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/users',
        icon: LayoutGrid,
    },
    {
        title: 'Email Templates',
        href: '/email-template',
        icon: Mail,
    },
    {
        title: 'Base Templates',
        href: '/base-template',
        icon: Mail,
    },
    {
        title: 'Contacts',
        href: '/contacts',
        icon: LayoutGrid,
    },
    {
        title: 'Groups',
        href: '/groups',
        icon: Users,
    },
    {
        title: 'Campaign Wizard',
        href: '/campaign-wizard',
        icon: Wand2,
    },
    {
        title: 'Email Campaigns',
        href: '/email-campaigns',
        icon: Send,
    },
    {
        title: 'Logs',
        href: '/logs',
        icon: Folder,
    },
    {
        title: 'My Subscription',
        href: '/subscriptions/dashboard',
        icon: CreditCard,
    },
    {
        title: 'Upgrade Plan',
        href: '/subscriptions',
        icon: Settings,
    },
    {
        title: 'Manage Plans',
        href: '/plans',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
