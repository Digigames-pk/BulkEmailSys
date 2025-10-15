<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailCampaign extends Model
{
    protected $fillable = [
        'name',
        'subject',
        'from_name',
        'reply_to_email',
        'description',
        'email_template_id',
        'group_id',
        'user_id',
        'status',
        'scheduled_at',
        'sent_at',
        'total_recipients',
        'sent_count',
        'failed_count',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    /**
     * Get the user that owns the campaign.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the email template for the campaign.
     */
    public function emailTemplate(): BelongsTo
    {
        return $this->belongsTo(EmailTemplate::class);
    }

    /**
     * Get the group for the campaign.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * Get the email logs for the campaign.
     */
    public function emailLogs(): HasMany
    {
        return $this->hasMany(EmailLog::class);
    }

    /**
     * Get the contacts that will receive this campaign.
     */
    public function getContactsAttribute()
    {
        return $this->group->contacts;
    }

    /**
     * Check if campaign can be sent.
     */
    public function canBeSent(): bool
    {
        return $this->status === 'draft' || $this->status === 'scheduled';
    }

    /**
     * Check if campaign is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'sent' || $this->status === 'failed';
    }
}
