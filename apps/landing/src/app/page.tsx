export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Bitcoin Outpost
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Bridge your liquid staking tokens and earn maximum yield. Get both
            staking rewards plus additional lending APY on your Bitcoin LSTs.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-8 rounded-lg transition-colors shadow-sm">
              Bridge & Deposit
            </button>
            <button className="border border-border hover:bg-accent hover:text-accent-foreground text-foreground font-medium py-3 px-8 rounded-lg transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">🌉</div>
            <h3 className="text-xl font-semibold mb-2">Bridge LSTs</h3>
            <p className="text-muted-foreground">
              Bridge your liquid staking tokens from Ethereum and other networks
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Earn Combined Yield</h3>
            <p className="text-muted-foreground">
              Get both underlying staking rewards plus additional lending APY
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure & Liquid</h3>
            <p className="text-muted-foreground">
              Maintain liquidity while maximizing yield on your Bitcoin assets
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
