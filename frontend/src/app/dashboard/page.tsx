"use client";

import { useState, useEffect, useMemo } from "react";
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
  ArrowUpDown,
  Wallet,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDao, useAccountCap, usePurchaseKai, useAddKai, useBurnKai, useProposals } from "@/hooks/use-dao";
import { useSuiWallet } from "@/hooks/use-sui-wallet";
import { formatSuiAmount, parseSuiAmount, CONTRACT_ADDRESSES } from "@/lib/sui/config";
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { dao, isLoading: daoLoading } = useDao();
  const { accountCap, isLoading: accountCapLoading } = useAccountCap();
  const { proposals } = useProposals();
  const { isConnected, address } = useSuiWallet();
  const { purchaseKai, isLoading: purchasing } = usePurchaseKai();
  const { addKai, isLoading: adding } = useAddKai();
  const { burnKai, isLoading: burning } = useBurnKai();
  const { toast } = useToast();

  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);

  // Calculate KAI balance
  const kaiBalance = useMemo(() => {
    if (!accountCap) return "0";
    return formatSuiAmount(accountCap.kaiBalance, 6);
  }, [accountCap]);

  // Calculate KAI value in SUI
  const kaiValueInSui = useMemo(() => {
    if (!dao || !accountCap) return "0";
    const balance = BigInt(accountCap.kaiBalance || "0");
    const price = BigInt(dao.kaiPrice || "0");
    if (price === BigInt(0)) return "0";
    const value = balance / price;
    return formatSuiAmount(value.toString(), 9);
  }, [dao, accountCap]);

  // Calculate how much KAI user will receive
  const calculateKaiFromSui = (suiAmount: string): string => {
    if (!dao || !suiAmount || parseFloat(suiAmount) <= 0) return "0";
    const suiInMist = parseSuiAmount(suiAmount);
    const price = BigInt(dao.kaiPrice || "0");
    if (price === BigInt(0)) return "0";
    const kaiAmount = suiInMist * price;
    return formatSuiAmount(kaiAmount.toString(), 6);
  };

  // Calculate how much SUI user will receive
  const calculateSuiFromKai = (kaiAmount: string): string => {
    if (!dao || !kaiAmount || parseFloat(kaiAmount) <= 0) return "0";
    const kaiInMist = parseSuiAmount(kaiAmount, 6);
    const price = BigInt(dao.kaiPrice || "0");
    if (price === BigInt(0)) return "0";
    const suiAmount = kaiInMist / price;
    return formatSuiAmount(suiAmount.toString(), 9);
  };

  // Handle purchase
  const handlePurchase = async (isFirstTime: boolean = false) => {
    if (!dao || !isConnected) {
      toast({
        title: "Action Required",
        description: "Please connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid SUI amount.",
        variant: "destructive",
      });
      return;
    }

    const result = isFirstTime
      ? await purchaseKai(purchaseAmount, dao.id)
      : accountCap
        ? await addKai(dao.id, accountCap.id, purchaseAmount, dao.id)
        : null;

    if (result) {
      setPurchaseAmount("");
      setPurchaseDialogOpen(false);
      // Refresh will happen automatically via hooks
    }
  };

  // Handle sell
  const handleSell = async () => {
    if (!dao || !accountCap || !isConnected) {
      toast({
        title: "Action Required",
        description: "Please connect your wallet and ensure you have an AccountCap.",
        variant: "destructive",
      });
      return;
    }

    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid KAI amount.",
        variant: "destructive",
      });
      return;
    }

    const kaiBalanceNum = parseFloat(kaiBalance);
    if (parseFloat(sellAmount) > kaiBalanceNum) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${kaiBalance} KAI.`,
        variant: "destructive",
      });
      return;
    }

    const result = await burnKai(dao.id, accountCap.id, sellAmount, dao.id);

    if (result) {
      setSellAmount("");
      setSellDialogOpen(false);
      // Refresh will happen automatically via hooks
    }
  };

  // Calculate DAO stats
  const treasuryBalance = useMemo(() => {
    if (!dao) return "0";
    return formatSuiAmount(dao.treasury, 9);
  }, [dao]);

  const kaiReserve = useMemo(() => {
    if (!dao) return "0";
    return formatSuiAmount(dao.kaiReserve, 6);
  }, [dao]);

  const rewardPool = useMemo(() => {
    if (!dao) return "0";
    return formatSuiAmount(dao.rewardPool, 6);
  }, [dao]);

  const kaiPrice = useMemo(() => {
    if (!dao || !dao.kaiPrice) return "0";
    const price = BigInt(dao.kaiPrice);
    // Price is stored as SUI per KAI, so 1000 means 1 SUI = 1000 KAI (0.001 SUI per KAI)
    if (price === BigInt(0)) return "0";
    const suiPerKai = BigInt("1000000000") / price; // Convert to SUI (9 decimals)
    return formatSuiAmount(suiPerKai.toString(), 9);
  }, [dao]);

  const activeProposals = useMemo(() => {
    if (!proposals) return 0;
    const now = Date.now();
    return proposals.filter((p) => {
      const endTime = BigInt(p.ends || "0");
      return BigInt(now) < endTime && !p.executed;
    }).length;
  }, [proposals]);

  const isLoading = daoLoading || accountCapLoading;

  // Check if contract is configured
  const isContractConfigured = CONTRACT_ADDRESSES.PACKAGE_ID &&
    CONTRACT_ADDRESSES.PACKAGE_ID !== '' &&
    !CONTRACT_ADDRESSES.PACKAGE_ID.startsWith('0x00000');

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {!isContractConfigured && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-500 mb-1">Contract Not Configured</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The smart contract package ID is not set. Please deploy the contract and configure your environment variables.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>1. Deploy the contract: <code className="bg-background/50 px-1 py-0.5 rounded">cd smart-contracts && sui client publish --gas-budget 100000000</code></p>
                  <p>2. Create <code className="bg-background/50 px-1 py-0.5 rounded">frontend/.env.local</code> with:</p>
                  <pre className="bg-background/50 p-2 rounded mt-1 text-xs overflow-x-auto">
                    {`NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_PACKAGE_ID=0x<YOUR_PACKAGE_ID>
NEXT_PUBLIC_SUI_DATA_DAO_ID=0x<YOUR_DATA_DAO_ID>
NEXT_PUBLIC_SUI_MARKETPLACE_ID=0x<YOUR_MARKETPLACE_ID>`}
                  </pre>
                  <p className="mt-2">See <code className="bg-background/50 px-1 py-0.5 rounded">README_DEPLOYMENT.md</code> for detailed instructions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* KAI Balance */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary/50 flex items-center justify-center">
                <Coins className="h-6 w-6 text-primary-foreground" />
              </div>
              {isConnected && accountCap && (
                <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Sell
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sell KAI Tokens</DialogTitle>
                      <DialogDescription>
                        Burn KAI tokens to redeem SUI at the current exchange rate.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sell-amount">KAI Amount</Label>
                        <Input
                          id="sell-amount"
                          type="number"
                          placeholder="0"
                          value={sellAmount}
                          onChange={(e) => setSellAmount(e.target.value)}
                          min="0"
                          step="0.000001"
                        />
                        <p className="text-xs text-muted-foreground">
                          Balance: {kaiBalance} KAI
                        </p>
                        {sellAmount && parseFloat(sellAmount) > 0 && (
                          <p className="text-xs text-green-600">
                            You will receive: ~{calculateSuiFromKai(sellAmount)} SUI
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={handleSell}
                        disabled={burning || !sellAmount || parseFloat(sellAmount) <= 0}
                        className="w-full"
                      >
                        {burning ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Burning...
                          </>
                        ) : (
                          <>
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Sell KAI
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                `${kaiBalance} KAI`
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {isConnected && accountCap
                ? `≈ ${kaiValueInSui} SUI`
                : "Connect wallet to view balance"}
            </div>
          </div>

          {/* Token Price */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                <CircleDollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                `${kaiPrice} SUI`
              )}
            </div>
            <div className="text-sm text-muted-foreground">Per KAI Token</div>
          </div>

          {/* Active Proposals */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <Link href="/governance">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </Link>
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              {activeProposals}
            </div>
            <div className="text-sm text-muted-foreground">Active Proposals</div>
          </div>

          {/* DAO Treasury */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                `${treasuryBalance} SUI`
              )}
            </div>
            <div className="text-sm text-muted-foreground">DAO Treasury</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Purchase/Sell KAI Card */}
          <div className="lg:col-span-2 bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium text-foreground mb-1">
                  Purchase KAI Tokens
                </h2>
                <p className="text-muted-foreground text-sm">
                  Buy KAI tokens with SUI to participate in governance
                </p>
              </div>
              {!isConnected && (
                <div className="flex items-center gap-2 text-yellow-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </div>
              )}
            </div>

            {!isConnected ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Connect your wallet to purchase KAI tokens
                </p>
                <Link href="/auth/wallet-connect">
                  <Button>Connect Wallet</Button>
                </Link>
              </div>
            ) : !accountCap ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-500">
                    First purchase will create your AccountCap. This gives you
                    governance rights in the DAO.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchase-amount">SUI Amount</Label>
                    <Input
                      id="purchase-amount"
                      type="number"
                      placeholder="0"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(e.target.value)}
                      min="0"
                      step="0.1"
                    />
                    {purchaseAmount && parseFloat(purchaseAmount) > 0 && (
                      <p className="text-xs text-green-600">
                        You will receive: ~{calculateKaiFromSui(purchaseAmount)} KAI
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handlePurchase(true)}
                    disabled={purchasing || !purchaseAmount || parseFloat(purchaseAmount) <= 0}
                    className="w-full"
                    size="lg"
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Purchase KAI (First Time)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchase-amount">SUI Amount</Label>
                    <Input
                      id="purchase-amount"
                      type="number"
                      placeholder="0"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(e.target.value)}
                      min="0"
                      step="0.1"
                    />
                    {purchaseAmount && parseFloat(purchaseAmount) > 0 && (
                      <p className="text-xs text-green-600">
                        +{calculateKaiFromSui(purchaseAmount)} KAI
                      </p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => handlePurchase(false)}
                      disabled={adding || !purchaseAmount || parseFloat(purchaseAmount) <= 0}
                      className="w-full"
                    >
                      {adding ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add KAI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span className="font-semibold">{kaiBalance} KAI</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-semibold">≈ {kaiValueInSui} SUI</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DAO Stats Card */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-medium text-foreground">DAO Stats</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Treasury (SUI)</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      treasuryBalance
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KAI Reserve</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      `${kaiReserve} KAI`
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reward Pool</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      `${rewardPool} KAI`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/marketplace"
            className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-lg hover:border-primary/50 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                <Store className="h-7 w-7 text-white" />
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-1">Marketplace</h3>
            <p className="text-muted-foreground">Explore and purchase datasets</p>
          </Link>

          <Link
            href="/contribute/upload"
            className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-lg hover:border-primary/50 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center">
                <Database className="h-7 w-7 text-white" />
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-1">Contribute Data</h3>
            <p className="text-muted-foreground">Upload datasets and earn KAI</p>
          </Link>

          <Link
            href="/governance/create"
            className="bg-gradient-to-br from-primary/80 to-purple-500/80 rounded-2xl p-6 border border-primary/50 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <PlusCircle className="h-7 w-7 text-white" />
              </div>
              <ChevronRight className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-medium text-white mb-1">Create Proposal</h3>
            <p className="text-primary-foreground/80">Start a governance vote</p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
