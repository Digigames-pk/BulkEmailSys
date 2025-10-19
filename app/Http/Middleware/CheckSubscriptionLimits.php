<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckSubscriptionLimits
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $limitType): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $next($request);
        }

        // Admin users bypass all limits
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Only check limits for POST/PUT/PATCH/DELETE requests (actions that modify data)
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return $next($request);
        }

        $limits = $user->getSubscriptionLimits();

        switch ($limitType) {
            case 'templates':
                $currentCount = $user->emailTemplates()->count();
                if ($limits['templates'] > 0 && $currentCount >= $limits['templates']) {
                    return $this->redirectToUpgrade($request, 'templates', $currentCount, $limits['templates']);
                }
                break;

            case 'contacts':
                $currentCount = $user->contacts()->count();
                if ($limits['contacts'] > 0 && $currentCount >= $limits['contacts']) {
                    return $this->redirectToUpgrade($request, 'contacts', $currentCount, $limits['contacts']);
                }
                break;

            case 'emails':
                $currentCount = $user->emailLogs()
                    ->whereMonth('email_logs.created_at', now()->month)
                    ->whereYear('email_logs.created_at', now()->year)
                    ->count();
                if ($limits['emails_per_month'] > 0 && $currentCount >= $limits['emails_per_month']) {
                    return $this->redirectToUpgrade($request, 'emails', $currentCount, $limits['emails_per_month']);
                }
                break;
        }

        return $next($request);
    }

    /**
     * Redirect to upgrade page when limit is reached
     */
    private function redirectToUpgrade(Request $request, string $limitType, int $currentCount, int $limit): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => ucfirst($limitType) . ' limit reached',
                'message' => "You've reached your limit of {$limit} {$limitType}. Please upgrade your plan to continue.",
                'limit_reached' => true,
                'limit_type' => $limitType,
                'current_usage' => $currentCount,
                'limit' => $limit,
                'redirect_url' => route('subscriptions.index')
            ], 403);
        }

        // Redirect to subscription upgrade page
        return redirect()->route('subscriptions.index')->with('error', "You've reached your limit of {$limit} {$limitType}. Please upgrade your plan to continue.");
    }
}
