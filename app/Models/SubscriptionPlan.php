<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name',
        'description',
        'stripe_price_id',
        'stripe_product_id',
        'price',
        'currency',
        'interval',
        'trial_days',
        'is_active',
        'is_featured',
        'max_templates',
        'max_contacts',
        'max_emails_per_month',
        'features',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'features' => 'array',
    ];

    public function userSubscriptions(): HasMany
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function isUnlimited($type): bool
    {
        return match ($type) {
            'templates' => $this->max_templates === 0,
            'contacts' => $this->max_contacts === 0,
            'emails' => $this->max_emails_per_month === 0,
            default => false,
        };
    }

    public function getFormattedPriceAttribute(): string
    {
        return '$' . number_format($this->price, 2) . '/' . $this->interval;
    }
}
