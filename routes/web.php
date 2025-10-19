<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\LogsController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\CampaignWizardController;
use App\Http\Controllers\EmailCampaignController;
use App\Http\Controllers\Api\EmailTemplateController as ApiEmailTemplateController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SubscriptionPlanController;
use App\Http\Controllers\WebhookController;
use App\Models\Group;

Route::get('/', function () {
    return Inertia::render('landing');
})->name('home');

Route::get('/about', function () {
    return Inertia::render('AboutUs');
})->name('about');

Route::get('/privacy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('TermsAndConditions');
})->name('terms');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', \App\Http\Controllers\DashboardController::class)->name('dashboard');

    Route::resource('users', UserController::class);

    // Base Template routes
    Route::get('base-template', [EmailTemplateController::class, 'baseTemplate'])->name('base.template');
    Route::get('base-template/{baseTemplate}', [EmailTemplateController::class, 'viewBaseTemplate'])->name('base.template.view');
    Route::post('use-template/{baseTemplate}', [EmailTemplateController::class, 'setEmailTemplate'])->name('use.template');

    // Email Template routes
    Route::resource('email-template', EmailTemplateController::class);
    Route::post('email-template/cleanup-images', [EmailTemplateController::class, 'cleanupOrphanedImages'])->name('email-template.cleanup-images');

    // Contacts routes
    Route::resource('contacts', ContactController::class);
    Route::post('contacts/import-csv', [ContactController::class, 'importCsv'])->name('contacts.import-csv');

    // Groups routes
    Route::resource('groups', GroupController::class);
    Route::get('groups/create-with-contacts', function () {
        return Inertia::render('Groups/CreateWithContacts', [
            'contactsUrl' => route('groups.contacts.all')
        ]);
    })->name('groups.create-with-contacts');
    Route::get('groups/{group}/edit-with-contacts', function (Group $group) {
        // Ensure user can only edit their own groups
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }
        return Inertia::render('Groups/EditWithContacts', [
            'group' => $group->load('contacts'),
            'contactsUrl' => route('groups.contacts.all')
        ]);
    })->name('groups.edit-with-contacts');
    Route::post('groups/{group}/add-contacts', [GroupController::class, 'addContacts'])->name('groups.add-contacts');
    Route::post('groups/{group}/remove-contacts', [GroupController::class, 'removeContacts'])->name('groups.remove-contacts');
    Route::get('groups/{group}/available-contacts', [GroupController::class, 'getAvailableContacts'])->name('groups.available-contacts');
    Route::get('groups/contacts/all', [GroupController::class, 'getAllContacts'])->name('groups.contacts.all');

    // Campaign Wizard routes
    Route::get('campaign-wizard', [CampaignWizardController::class, 'index'])->name('campaign-wizard.index');
    Route::post('campaign-wizard/create-template-from-base', [CampaignWizardController::class, 'createTemplateFromBase'])->name('campaign-wizard.create-template-from-base');
    Route::post('campaign-wizard/create-template-from-scratch', [CampaignWizardController::class, 'createTemplateFromScratch'])->name('campaign-wizard.create-template-from-scratch');
    Route::post('campaign-wizard/create-campaign', [CampaignWizardController::class, 'createCampaign'])->name('campaign-wizard.create-campaign');

    // Email Template API routes (for wizard)
    Route::apiResource('api/email-templates', ApiEmailTemplateController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::post('api/email-templates/{emailTemplate}', [ApiEmailTemplateController::class, 'update']);

    // Email Campaign routes
    Route::resource('email-campaigns', EmailCampaignController::class);
    Route::post('email-campaigns/{emailCampaign}/send', [EmailCampaignController::class, 'send'])->name('email-campaigns.send');

    // Debug route
    Route::get('debug/contacts', function () {
        $contacts = \App\Models\Contact::where('user_id', Auth::id())->get();
        return response()->json([
            'user_id' => Auth::id(),
            'is_authenticated' => Auth::check(),
            'contacts_count' => $contacts->count(),
            'contacts' => $contacts
        ]);
    });

    // Debug route for testing file validation
    Route::post('debug/file-validation', function (Request $request) {
        $file = $request->file('csv_file');
        if ($file) {
            return response()->json([
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension(),
                'size' => $file->getSize(),
                'size_mb' => round($file->getSize() / 1024 / 1024, 2),
                'is_valid' => $file->isValid(),
                'error' => $file->getError(),
            ]);
        }
        return response()->json(['error' => 'No file uploaded']);
    });

    // Logs
    Route::get('logs', [LogsController::class, 'index'])->name('logs.index');

    // Subscription routes
    Route::get('subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::get('subscriptions/dashboard', [SubscriptionController::class, 'dashboard'])->name('subscriptions.dashboard');
    Route::post('subscriptions/checkout', [SubscriptionController::class, 'checkout'])->name('subscriptions.checkout');
    Route::get('subscriptions/success', [SubscriptionController::class, 'success'])->name('subscriptions.success');
    Route::get('subscriptions/cancel', [SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
    Route::delete('subscriptions', [SubscriptionController::class, 'destroy'])->name('subscriptions.destroy');

    // Subscription plan management routes
    Route::get('/plans', [SubscriptionPlanController::class, 'index'])->name('plans.index');
    Route::get('/plans/create', [SubscriptionPlanController::class, 'create'])->name('plans.create');
    Route::post('/plans', [SubscriptionPlanController::class, 'store'])->name('plans.store');
    Route::get('/plans/{subscriptionPlan}', [SubscriptionPlanController::class, 'show'])->name('plans.show');
    Route::get('/plans/{subscriptionPlan}/edit', [SubscriptionPlanController::class, 'edit'])->name('plans.edit');
    Route::put('/plans/{subscriptionPlan}', [SubscriptionPlanController::class, 'update'])->name('plans.update');
    Route::delete('/plans/{subscriptionPlan}', [SubscriptionPlanController::class, 'destroy'])->name('plans.destroy');

    // Test routes
    Route::get('/test-modal', function () {
        return Inertia::render('TestModal');
    })->name('test.modal');

    Route::get('/test-email-api', function () {
        return Inertia::render('TestEmailTemplateApi');
    })->name('test.email-api');
});

// Webhook routes (no auth required)
Route::post('/webhooks/stripe', [WebhookController::class, 'stripe']);

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
