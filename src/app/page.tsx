import { Search, Filter, ArrowUpDown } from "lucide-react";
import AssetCard from "@/components/ui/AssetCard";
import { assets } from "@/data/marketData";
import Link from "next/link";
import WorksCarousel from "@/components/ui/WorksCarousel";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="rounded-lg bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white p-8 md:p-12 relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Collateralize Your Real-World Assets
          </h1>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Unlock the value of your tokenized equities by borrowing against them. Low interest rates, high security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/borrow"
              className="bg-white text-[var(--primary)] hover:bg-white/90 transition-colors px-6 py-3 rounded-md font-medium"
            >
              Borrow Now
            </Link>
            <Link
              href="/portfolio"
              className="bg-white/20 hover:bg-white/30 text-white transition-colors px-6 py-3 rounded-md font-medium"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>
      
      {/* Market section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Markets</h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search assets..."
                className="py-2 pl-9 pr-3 rounded-md border border-[var(--border-color)] bg-transparent w-48 md:w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--secondary)] w-4 h-4" />
            </div>
            
            <button className="p-2 rounded-md border border-[var(--border-color)] hover:bg-[var(--border-color)]/10">
              <Filter className="w-4 h-4" />
            </button>
            
            <button className="p-2 rounded-md border border-[var(--border-color)] hover:bg-[var(--border-color)]/10">
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              id={asset.id}
              name={asset.name}
              symbol={asset.symbol}
              tokenizedSymbol={asset.tokenizedSymbol}
              price={asset.price}
              change={asset.change}
              changePercent={asset.changePercent}
              apy={asset.apy}
              logoUrl={asset.logoUrl}
              collateralFactor={asset.collateralFactor}
              utilizationRate={asset.utilizationRate}
            />
          ))}
        </div>
      </section>
      
      {/* How it works section */}
      <WorksCarousel />

      {/* New section after "How it Works" section */}
      <section className="py-12 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Start Trading Tokenized Assets</h2>
            <p className="text-[var(--secondary)] mb-8">
              Experience the future of asset ownership with Hedgehog Protocols tokenized Safaricom shares.
              Buy, sell, and trade tokenized assets with transparency and security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/trade/hhSAF" 
                className="bracket-btn size-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors"
              >
                Trade Safaricom Shares
              </Link>
              <a 
                href="/lend" 
                className="bracket-btn size-lg bg-transparent border border-[var(--border-color)] hover:bg-[var(--border-color)]/10 transition-colors"
              >
                Explore Lending Markets
              </a>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
          <div className="h-full w-full grid grid-cols-8 gap-px">
            {Array(8).fill(0).map((_, i) => (
              <div key={`vline-${i}`} className="h-full w-px bg-[var(--border-color)] mx-auto"></div>
            ))}
          </div>
          <div className="h-full w-full grid grid-rows-8 gap-px">
            {Array(8).fill(0).map((_, i) => (
              <div key={`hline-${i}`} className="w-full h-px bg-[var(--border-color)] my-auto"></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
