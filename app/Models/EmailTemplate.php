<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email_subject',
        'csv_file',
        'editor_content',
        'mail_content',
        'thumbnail',
    ];

    /**
     * Get the user that owns the email template.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the email logs for the template.
     */
    public function emailLogs()
    {
        return $this->hasMany(EmailLog::class);
    }
}
