<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends Model
{
    protected $fillable = [
        'name',
        'email',
        'mobile',
        'gender',
        'user_id',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Get the user that owns the contact.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the email logs for the contact.
     */
    public function emailLogs()
    {
        return $this->hasMany(EmailLog::class);
    }
}
