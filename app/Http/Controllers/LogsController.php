<?php

namespace App\Http\Controllers;

use App\Models\EmailLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LogsController extends Controller
{
    public function index(Request $request)
    {
        $logs = EmailLog::with(['emailTemplate:id,name', 'contact:id,name,email', 'emailCampaign:id,name'])
            ->where(function ($query) {
                $query->whereHas('emailTemplate', function ($q) {
                    $q->where('user_id', Auth::id());
                })->orWhereHas('contact', function ($q) {
                    $q->where('user_id', Auth::id());
                })->orWhereHas('emailCampaign', function ($q) {
                    $q->where('user_id', Auth::id());
                });
            })
            ->when($request->get('status'), fn($q, $status) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('logs/index', [
            'logs' => $logs,
            'filters' => $request->only('status'),
        ]);
    }
}
