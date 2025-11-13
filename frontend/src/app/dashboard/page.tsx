"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  FileText,
  CircleDollarSign,
  Coins,
  PiggyBank,
  RefreshCw,
  Database,
  ChevronRight,
  Store,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

const chartData = [
  { month: "Jan", earnings: 186 },
  { month: "Feb", earnings: 305 },
  { month: "Mar", earnings: 237 },
  { month: "Apr", earnings: 273 },
  { month: "May", earnings: 209 },
  { month: "Jun", earnings: 420 },
];

export default function DashboardPage() {
  const maxEarnings = Math.max(...chartData.map((d) => d.earnings));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary/50 flex items-center justify-center">
                <CircleDollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-sm text-green-600 font-medium">
                +20.1%
              </span>
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              1,250 KAI
            </div>
            <div className="text-sm text-muted-foreground">Total Earnings</div>
          </div>

          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                Staked: 2K
              </span>
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              5,000 KAI
            </div>
            <div className="text-sm text-muted-foreground">Token Balance</div>
          </div>

          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm text-green-600 font-medium">+2</span>
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              12
            </div>
            <div className="text-sm text-muted-foreground">Contributions</div>
          </div>

          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              83.3%
            </div>
            <div className="text-sm text-muted-foreground">Approval Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Earnings Chart */}
            <div className="lg:col-span-2 bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm">
                <div className="mb-6">
                <h2 className="text-xl font-medium text-foreground mb-1">
                    Earnings Trend
                </h2>
                <p className="text-muted-foreground text-sm">
                    Monthly KAI token earnings from contributions
                </p>
                </div>

                <div className="flex items-end justify-between h-64 gap-4">
                {chartData.map((item, idx) => {
                    const height = (item.earnings / maxEarnings) * 100;
                    return (
                    <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-3 group"
                    >
                        <div className="w-full flex flex-col items-center justify-end h-full">
                        <div className="text-xs font-medium text-muted-foreground mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.earnings}
                        </div>
                        <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-primary/70 to-primary/40 transition-all group-hover:from-primary/80 group-hover:to-primary/50"
                            style={{ height: `${height}%` }}
                        />
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                        {item.month}
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>
            {/* Treasury Card */}
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm flex flex-col justify-between">
                 <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <PiggyBank className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl font-medium text-foreground">
                            DAO Treasury
                        </h2>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Current Treasury Balance (SUI)</p>
                        <p className="text-4xl font-bold flex items-center gap-2">
                            250,000 SUI
                        </p>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>+5.8% in last 30 days</span>
                    </div>
                </div>
                 <button className="w-full mt-6 py-3 px-4 rounded-xl border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Burn KAI for SUI
                 </button>
            </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/marketplace" className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-lg hover:border-primary/50 transition-all text-left group">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                    <Store className="h-7 w-7 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-1">
                    Marketplace
                </h3>
                <p className="text-muted-foreground">Explore and purchase datasets</p>
            </Link>

            <Link href="/contribute/upload" className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-lg hover:border-primary/50 transition-all text-left group">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center">
                    <Database className="h-7 w-7 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-1">
                    Contribute Data
                </h3>
                <p className="text-muted-foreground">Upload datasets and earn KAI</p>
            </Link>

            <Link href="/governance/create" className="bg-gradient-to-br from-primary/80 to-purple-500/80 rounded-2xl p-6 border border-primary/50 hover:shadow-lg transition-all text-left group">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <PlusCircle className="h-7 w-7 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-medium text-white mb-1">
                    Create Proposal
                </h3>
                <p className="text-primary-foreground/80">Start a governance vote</p>
            </Link>
        </div>

      </div>
    </AppShell>
  );
}
