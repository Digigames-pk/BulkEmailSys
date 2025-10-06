import React from 'react';
import { Head } from '@inertiajs/react';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="About Us - MailNow" />
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
                <h1 className="text-4xl font-bold mb-8">About MailNow</h1>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg text-muted-foreground mb-6">
                        MailNow was born from a simple need: making bulk email campaigns accessible, reliable, and easy to manage.
                        We believe that every business, regardless of size, should have access to professional email marketing tools.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
                    <p className="text-muted-foreground mb-6">
                        To democratize email marketing by providing an intuitive platform that combines powerful features with
                        simple usability. We're committed to helping businesses grow through effective communication.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">What We Do</h2>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                        <li>Streamline CSV contact imports with automatic validation and deduplication</li>
                        <li>Provide a flexible template builder for creating professional email campaigns</li>
                        <li>Ensure reliable email delivery through our Resend integration</li>
                        <li>Offer detailed email logs and analytics for campaign optimization</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="p-4 rounded-lg border bg-card">
                            <h3 className="font-semibold mb-2">Simplicity</h3>
                            <p className="text-sm text-muted-foreground">We believe powerful tools should be easy to use.</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                            <h3 className="font-semibold mb-2">Reliability</h3>
                            <p className="text-sm text-muted-foreground">Your campaigns deserve dependable delivery infrastructure.</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                            <h3 className="font-semibold mb-2">Transparency</h3>
                            <p className="text-sm text-muted-foreground">Clear pricing, detailed logs, and honest communication.</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                            <h3 className="font-semibold mb-2">Growth</h3>
                            <p className="text-sm text-muted-foreground">We grow when our customers grow.</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
                    <p className="text-muted-foreground mb-4">
                        Have questions or feedback? We'd love to hear from you.
                    </p>
                    <div className="p-4 rounded-lg border bg-card">
                        <p className="text-sm text-muted-foreground">
                            Email: <a href="mailto:hello@mailnow.com" className="text-primary hover:underline">hello@mailnow.com</a>
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
