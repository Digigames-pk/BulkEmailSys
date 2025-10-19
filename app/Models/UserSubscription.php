<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSubscription extends Model
{
    protected $fillable = [
        'user_id',
        'subscription_plan_id',
        'stripe_subscription_id',
        'stripe_customer_id',
        'status',
        'current_period_start',
        'current_period_end',
        'canceled_at',
        'trial_ends_at',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'canceled_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }

    public function isActive(): bool
    {
        return $this->is_active && $this->status === 'active';
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function isCanceled(): bool
    {
        return $this->canceled_at !== null;
    }
}
