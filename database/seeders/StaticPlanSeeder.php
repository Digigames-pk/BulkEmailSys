<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class StaticPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create only one static plan for the upgrade page
        SubscriptionPlan::create([
            'name' => 'Free Plan',
            'description' => 'Perfect for getting started with email marketing',
            'stripe_price_id' => 'price_free',
            'stripe_product_id' => 'prod_free',
            'price' => 0.00,
            'currency' => 'usd',
            'interval' => 'month',
            'trial_days' => 0,
            'is_active' => true,
            'is_featured' => false,
            'max_templates' => 3,
            'max_contacts' => 100,
            'max_emails_per_month' => 50,
            'features' => [
                '3 Email Templates',
                '100 Contacts',
                '50 Emails per Month',
                'Basic Support'
            ],
        ]);
    }
}
