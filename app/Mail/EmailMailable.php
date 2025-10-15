<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailMailable extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public string $content;
    public ?string $fromName;
    public ?string $replyToEmail;

    /**
     * Create a new message instance.
     */
    public function __construct(string $subject, string $content, ?string $fromName = null, ?string $replyToEmail = null)
    {
        $this->subject = $subject;
        $this->content = $content;
        $this->fromName = $fromName;
        $this->replyToEmail = $replyToEmail;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $envelope = new Envelope(
            subject: $this->subject,
        );

        // Set from name if provided
        if ($this->fromName) {
            $envelope->from(config('mail.from.address'), $this->fromName);
        }

        // Set reply-to email if provided
        if ($this->replyToEmail) {
            $envelope->replyTo($this->replyToEmail);
        }

        return $envelope;
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->content,
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
