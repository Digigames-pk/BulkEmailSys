<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
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
