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
    create as emailTemplateCreate,
    store as emailTemplateStore,
    show as emailTemplateShow,
    edit as emailTemplateEdit,
    update as emailTemplateUpdate,
    destroy as emailTemplateDestroy
} from './routes/email-template';
import {
    template as baseTemplateIndex
} from './routes/base';
import {
    view as baseTemplateView
} from './routes/base/template';
import useRoutes from './routes/use';

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
    'email-template.create': emailTemplateCreate,
    'email-template.store': emailTemplateStore,
    'email-template.show': emailTemplateShow,
    'email-template.edit': emailTemplateEdit,
    'email-template.update': emailTemplateUpdate,
    'email-template.destroy': emailTemplateDestroy,

    // Base Template routes
    'base.template': baseTemplateIndex,
    'base.template.view': baseTemplateView,
    'use.template': useRoutes.template,
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
