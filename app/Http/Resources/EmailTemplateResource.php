<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmailTemplateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email_subject' => $this->email_subject,
            'csv_file' => $this->csv_file ? url('storage/' . $this->csv_file) : null,
            'csv_filename' => $this->csv_file ? basename($this->csv_file) : null,
            'thumbnail' => $this->thumbnail ? url('storage/' . $this->thumbnail) : null,
            'editor_content' => $this->editor_content,
            'mail_content' => $this->mail_content,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
        ];
    }
}
