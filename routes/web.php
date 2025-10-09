<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\LogsController;
use App\Http\Controllers\GroupController;
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
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('users', UserController::class);

    // Base Template routes
    Route::get('base-template', [EmailTemplateController::class, 'baseTemplate'])->name('base.template');
    Route::get('base-template/{baseTemplate}', [EmailTemplateController::class, 'viewBaseTemplate'])->name('base.template.view');
    Route::post('use-template/{baseTemplate}', [EmailTemplateController::class, 'setEmailTemplate'])->name('use.template');

    // Email Template routes
    Route::resource('email-template', EmailTemplateController::class);

    // Contacts routes
    Route::resource('contacts', ContactController::class);

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

    // Logs
    Route::get('logs', [LogsController::class, 'index'])->name('logs.index');
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
