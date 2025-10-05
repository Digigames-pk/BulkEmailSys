<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EmailTemplateController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Email Template API Routes (Open - No Authentication Required)
Route::apiResource('email-templates', EmailTemplateController::class)->only(['index', 'store', 'show', 'update', 'destroy']);


// Additional route for POST with _method spoofing (for file uploads with PUT)
Route::post('email-templates/{emailTemplate}', [EmailTemplateController::class, 'update']);

// Test route to debug FormData
Route::post('test-formdata', function (Request $request) {
    return response()->json([
        'method' => $request->method(),
        'content_type' => $request->header('content-type'),
        'all_data' => $request->all(),
        'has_name' => $request->has('name'),
        'name_value' => $request->input('name'),
        'files' => $request->allFiles(),
    ]);
});
