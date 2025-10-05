<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\LogsController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

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

    // Logs
    Route::get('logs', [LogsController::class, 'index'])->name('logs.index');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
