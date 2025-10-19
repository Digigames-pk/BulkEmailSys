<?php

namespace App\Http\Controllers;

use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class WebhookController extends Controller
{
    protected StripeService $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Handle Stripe webhooks
     */
    public function stripe(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            return response('Invalid payload', 400);
        } catch (SignatureVerificationException $e) {
            // Invalid signature
            return response('Invalid signature', 400);
        }

        // Handle the event
        $this->stripeService->handleWebhook($event->toArray());

        return response('OK', 200);
    }
}
