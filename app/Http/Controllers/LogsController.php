<?php

namespace App\Http\Controllers;

use App\Models\EmailLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogsController extends Controller
{
    public function index(Request $request)
    {
        $logs = EmailLog::with(['emailTemplate:id,name', 'contact:id,name,email'])
            ->when($request->get('status'), fn($q, $status) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('logs/index', [
            'logs' => $logs,
            'filters' => $request->only('status'),
        ]);
    }
}
