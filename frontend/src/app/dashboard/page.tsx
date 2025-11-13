"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  FileText,
  CircleDollarSign,
  Coins,
  PlusCircle,
  ThumbsDown,
  ThumbsUp,
  Eye,
  Clock,
  Store,
  Database,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { AppShell } from "@/components/layout/app-shell";

// Sample data
const chartData = [
  { month: "Jan", earnings: 186 },
  { month: "Feb", earnings: 305 },
  { month: "Mar", earnings: 237 },
  { month: "Apr", earnings: 273 },
  { month: "May", earnings: 209 },
  { month: "Jun", earnings: 420 },
];

const defaultProposals = [
  {
    id: 1,
    title: 'Approve new dataset: "NYC Taxi Rides"',
    status: "Active",
    type: "Dataset Approval",
    votes_for: 72,
    votes_against: 8,
    end_date: "3 days remaining",
  },
  {
    id: 2,
    title: 'Create new category: "Geospatial Data"',
    status: "Passed",
    type: "Category Creation",
    votes_for: 88,
    votes_against: 12,
    end_date: "Ended 2 weeks ago",
  },
  {
    id: 4,
    title: 'Set price for "Medical Imaging Scans"',
    status: "Active",
    type: "Pricing",
    votes_for: 34,
    votes_against: 16,
    end_date: "1 day remaining",
  },
  {
    id: 3,
    title: "Update DAO governance charter",
    status: "Failed",
    type: "Governance",
    votes_for: 40,
    votes_against: 60,
    end_date: "Ended 1 month ago",
  },
];

export default function DashboardPage() {
  const username = "Raj.sui";
  const [proposals, setProposals] = useState(defaultProposals);

  function handleVote(proposalId: number, type: string) {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              votes_for: type === "yes" ? p.votes_for + 1 : p.votes_for,
              votes_against:
                type === "no" ? p.votes_against + 1 : p.votes_against,
            }
          : p
      )
    );
  }

  const maxEarnings = Math.max(...chartData.map((d) => d.earnings));

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-blue-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <CircleDollarSign className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-green-600 font-medium">
                  +20.1%
                </span>
              </div>
              <div className="text-3xl font-semibold text-slate-800 mb-1">
                1,250 KAI
              </div>
              <div className="text-sm text-slate-500">Total Earnings</div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-blue-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                  <Coins className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-slate-400 font-medium">
                  Staked: 2K
                </span>
              </div>
              <div className="text-3xl font-semibold text-slate-800 mb-1">
                5,000 KAI
              </div>
              <div className="text-sm text-slate-500">Token Balance</div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-blue-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-green-600 font-medium">+2</span>
              </div>
              <div className="text-3xl font-semibold text-slate-800 mb-1">
                12
              </div>
              <div className="text-sm text-slate-500">Contributions</div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-blue-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-semibold text-slate-800 mb-1">
                83.3%
              </div>
              <div className="text-sm text-slate-500">Approval Rate</div>
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 mb-12">
            <div className="mb-8">
              <h2 className="text-2xl font-medium text-slate-800 mb-2">
                Earnings Trend
              </h2>
              <p className="text-slate-500">
                Monthly KAI token earnings from contributions
              </p>
            </div>

            <div className="flex items-end justify-between h-64 gap-8">
              {chartData.map((item, idx) => {
                const height = (item.earnings / maxEarnings) * 100;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-3"
                  >
                    <div className="w-full flex flex-col items-center justify-end h-full">
                      <div className="text-sm font-medium text-slate-600 mb-2">
                        {item.earnings}
                      </div>
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-blue-400 to-cyan-300 transition-all hover:from-blue-500 hover:to-cyan-400"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      {item.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <button className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all text-left group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <Store className="h-7 w-7 text-white" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-1">
                Marketplace
              </h3>
              <p className="text-slate-500">Explore and purchase datasets</p>
            </button>

            <button className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all text-left group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center">
                  <Database className="h-7 w-7 text-white" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-1">
                Contribute Data
              </h3>
              <p className="text-slate-500">Upload datasets and earn KAI</p>
            </button>

            <button className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 border border-blue-200 hover:shadow-lg transition-all text-left group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <PlusCircle className="h-7 w-7 text-white" />
                </div>
                <ChevronRight className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-medium text-white mb-1">
                Create Proposal
              </h3>
              <p className="text-blue-100">Start a governance vote</p>
            </button>
          </div>

          {/* Governance Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-medium text-slate-800 mb-2">
                  Governance
                </h2>
                <p className="text-slate-500 text-lg">
                  Active proposals and voting
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {proposals.map((proposal) => {
                const totalVotes = proposal.votes_for + proposal.votes_against;
                const forPercentage =
                  totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 0;
                const againstPercentage =
                  totalVotes > 0
                    ? (proposal.votes_against / totalVotes) * 100
                    : 0;

                return (
                  <div
                    key={proposal.id}
                    className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-slate-800 mb-2">
                          {proposal.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                            {proposal.type}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {proposal.end_date}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${
                          proposal.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : proposal.status === "Passed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {proposal.status}
                      </span>
                    </div>

                    {(proposal.status === "Active" ||
                      proposal.status === "Passed" ||
                      proposal.status === "Failed") && (
                      <div className="mb-6">
                        <div className="relative h-3 w-full rounded-full overflow-hidden bg-slate-100">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500"
                            style={{ width: `${forPercentage}%` }}
                          />
                          <div
                            className="absolute top-0 right-0 h-full bg-gradient-to-l from-red-400 to-red-500"
                            style={{ width: `${againstPercentage}%` }}
                          />
                        </div>

                        <div className="flex justify-between mt-3">
                          <span className="text-sm font-medium text-green-600">
                            Yes: {proposal.votes_for} (
                            {forPercentage.toFixed(0)}
                            %)
                          </span>
                          <span className="text-sm font-medium text-red-600">
                            No: {proposal.votes_against} (
                            {againstPercentage.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {proposal.status === "Active" && (
                        <>
                          <button
                            onClick={() => handleVote(proposal.id, "yes")}
                            className="flex-1 py-3 px-4 rounded-2xl border-2 border-green-200 bg-green-50 hover:bg-green-100 text-green-700 font-medium transition-all flex items-center justify-center gap-2"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            Vote Yes
                          </button>
                          <button
                            onClick={() => handleVote(proposal.id, "no")}
                            className="flex-1 py-3 px-4 rounded-2xl border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-medium transition-all flex items-center justify-center gap-2"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            Vote No
                          </button>
                        </>
                      )}
                      <button className="py-3 px-4 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-all flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4" />
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
