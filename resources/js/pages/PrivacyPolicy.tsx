import React from 'react';
import { Head } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Privacy Policy - MailNow" />
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
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
                    <p className="text-muted-foreground mb-4">
                        We collect information you provide directly to us, such as when you create an account,
                        upload contact lists, or send emails through our service.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                        <li>Account information (name, email address, password)</li>
                        <li>Contact lists and email content you upload</li>
                        <li>Email campaign data and delivery logs</li>
                        <li>Usage information and preferences</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
                    <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process and deliver your email campaigns</li>
                        <li>Send you technical notices and support messages</li>
                        <li>Respond to your comments and questions</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
                    <p className="text-muted-foreground mb-4">
                        We do not sell, trade, or otherwise transfer your personal information to third parties
                        except as described in this policy.
                    </p>
                    <p className="text-muted-foreground mb-6">
                        We may share your information with our email delivery partner (Resend) solely for the
                        purpose of sending your campaigns.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
                    <p className="text-muted-foreground mb-6">
                        We implement appropriate security measures to protect your personal information against
                        unauthorized access, alteration, disclosure, or destruction.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
                    <p className="text-muted-foreground mb-4">You have the right to:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                        <li>Access and update your personal information</li>
                        <li>Delete your account and associated data</li>
                        <li>Opt out of marketing communications</li>
                        <li>Request a copy of your data</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
                    <p className="text-muted-foreground mb-4">
                        If you have any questions about this Privacy Policy, please contact us at:
                    </p>
                    <div className="p-4 rounded-lg border bg-card">
                        <p className="text-sm text-muted-foreground">
                            Email: <a href="mailto:privacy@mailnow.com" className="text-primary hover:underline">privacy@mailnow.com</a>
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
