import React from 'react';
import { Head } from '@inertiajs/react';

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Terms and Conditions - MailNow" />
            <header className="px-6 py-4 border-b sticky top-0 bg-background/80 backdrop-blur z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.svg" alt="MailNow" className="h-8 w-8" />
                        <span className="text-xl font-semibold">MailNow</span>
                    </div>
                    <nav className="text-sm flex items-center gap-6">
                        <a className="hover:underline" href="/">Home</a>
                        <a className="hover:underline" href="/login">Sign in</a>
                        <button
                            type="button"
                            onClick={() => document.documentElement.classList.toggle('dark')}
                            className="inline-flex items-center rounded border px-3 py-1.5 text-xs"
                        >
                            Toggle theme
                        </button>
                    </nav>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
                <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
                    <p className="text-muted-foreground mb-6">
                        By accessing and using MailNow, you accept and agree to be bound by the terms and
                        provision of this agreement.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Use License</h2>
                    <p className="text-muted-foreground mb-4">
                        Permission is granted to temporarily use MailNow for personal, non-commercial transitory
                        viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                        <li>Modify or copy the materials</li>
                        <li>Use the materials for any commercial purpose or for any public display</li>
                        <li>Attempt to reverse engineer any software contained on the website</li>
                        <li>Remove any copyright or other proprietary notations from the materials</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Service Availability</h2>
                    <p className="text-muted-foreground mb-6">
                        We strive to maintain high service availability but do not guarantee uninterrupted access.
                        We reserve the right to modify or discontinue the service with reasonable notice.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">User Responsibilities</h2>
                    <p className="text-muted-foreground mb-4">As a user of MailNow, you agree to:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                        <li>Comply with all applicable laws and regulations</li>
                        <li>Not send spam or unsolicited emails</li>
                        <li>Respect recipient privacy and unsubscribe requests</li>
                        <li>Maintain the security of your account credentials</li>
                        <li>Use the service only for lawful purposes</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Prohibited Uses</h2>
                    <p className="text-muted-foreground mb-4">You may not use our service:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                        <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                        <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                        <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                        <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                        <li>To submit false or misleading information</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
                    <p className="text-muted-foreground mb-6">
                        In no event shall MailNow, nor its directors, employees, partners, agents, suppliers, or affiliates,
                        be liable for any indirect, incidental, special, consequential, or punitive damages, including without
                        limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Termination</h2>
                    <p className="text-muted-foreground mb-6">
                        We may terminate or suspend your account and bar access to the service immediately, without prior notice
                        or liability, under our sole discretion, for any reason whatsoever and without limitation, including but
                        not limited to a breach of the Terms.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to Terms</h2>
                    <p className="text-muted-foreground mb-6">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                        If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
                    <p className="text-muted-foreground mb-4">
                        If you have any questions about these Terms and Conditions, please contact us:
                    </p>
                    <div className="p-4 rounded-lg border bg-card">
                        <p className="text-sm text-muted-foreground">
                            Email: <a href="mailto:legal@mailnow.com" className="text-primary hover:underline">legal@mailnow.com</a>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="px-6 py-10 border-t text-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <span>© {new Date().getFullYear()} MailNow</span>
                    <div className="flex items-center gap-6">
                        <a href="/about" className="hover:underline">About</a>
                        <a href="/privacy" className="hover:underline">Privacy</a>
                        <a href="/terms" className="hover:underline">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
