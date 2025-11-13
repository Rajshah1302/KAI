"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, ThumbsDown, ThumbsUp, Eye, Clock } from 'lucide-react';

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


export default function GovernancePage() {
    const [proposals, setProposals] = useState(defaultProposals);

    useEffect(() => {
        try {
            const storedProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
            const combined = [...defaultProposals];
            const storedIds = new Set(combined.map(p => p.id));
            
            for (const stored of storedProposals) {
                if (!storedIds.has(stored.id)) {
                    combined.push(stored);
                }
            }
            setProposals(combined);
        } catch (e) {
            console.error("Could not load proposals from local storage", e);
            setProposals(defaultProposals);
        }
    }, []);


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

  return (
    <AppShell>
         <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-3xl font-medium text-foreground mb-2">
                Governance
                </h2>
                <p className="text-muted-foreground text-lg">
                Active proposals and voting
                </p>
            </div>
            <Button asChild className="bg-gradient-to-br from-primary/80 to-purple-500/80 text-primary-foreground">
                <Link href="/governance/create">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Proposal
                </Link>
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
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
                    className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          {proposal.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {proposal.type}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {proposal.end_date}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${
                          proposal.status === "Active"
                            ? "bg-green-500/10 text-green-500"
                            : proposal.status === "Passed"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {proposal.status}
                      </span>
                    </div>

                    {(proposal.status === "Active" ||
                      proposal.status === "Passed" ||
                      proposal.status === "Failed") && (
                      <div className="mb-6">
                        <div className="relative h-2 w-full rounded-full overflow-hidden bg-secondary">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                            style={{ width: `${forPercentage}%` }}
                          />
                          <div
                            className="absolute top-0 right-0 h-full bg-gradient-to-l from-red-400 to-red-500 rounded-full"
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
                            className="flex-1 py-3 px-4 rounded-xl border border-green-500/20 bg-green-500/10 hover:bg-green-500/20 text-green-500 font-medium transition-all flex items-center justify-center gap-2"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            Vote Yes
                          </button>
                          <button
                            onClick={() => handleVote(proposal.id, "no")}
                            className="flex-1 py-3 px-4 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium transition-all flex items-center justify-center gap-2"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            Vote No
                          </button>
                        </>
                      )}
                      <button className="py-3 px-4 rounded-xl border border-border bg-secondary hover:bg-muted text-muted-foreground font-medium transition-all flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4" />
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
    </AppShell>
  );
}
