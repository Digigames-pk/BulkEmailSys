<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BaseTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'editor_content',
        'mail_content',
        'thumbnail',
    ];
}
