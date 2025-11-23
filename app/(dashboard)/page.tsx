import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-tight mb-6">
              Legal documents<br />for India
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
              Generate affidavits, notices, and receipts instantly. Professional formatting. Indian legal standards. No lawyer needed.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="bg-primary hover:bg-accent text-primary-foreground px-8 py-6 text-base">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="w-12 h-12 border-2 border-foreground mb-6" />
              <h3 className="text-lg font-semibold text-foreground mb-3">
                9 document types
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Affidavits, bank letters, rent receipts, legal notices. All formatted for Indian courts and authorities.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 border-2 border-foreground mb-6" />
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Credits, not subscriptions
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pay only for documents you create. No monthly fees. No contracts. Credits never expire.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 border-2 border-foreground mb-6" />
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Ready in seconds
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fill a simple form. Get a complete document. Download, print, or file immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Document Types */}
      <section className="py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-12">What you can create</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Lost document affidavit', category: 'Affidavit' },
              { title: 'Name correction affidavit', category: 'Affidavit' },
              { title: 'Address proof affidavit', category: 'Affidavit' },
              { title: 'Bank request letter', category: 'Letter' },
              { title: 'Rent receipt', category: 'Receipt' },
              { title: 'Payment default notice', category: 'Notice' },
              { title: 'Work delay notice', category: 'Notice' },
              { title: 'F&F settlement notice', category: 'Notice' },
              { title: 'Rent default notice', category: 'Notice' },
            ].map((doc, i) => (
              <div key={i} className="border border-border p-6 hover:border-foreground transition-colors">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3 block">
                  {doc.category}
                </span>
                <h3 className="text-sm font-medium text-foreground">{doc.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Start now
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Create an account. Generate your first document in under 2 minutes.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="bg-primary hover:bg-accent text-primary-foreground px-8 py-6 text-base">
                Sign up free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
