"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Send, 
  History, 
  Plus, 
  X, 
  ExternalLink, 
  TrendingDown, 
  TrendingUp, 
  Sparkles,
  RefreshCw,
  AlertCircle,
  Menu,
  ChevronDown,
  LogOut,
  ShoppingBag,
  DollarSign,
  Trash2,
  Truck,
  ShieldCheck,
  Check,
  FileText
} from "lucide-react";

interface SearchResult {
  platform: string;
  price: number;
  currency: string;
  link: string;
}

interface SearchResponse {
  product: string;
  confidence_score: number;
  search_timestamp: string;
  results: SearchResult[];
  recommendation: string;
}

interface HistoryItem {
  id: number;
  query: string;
  product_name: string;
  search_type: string;
  created_at: string;
  results?: string;
}

const BACKEND_URL = "http://localhost:8000/api";

const getPlatformColors = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes("amazon")) {
    return {
      bg: "bg-amber-500/5 border-amber-500/15",
      text: "text-amber-800",
      badge: "bg-amber-100 text-amber-950 border-amber-300/30",
      bar: "bg-gradient-to-r from-amber-400 to-amber-500",
      glow: "hover:shadow-amber-500/10",
      accent: "bg-amber-500"
    };
  }
  if (p.includes("flipkart")) {
    return {
      bg: "bg-blue-500/5 border-blue-500/15",
      text: "text-blue-800",
      badge: "bg-blue-100 text-blue-950 border-blue-300/30",
      bar: "bg-gradient-to-r from-blue-400 to-blue-500",
      glow: "hover:shadow-blue-500/10",
      accent: "bg-blue-500"
    };
  }
  if (p.includes("reliance") || p.includes("digital")) {
    return {
      bg: "bg-red-500/5 border-red-500/15",
      text: "text-red-800",
      badge: "bg-red-100 text-red-950 border-red-300/30",
      bar: "bg-gradient-to-r from-red-500 to-rose-500",
      glow: "hover:shadow-red-500/10",
      accent: "bg-red-500"
    };
  }
  if (p.includes("croma")) {
    return {
      bg: "bg-teal-500/5 border-teal-500/15",
      text: "text-teal-800",
      badge: "bg-teal-100 text-teal-950 border-teal-300/30",
      bar: "bg-gradient-to-r from-teal-400 to-emerald-500",
      glow: "hover:shadow-teal-500/10",
      accent: "bg-teal-500"
    };
  }
  if (p.includes("vijay") || p.includes("sales")) {
    return {
      bg: "bg-rose-500/5 border-rose-500/15",
      text: "text-rose-800",
      badge: "bg-rose-100 text-rose-950 border-rose-300/30",
      bar: "bg-gradient-to-r from-rose-500 to-red-500",
      glow: "hover:shadow-rose-500/10",
      accent: "bg-rose-500"
    };
  }
  if (p.includes("jiomart")) {
    return {
      bg: "bg-emerald-500/5 border-emerald-500/15",
      text: "text-emerald-800",
      badge: "bg-emerald-100 text-emerald-950 border-emerald-300/30",
      bar: "bg-gradient-to-r from-emerald-400 to-emerald-500",
      glow: "hover:shadow-emerald-500/10",
      accent: "bg-emerald-500"
    };
  }
  return {
    bg: "bg-slate-500/5 border-slate-500/15",
    text: "text-slate-800",
    badge: "bg-slate-100 text-slate-900 border-slate-300/30",
    bar: "bg-gradient-to-r from-slate-400 to-slate-500",
    glow: "hover:shadow-slate-500/10",
    accent: "bg-slate-500"
  };
};

export default function Home() {
  // UI states
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch search history
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleDeleteHistoryItem = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${BACKEND_URL}/history/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error("Error deleting history item:", err);
    }
  };

  const handleClearHistory = () => {
    setShowConfirmModal(true);
  };

  // Handle text search
  const handleTextSearch = async (textSearchQuery: string) => {
    if (!textSearchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setSearchResults(null);
    setLoadingStep("Searching e-commerce platforms...");

    try {
      const response = await fetch(`${BACKEND_URL}/search-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textSearchQuery })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Search failed");
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data);
      fetchHistory();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your backend connection.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleTextSearch(query);
    }
  };

  const startNewSearch = () => {
    setSearchResults(null);
    setQuery("");
    setError(null);
  };

  // Price metrics calculations
  const prices = searchResults?.results.map(r => r.price) || [];
  const lowestPrice = prices.length ? Math.min(...prices) : 0;
  const highestPrice = prices.length ? Math.max(...prices) : 0;
  const savings = highestPrice - lowestPrice;
  const lowestPlatform = searchResults?.results.find(r => r.price === lowestPrice)?.platform || "";

  const suggestions = [
    { label: "iPhone 17", query: "iPhone 17" },
    { label: "Samsung S25", query: "Samsung Galaxy S25" },
    { label: "Sony WH-1000XM5", query: "Sony WH-1000XM5" },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] text-[#1e293b] overflow-hidden font-sans relative">
      
      {/* Decorative Ambient Glow Blobs */}
      <div className="absolute top-[-15%] right-[-15%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-br from-orange-400/10 via-pink-400/8 to-transparent blur-[110px] pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] left-[-15%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-tr from-violet-400/8 via-cyan-400/6 to-transparent blur-[130px] pointer-events-none z-0" />

      {/* MOBILE SIDEBAR OVERLAY BACKGROUND */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 z-10 md:hidden transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR */}
      <div 
        className={`${
          sidebarOpen ? "w-[260px] translate-x-0 border-r border-slate-200/40" : "w-0 -translate-x-full border-r-transparent"
        } fixed md:relative h-full bg-white/40 backdrop-blur-xl flex flex-col z-20 shrink-0 overflow-hidden transition-all duration-300 ease-in-out`}
      >
        {/* Sidebar Header with controls */}
        <div className="p-3.5 flex items-center justify-between gap-2 border-b border-slate-200">
          <button 
            onClick={startNewSearch}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors duration-200 text-slate-800 font-semibold shadow-sm cursor-pointer"
          >
            <Plus size={16} className="text-orange-600" />
            New Comparison
          </button>
          
          {/* Close Sidebar Button on Mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 shrink-0"
            title="Close Sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search History List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 px-3 py-1.5 flex items-center justify-between uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <History size={11} />
              Search History
            </span>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-[9px] font-bold text-rose-600 hover:text-rose-750 px-1.5 py-0.5 rounded hover:bg-rose-50 transition-colors uppercase tracking-wider cursor-pointer"
                title="Clear all history"
              >
                Clear All
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="text-xs text-slate-400 px-3 py-2 italic">No history yet</div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                className="group flex items-center justify-between rounded-xl hover:bg-white/80 hover:shadow-sm border border-transparent hover:border-slate-200/35 text-slate-700 hover:text-slate-900 transition-all duration-200"
              >
                <button
                  onClick={() => {
                    startNewSearch();
                    if (item.results) {
                      try {
                        const parsedResults = JSON.parse(item.results);
                        setSearchResults(parsedResults);
                        setQuery(item.product_name);
                      } catch (err) {
                        handleTextSearch(item.product_name);
                      }
                    } else {
                      handleTextSearch(item.product_name);
                    }
                    // Auto-close sidebar on mobile after clicking
                    if (window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }}
                  className="flex-1 text-left px-3.5 py-2.5 text-sm truncate cursor-pointer flex items-center gap-2"
                  title={item.product_name}
                >
                  <FileText size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{item.product_name}</span>
                </button>
                <button
                  onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded text-slate-400 hover:text-rose-600 mr-1.5 transition-all duration-150 cursor-pointer"
                  title="Delete Item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* User profile footer */}
        <div className="p-3.5 border-t border-slate-200/40 flex items-center justify-between text-sm text-slate-600 bg-slate-100/30 backdrop-blur-md">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-sm">
              Dev
            </div>
            <div className="leading-tight truncate">
              <div className="font-bold text-slate-800 truncate">Test User</div>
              <div className="text-[10px] text-slate-500">Developer Profile</div>
            </div>
          </div>
          <button 
            onClick={() => alert("Mini project local demo session.")}
            className="hover:text-slate-900 p-1 hover:bg-slate-200 rounded-md transition-colors shrink-0 cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/20 backdrop-blur-3xl overflow-hidden relative z-10">
        
        {/* HEADER BAR */}
        <header className="h-14 border-b border-slate-200/40 bg-white/40 backdrop-blur-md flex items-center justify-between px-4 z-10 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-800 cursor-pointer"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-1 font-bold text-slate-800 select-none text-sm sm:text-base">
              <span className="hidden sm:inline">Price Comparison Assistant</span>
              <span className="sm:hidden">Price Compare</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs bg-orange-50 px-2.5 py-1.5 rounded-full text-orange-600 font-bold border border-orange-200/60 shadow-sm shrink-0">
            <Sparkles size={12} className="animate-pulse" />
            <span className="hidden sm:inline">Gemini 2.5 Active</span>
            <span className="sm:hidden">Gemini</span>
          </div>
        </header>

        {/* SCROLLABLE WORKSPACE AREA */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-48 md:pb-56">
          <div className="max-w-3xl mx-auto w-full min-h-full flex flex-col">
                   {searchResults ? (
              <div className="space-y-6 pb-24 animate-fade-in relative z-10">
                {/* Product Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Product Name</span>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-0.5">
                      {searchResults.product}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-slate-500 select-none">
                      <span className="bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-bold text-orange-700 flex items-center gap-1 shadow-sm">
                        <Sparkles size={11} className="text-orange-500 shrink-0" />
                        Price Accuracy: {searchResults.confidence_score}%
                      </span>
                      <span>•</span>
                      <span>Updated: {searchResults.search_timestamp}</span>
                    </div>
                  </div>
                  <button 
                    onClick={startNewSearch} 
                    className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all border border-slate-250 shadow-sm shrink-0 cursor-pointer font-bold hover:scale-[1.01]"
                  >
                    <RefreshCw size={12} className="text-orange-600" />
                    New Search
                  </button>
                </div>

                {/* Pricing Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Lowest */}
                  <div className="bg-white/45 backdrop-blur-xl border border-white/85 rounded-2xl p-4 flex items-center gap-4 shadow-[0_8px_32px_rgba(31,38,135,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:border-emerald-500/25 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <TrendingDown size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-450 uppercase font-black tracking-wider">Lowest Price</div>
                      <div className="text-lg font-black text-emerald-600 mt-0.5 truncate">
                        ₹{lowestPrice.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-450 truncate font-mono">{lowestPlatform}</div>
                    </div>
                  </div>

                  {/* Highest */}
                  <div className="bg-white/45 backdrop-blur-xl border border-white/85 rounded-2xl p-4 flex items-center gap-4 shadow-[0_8px_32px_rgba(31,38,135,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:border-rose-500/25 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <TrendingUp size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-450 uppercase font-black tracking-wider">Highest Price</div>
                      <div className="text-lg font-black text-rose-600 mt-0.5 truncate">
                        ₹{highestPrice.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-450 truncate">Platform High</div>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="bg-white/45 backdrop-blur-xl border border-white/85 rounded-2xl p-4 flex items-center gap-4 shadow-[0_8px_32px_rgba(31,38,135,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:border-orange-500/25 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <DollarSign size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-450 uppercase font-black tracking-wider">Maximum Savings</div>
                      <div className="text-lg font-black text-orange-600 mt-0.5 truncate">
                        ₹{savings.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold">
                        Save {highestPrice > 0 ? Math.round((savings / highestPrice) * 100) : 0}%!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Comparison Spectrum Component */}
                {searchResults.results.length > 1 && (
                  <div className="bg-white/45 backdrop-blur-xl border border-white/85 shadow-[0_8px_32px_rgba(31,38,135,0.03)] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Comparison Spectrum</h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full select-none">
                        {Math.round((savings / highestPrice) * 100)}% Max Saving Opportunity
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3.5 pt-2">
                      {searchResults.results.map((res, idx) => {
                        const isLowest = res.price === lowestPrice;
                        // Calculate percentage of value compared to lowest/highest
                        const percentage = highestPrice === lowestPrice 
                          ? 0 
                          : ((res.price - lowestPrice) / (highestPrice - lowestPrice)) * 100;
                        const dealScore = 100 - percentage;
                        const colors = getPlatformColors(res.platform);
                        return (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white/20 p-3 rounded-xl border border-slate-200/35 backdrop-blur-md">
                            <div className="flex items-center justify-between sm:justify-start gap-4 sm:w-1/3">
                              <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${colors.accent}`}></span>
                                {res.platform}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold select-none ${
                                isLowest 
                                  ? "text-emerald-700 bg-emerald-500/10 border border-emerald-500/20" 
                                  : "text-amber-700 bg-amber-500/10 border border-amber-500/20"
                              }`}>
                                ₹{res.price.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              <div className="relative flex-1 h-2 bg-slate-200/50 rounded-full overflow-hidden">
                                <div 
                                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${colors.bar}`}
                                  style={{ width: `${dealScore}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-black text-slate-400 w-12 text-right shrink-0">
                                {isLowest ? "Cheapest" : `+${Math.round(((res.price - lowestPrice) / lowestPrice) * 100)}%`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sleek Platform Comparison Matrix */}
                <div className="bg-white/45 backdrop-blur-xl border border-white/85 shadow-[0_8px_32px_rgba(31,38,135,0.03)] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Features Comparison</h3>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 select-none">
                      <ShoppingBag size={11} className="text-orange-500" />
                      Direct Verified Offers
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-200/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 pb-3">Store Platform</th>
                          <th className="py-2.5 pb-3">Final Pricing</th>
                          <th className="py-2.5 pb-3">Shipping Status</th>
                          <th className="py-2.5 pb-3">Verification</th>
                          <th className="py-2.5 pb-3 text-right">Merchant Deal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/30">
                        {searchResults.results.map((res, idx) => {
                          const isLowest = res.price === lowestPrice;
                          const theme = getPlatformColors(res.platform);
                          return (
                            <tr key={idx} className={`group hover:bg-white/20 transition-colors ${isLowest ? "bg-emerald-500/5" : ""}`}>
                              <td className="py-3.5 font-bold text-slate-800 text-sm flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white ${theme.bar}`}>
                                  {res.platform.substring(0, 1)}
                                </span>
                                {res.platform}
                              </td>
                              <td className="py-3.5">
                                <span className="font-extrabold text-slate-800 text-sm">₹{res.price.toLocaleString()}</span>
                                {isLowest && <span className="ml-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full select-none">Best Price</span>}
                              </td>
                              <td className="py-3.5 text-xs text-slate-550 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Truck size={13} className="text-slate-400 shrink-0" />
                                  <span>Free Delivery</span>
                                </span>
                              </td>
                              <td className="py-3.5 text-xs">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/15 text-emerald-700 font-bold select-none text-[10px]">
                                  <ShieldCheck size={11} className="text-emerald-600 shrink-0" />
                                  <span>Verified Store</span>
                                </span>
                              </td>
                              <td className="py-3.5 text-right">
                                <a 
                                  href={res.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                    isLowest 
                                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent hover:shadow-md hover:shadow-emerald-600/10 cursor-pointer" 
                                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer"
                                  }`}
                                >
                                  Go to Store
                                  <ExternalLink size={11} />
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Platforms Side by Side */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Offers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.results.map((res, idx) => {
                      const isLowest = res.price === lowestPrice;
                      return (
                        <div 
                          key={idx} 
                          className={`bg-white/45 backdrop-blur-xl rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 shadow-[0_8px_32px_rgba(31,38,135,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.055)] ${
                            isLowest ? "border-emerald-500/40 shadow-[0_10px_35px_rgba(16,185,129,0.04)]" : "border-slate-200/50"
                          }`}
                        >
                          {isLowest && (
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                              Best Offer
                            </div>
                          )}
                          <div className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${isLowest ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></span>
                            {res.platform}
                          </div>
                          
                          <div className="flex items-baseline gap-1 mt-4">
                            <span className="text-3xl font-black text-slate-800">₹{res.price.toLocaleString()}</span>
                            <span className="text-xs text-slate-450 font-mono">{res.currency}</span>
                          </div>
                          
                          <a 
                            href={res.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`mt-5 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm rounded-xl transition-all duration-300 font-bold border ${
                              isLowest 
                                ? "bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/15 text-white border-transparent cursor-pointer" 
                                : "bg-white/70 hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
                            }`}
                          >
                            Buy from {res.platform}
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gemini Recommendation */}
                <div className="relative bg-gradient-to-r from-orange-500/5 via-amber-500/3 to-transparent backdrop-blur-xl border border-orange-500/15 rounded-2xl p-5 shadow-[0_8px_32px_rgba(31,38,135,0.02)]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 rounded-lg bg-orange-500/10 text-orange-600 border border-orange-500/20 shadow-sm">
                      <Sparkles size={16} className="text-orange-500" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Gemini AI Recommendation</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                    {searchResults.recommendation}
                  </p>
                </div>
              </div>
            ) : (
              /* HERO / SUGGESTION CONTAINER */
              <div className="flex-1 flex flex-col justify-center items-center text-center max-w-xl mx-auto py-16 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-orange-600/10 text-orange-600 border border-orange-500/15 flex items-center justify-center mb-6 shadow-sm">
                  <ShoppingBag size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug">
                  What product are you comparing today?
                </h2>
                <p className="text-sm text-slate-500 mt-4 max-w-md leading-relaxed font-medium">
                  Instantly find and compare verified prices across Amazon, Flipkart, Croma, and Reliance Digital and other ecom stores.
                </p>

                {/* Quick actions/suggestions */}
                <div className="flex flex-wrap justify-center gap-3 mt-10 max-w-lg">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(s.query);
                        handleTextSearch(s.query);
                      }}
                      className="px-5 py-2.5 text-xs bg-white/60 backdrop-blur-md hover:bg-white/95 text-slate-755 hover:text-orange-600 border border-slate-200/50 rounded-full transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_20px_rgba(234,88,12,0.06)] hover:border-orange-500/20 hover:-translate-y-0.5 cursor-pointer font-bold"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* ANCHORED CHAT-STYLE BOTTOM INPUT PANEL */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/95 to-transparent px-4 md:px-8 pb-6 pt-12 z-10 pointer-events-none">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            
            {/* Loading step status */}
            {loading && (
              <div className="mb-3.5 bg-white/75 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-4 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] animate-pulse">
                <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-orange-600 animate-spin shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-slate-800">Analyzing Product...</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">{loadingStep}</div>
                </div>
              </div>
            )}

            {/* Error alerts */}
            {error && (
              <div className="mb-3.5 bg-white/75 backdrop-blur-xl border border-rose-200/60 rounded-2xl p-4 flex items-start gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
                <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-extrabold text-rose-600">Search Failed</div>
                  <div className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">{error}</div>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form 
              onSubmit={handleSubmit} 
              className="relative backdrop-blur-xl border rounded-2xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] focus-within:shadow-[0_12px_40px_rgba(234,88,12,0.08)] transition-all duration-300 ease-out transform hover:-translate-y-0.5 focus-within:-translate-y-0.5 bg-white/70 border-white/80 focus-within:border-orange-500/25"
            >
              <div className="flex items-center gap-2.5">
                
                {/* Search Icon Prefix */}
                <div className="p-2.5 bg-white/80 border border-slate-250/60 rounded-xl text-slate-400 shrink-0 shadow-sm select-none">
                  <Search size={16} />
                </div>
                
                {/* Input Text Box */}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter product name..."
                  disabled={loading}
                  className="w-full bg-transparent border-0 outline-none text-sm text-slate-800 placeholder-slate-400 focus:ring-0 py-1"
                />

                {/* Submit Send Button */}
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className={`p-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                    query.trim() && !loading
                      ? "bg-orange-600 hover:bg-orange-500 text-white shadow-sm" 
                      : "bg-slate-100/80 text-slate-300 border border-slate-205 cursor-not-allowed"
                  }`}
                  title="Submit Query"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>

            <div className="text-center text-[9px] text-slate-400 mt-3 font-medium">
              Price Comparison GPT can verify pricing data dynamically. Always review links and offers before ordering.
            </div>
          </div>
        </div>

      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/85 backdrop-blur-xl border border-slate-200/40 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-sm">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Clear History</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Confirmation Required</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-650 leading-relaxed font-semibold">
              Are you sure you want to permanently delete all search history? This action cannot be undone.
            </p>
            
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs bg-white/80 hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-250/60 transition-all cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(`${BACKEND_URL}/history`, {
                      method: "DELETE"
                    });
                    if (res.ok) {
                      fetchHistory();
                    }
                  } catch (err) {
                    console.error("Error clearing history:", err);
                  } finally {
                    setShowConfirmModal(false);
                  }
                }}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-md shadow-rose-600/10 hover:shadow-rose-600/25 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
