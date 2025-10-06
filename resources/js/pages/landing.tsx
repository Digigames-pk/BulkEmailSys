import React from 'react';
import { Head } from '@inertiajs/react';

export default function Landing() {

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Welcome to MailNow" />
            <header className="px-6 py-4 border-b sticky top-0 bg-background/80 backdrop-blur z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.svg" alt="MailNow" className="h-8 w-8" />
                        <span className="text-xl font-semibold">MailNow</span>
                    </div>
                    <nav className="text-sm flex items-center gap-6">
                        <a className="hover:underline" href="#features">Features</a>
                        <a className="hover:underline" href="#how">How it works</a>
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

            <main className="max-w-7xl mx-auto px-6 py-20">
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">All-in-one email platform</span>
                        <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight tracking-tight">Send smarter campaigns with MailNow</h1>
                        <p className="mt-5 text-muted-foreground text-lg leading-relaxed">Import contacts, design templates, and deliver at scale with reliability powered by Resend.</p>
                        <div className="mt-8 flex items-center gap-3">
                            <a href="/register" className="inline-flex items-center justify-center rounded bg-primary text-primary-foreground px-5 py-3 font-medium">Get started</a>
                            <a href="#how" className="inline-flex items-center justify-center rounded border px-5 py-3 font-medium">See how it works</a>
                        </div>
                        <div className="mt-10">
                            <img src="/images/brands.svg" alt="Brands" className="w-full max-w-xl opacity-80" />
                        </div>
                    </div>
                    <div>
                        <img src="/images/hero-illustration.svg" alt="Product preview" className="w-full h-auto rounded-xl shadow" />
                    </div>
                </section>

                <section id="features" className="mt-24 grid md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="text-lg font-semibold">CSV Imports</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Upload large contact lists and we’ll handle validation and de-duplication.</p>
                    </div>
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="text-lg font-semibold">Template Builder</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Create reusable templates with variables and previews.</p>
                    </div>
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="text-lg font-semibold">Reliable Delivery</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Resend transport ensures high deliverability and clear logs.</p>
                    </div>
                </section>

                <section id="how" className="mt-24">
                    <div className="rounded-2xl overflow-hidden border">
                        <img src="/images/ui-preview-dark.svg" alt="UI preview" className="w-full h-auto" />
                    </div>
                </section>

                <section id="testimonials" className="mt-24">
                    <h2 className="text-2xl md:text-3xl font-bold">Trusted by growing teams</h2>
                    <div className="mt-8 grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl border bg-card">
                            <p className="text-sm text-muted-foreground">“MailNow helped us launch a campaign to 30k contacts without a hiccup. Logs are crystal clear.”</p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-muted" />
                                <div>
                                    <div className="text-sm font-medium">Alex Johnson</div>
                                    <div className="text-xs text-muted-foreground">Growth Lead, Acme</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl border bg-card">
                            <p className="text-sm text-muted-foreground">“The CSV import and template variables save us hours every week. We switched in a day.”</p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-muted" />
                                <div>
                                    <div className="text-sm font-medium">Priya Kumar</div>
                                    <div className="text-xs text-muted-foreground">Founder, BrightLabs</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl border bg-card">
                            <p className="text-sm text-muted-foreground">“Deliverability is excellent with Resend. Our onboarding emails land where they should.”</p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-muted" />
                                <div>
                                    <div className="text-sm font-medium">Daniel Lee</div>
                                    <div className="text-xs text-muted-foreground">CTO, FlowStack</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="mt-24">
                    <h2 className="text-2xl md:text-3xl font-bold">Simple pricing</h2>
                    <p className="mt-2 text-muted-foreground">Choose a plan that fits your sending volume.</p>
                    <div className="mt-8 grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl border bg-card">
                            <div className="text-sm font-medium">Starter</div>
                            <div className="mt-2 text-3xl font-bold">Free</div>
                            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                <li>Up to 1,000 contacts</li>
                                <li>Basic templates</li>
                                <li>Email support</li>
                            </ul>
                            <a href="/register" className="mt-6 inline-flex items-center justify-center rounded border px-4 py-2 font-medium">Get started</a>
                        </div>
                        <div className="p-6 rounded-xl border bg-card ring-1 ring-ring">
                            <div className="text-sm font-medium">Growth</div>
                            <div className="mt-2 text-3xl font-bold">$29<span className="text-base font-medium text-muted-foreground">/mo</span></div>
                            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                <li>Up to 10,000 contacts</li>
                                <li>Advanced templates</li>
                                <li>Priority support</li>
                            </ul>
                            <a href="/register" className="mt-6 inline-flex items-center justify-center rounded bg-primary text-primary-foreground px-4 py-2 font-medium">Start free trial</a>
                        </div>
                        <div className="p-6 rounded-xl border bg-card">
                            <div className="text-sm font-medium">Scale</div>
                            <div className="mt-2 text-3xl font-bold">$99<span className="text-base font-medium text-muted-foreground">/mo</span></div>
                            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                <li>Up to 100,000 contacts</li>
                                <li>Custom templates</li>
                                <li>SLA support</li>
                            </ul>
                            <a href="/contact" className="mt-6 inline-flex items-center justify-center rounded border px-4 py-2 font-medium">Contact sales</a>
                        </div>
                    </div>
                </section>

                <section id="faq" className="mt-24">
                    <h2 className="text-2xl md:text-3xl font-bold">Frequently asked questions</h2>
                    <div className="mt-6 grid md:grid-cols-2 gap-6">
                        <div className="rounded-xl border p-5 bg-card">
                            <div className="font-medium">Can I import a large CSV?</div>
                            <p className="mt-2 text-sm text-muted-foreground">Yes — the app processes CSVs in the background queue and de-duplicates contacts.</p>
                        </div>
                        <div className="rounded-xl border p-5 bg-card">
                            <div className="font-medium">Do you support templates?</div>
                            <p className="mt-2 text-sm text-muted-foreground">Create, preview, and reuse templates with variables for personalization.</p>
                        </div>
                        <div className="rounded-xl border p-5 bg-card">
                            <div className="font-medium">What mail provider is used?</div>
                            <p className="mt-2 text-sm text-muted-foreground">Resend is integrated as the delivery transport for reliability.</p>
                        </div>
                        <div className="rounded-xl border p-5 bg-card">
                            <div className="font-medium">Is there a free plan?</div>
                            <p className="mt-2 text-sm text-muted-foreground">Yes — the Starter plan is free to help you get started.</p>
                        </div>
                    </div>
                </section>

                <section className="mt-24 border rounded-2xl p-10 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold">Ready to send smarter campaigns?</h2>
                    <p className="mt-2 text-muted-foreground">Join MailNow today and reach your audience with confidence.</p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <a href="/register" className="inline-flex items-center justify-center rounded bg-primary text-primary-foreground px-6 py-3 font-medium">Create account</a>
                        <a href="/login" className="inline-flex items-center justify-center rounded border px-6 py-3 font-medium">Sign in</a>
                    </div>
                </section>
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


