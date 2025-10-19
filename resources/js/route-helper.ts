// Route helper function that maps Laravel route names to wayfinder generated functions
import {
    home,
    dashboard,
    login,
    logout,
    register
} from './routes';
import {
    index as emailTemplateIndex,
    show as emailTemplateShow,
    update as emailTemplateUpdate,
    destroy as emailTemplateDestroy
} from './routes/email-templates';
import {
    template as baseTemplateIndex
} from './routes/base';
import {
    view as baseTemplateView
} from './routes/base/template';
import {
    index as groupsIndex,
    create as groupsCreate,
    store as groupsStore,
    show as groupsShow,
    edit as groupsEdit,
    update as groupsUpdate,
    destroy as groupsDestroy,
    addContacts as groupsAddContacts,
    removeContacts as groupsRemoveContacts,
    availableContacts as groupsAvailableContacts
} from './routes/groups';
import {
    index as emailCampaignsIndex,
    create as emailCampaignsCreate,
    store as emailCampaignsStore,
    show as emailCampaignsShow,
    edit as emailCampaignsEdit,
    update as emailCampaignsUpdate,
    destroy as emailCampaignsDestroy,
    send as emailCampaignsSend
} from './routes/email-campaigns';
import {
    index as subscriptionsIndex,
    dashboard as subscriptionsDashboard,
    checkout as subscriptionsCheckout,
    success as subscriptionsSuccess,
    cancel as subscriptionsCancel,
    destroy as subscriptionsDestroy
} from './routes/subscriptions';

// Route name to function mapping
const routeMap: Record<string, any> = {
    // Basic routes
    'home': home,
    'dashboard': dashboard,
    'login': login,
    'logout': logout,
    'register': register,

    // Email Template routes
    'email-template.index': emailTemplateIndex,
    'email-template.show': emailTemplateShow,
    'email-template.update': emailTemplateUpdate,
    'email-template.destroy': emailTemplateDestroy,

    // Base Template routes
    'base.template': baseTemplateIndex,
    'base.template.view': baseTemplateView,

    // Groups routes
    'groups.index': groupsIndex,
    'groups.create': groupsCreate,
    'groups.store': groupsStore,
    'groups.show': groupsShow,
    'groups.edit': groupsEdit,
    'groups.update': groupsUpdate,
    'groups.destroy': groupsDestroy,
    'groups.add-contacts': groupsAddContacts,
    'groups.remove-contacts': groupsRemoveContacts,
    'groups.available-contacts': groupsAvailableContacts,

    // Email Campaign routes
    'email-campaigns.index': emailCampaignsIndex,
    'email-campaigns.create': emailCampaignsCreate,
    'email-campaigns.store': emailCampaignsStore,
    'email-campaigns.show': emailCampaignsShow,
    'email-campaigns.edit': emailCampaignsEdit,
    'email-campaigns.update': emailCampaignsUpdate,
    'email-campaigns.destroy': emailCampaignsDestroy,
    'email-campaigns.send': emailCampaignsSend,

    // Subscription routes
    'subscriptions.index': subscriptionsIndex,
    'subscriptions.dashboard': subscriptionsDashboard,
    'subscriptions.checkout': subscriptionsCheckout,
    'subscriptions.success': subscriptionsSuccess,
    'subscriptions.cancel': subscriptionsCancel,
    'subscriptions.destroy': subscriptionsDestroy,

    // Plan management routes
    'plans.index': { url: () => '/plans' },
    'plans.create': { url: () => '/plans/create' },
    'plans.store': { url: () => '/plans' },
    'plans.show': { url: (params: { subscriptionPlan: number }) => `/plans/${params.subscriptionPlan}` },
    'plans.edit': { url: (params: { subscriptionPlan: number }) => `/plans/${params.subscriptionPlan}/edit` },
    'plans.update': { url: (params: { subscriptionPlan: number }) => `/plans/${params.subscriptionPlan}` },
    'plans.destroy': { url: (params: { subscriptionPlan: number }) => `/plans/${params.subscriptionPlan}` },
};

// Global route helper function
export function route(name: string, params?: any): string {
    const routeFunction = routeMap[name];

    if (!routeFunction) {
        console.warn(`Route "${name}" not found in route map`);
        return '#';
    }

    try {
        if (params) {
            return routeFunction.url(params);
        } else {
            return routeFunction.url();
        }
    } catch (error) {
        console.error(`Error generating route for "${name}":`, error);
        return '#';
    }
}

// Make route function available globally
declare global {
    function route(name: string, params?: any): string;
}

// Assign to global scope
(window as any).route = route;
