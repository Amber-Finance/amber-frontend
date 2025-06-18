export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Bitcoin Outpost
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            The premier destination for Bitcoin DeFi. Lend, borrow, and earn
            with your Bitcoin assets.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-8 rounded-lg transition-colors shadow-sm">
              Launch App
            </button>
            <button className="border border-border hover:bg-accent hover:text-accent-foreground text-foreground font-medium py-3 px-8 rounded-lg transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">🏦</div>
            <h3 className="text-xl font-semibold mb-2">Lend & Earn</h3>
            <p className="text-muted-foreground">
              Earn yield on your Bitcoin by lending to the protocol
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Borrow Assets</h3>
            <p className="text-muted-foreground">
              Use your Bitcoin as collateral to borrow other assets
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">
              Secure & Decentralized
            </h3>
            <p className="text-muted-foreground">
              Built on secure blockchain infrastructure
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
