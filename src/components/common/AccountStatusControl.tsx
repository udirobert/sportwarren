"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Copy,
  LogOut,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

type AccountStatusControlVariant = "nav" | "hero";

interface AccountStatusControlProps {
  variant?: AccountStatusControlVariant;
  compact?: boolean;
  className?: string;
}

const truncateMiddle = (value: string, leading = 6, trailing = 4) => {
  if (value.length <= leading + trailing + 1) {
    return value;
  }

  return `${value.slice(0, leading)}…${value.slice(-trailing)}`;
};

const maskEmail = (value: string) => {
  const [local, domain] = value.split("@");
  if (!domain) {
    return truncateMiddle(value, 8, 4);
  }

  const localPreview = local.length <= 3 ? local : `${local.slice(0, 3)}…`;
  return `${localPreview}@${domain}`;
};

const formatChainLabel = (chain: string | null) => {
  switch (chain) {
    case "algorand":
      return "Algorand wallet";
    case "avalanche":
      return "Avalanche wallet";
    case "lens":
      return "Lens wallet";
    case "social":
      return "Social account";
    default:
      return "Not connected";
  }
};

export function AccountStatusControl({
  variant = "nav",
  compact = false,
  className = "",
}: AccountStatusControlProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    address,
    chain,
    hasAccount,
    hasWallet,
    isGuest,
    loginMethod,
    authStatus,
    disconnect,
  } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasEmbeddedWalletAddress = Boolean(address && /^0x[a-fA-F0-9]{8,}$/.test(address));

  const summary = useMemo(() => {
    const verificationNeeded = hasWallet && (authStatus.state === "missing" || authStatus.state === "expired");
    const verificationLabel = !hasWallet
      ? "Not required yet"
      : verificationNeeded
        ? authStatus.state === "expired"
          ? "Session expired"
          : "Signature needed"
        : "Verified";
    const chainLabel = formatChainLabel(chain);

    if (isGuest) {
      return {
        badge: "Preview",
        title: "Guest preview active",
        reference: "Local demo session",
        fullReference: "Guest preview",
        support: "Nothing protected yet. Claim your season when you are ready.",
        icon: Sparkles,
        iconTone: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
        badgeToneNav: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-400/20",
        badgeToneHero: "bg-sky-500/15 text-sky-200 border-sky-400/20",
        verificationLabel,
        chainLabel: "Guest preview",
        detailLabel: "Preview mode",
        hasCopyableAddress: false,
      };
    }

    if (hasWallet && address) {
      return {
        badge: verificationNeeded ? "Needs verification" : "Wallet live",
        title: verificationNeeded ? "Wallet connected" : "Wallet verified",
        reference: truncateMiddle(address, 8, 6),
        fullReference: address,
        support: verificationNeeded
          ? "Protected actions are waiting on one signature."
          : "Protected actions and treasury flows are unlocked.",
        icon: verificationNeeded ? ShieldAlert : ShieldCheck,
        iconTone: verificationNeeded
          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"
          : "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-200",
        badgeToneNav: verificationNeeded
          ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-400/20"
          : "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-200 dark:border-green-400/20",
        badgeToneHero: verificationNeeded
          ? "bg-amber-500/15 text-amber-200 border-amber-400/20"
          : "bg-green-500/15 text-green-200 border-green-400/20",
        verificationLabel,
        chainLabel,
        detailLabel: loginMethod === "wallet" ? "Wallet sign-in" : "Wallet linked",
        hasCopyableAddress: true,
      };
    }

    if (hasAccount) {
      const socialReference = address
        ? hasEmbeddedWalletAddress
          ? truncateMiddle(address, 8, 6)
          : address.includes("@")
            ? maskEmail(address)
            : truncateMiddle(address, 10, 6)
        : "Social sign-in";

      return {
        badge: hasEmbeddedWalletAddress ? "Embedded wallet" : "Account ready",
        title: hasEmbeddedWalletAddress ? "Privy wallet ready" : "Signed in with Privy",
        reference: socialReference,
        fullReference: address || "Social sign-in active",
        support: hasEmbeddedWalletAddress
          ? "Your Privy wallet is live. Add Avalanche, Lens, or Algorand when you need protected actions."
          : "Add a wallet when you need protected actions or treasury access.",
        icon: UserRound,
        iconTone: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200",
        badgeToneNav: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-400/20",
        badgeToneHero: "bg-blue-500/15 text-blue-200 border-blue-400/20",
        verificationLabel,
        chainLabel: hasEmbeddedWalletAddress ? "Privy embedded wallet" : chainLabel,
        detailLabel: hasEmbeddedWalletAddress ? "Embedded wallet" : "Social sign-in",
        hasCopyableAddress: hasEmbeddedWalletAddress,
      };
    }

    return {
      badge: "Visitor",
      title: "Not signed in",
      reference: "Public visitor",
      fullReference: "Public visitor",
      support: "Sign in to save your season and unlock squad actions.",
      icon: Wallet,
      iconTone: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
      badgeToneNav: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:text-white/80 dark:border-white/15",
      badgeToneHero: "bg-white/10 text-white/80 border-white/15",
      verificationLabel,
      chainLabel,
      detailLabel: "No account",
      hasCopyableAddress: false,
    };
  }, [address, authStatus.state, chain, hasAccount, hasEmbeddedWalletAddress, hasWallet, isGuest, loginMethod]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const copyAddress = async () => {
    if (!summary.hasCopyableAddress || !address) {
      return;
    }

    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
    router.push("/");
  };

  const triggerClasses =
    variant === "hero"
      ? "border-white/15 bg-black/25 text-white shadow-2xl shadow-black/20 hover:bg-black/35"
      : "border-gray-200 bg-white/90 text-gray-900 shadow-sm hover:bg-white dark:border-gray-700 dark:bg-gray-900/90 dark:text-white dark:hover:bg-gray-900";

  const panelClasses =
    variant === "hero"
      ? "border-white/15 bg-gray-950/95 text-white shadow-2xl shadow-black/40"
      : "border-gray-200 bg-white text-gray-900 shadow-2xl dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  const Icon = summary.icon;
  const showMenu = hasAccount || hasWallet || isGuest;
  const badgeTone = variant === "hero" ? summary.badgeToneHero : summary.badgeToneNav;

  if (!showMenu) {
    return null;
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`group inline-flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition-all duration-200 ${triggerClasses} ${
          compact ? "h-10 w-10 justify-center px-0 py-0" : ""
        }`}
      >
        <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${summary.iconTone}`}>
          <Icon className="h-4 w-4" />
          {!isGuest && (
            <span className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 ${
              variant === "hero" ? "border-gray-950 bg-green-400" : "border-white bg-green-500 dark:border-gray-900"
            }`} />
          )}
        </span>

        {!compact && (
          <span className="min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-[0.18em] opacity-70">
              {summary.badge}
            </span>
            <span className="block max-w-[11rem] truncate text-sm font-semibold">
              {summary.reference}
            </span>
          </span>
        )}

        {!compact && <ChevronDown className={`h-4 w-4 shrink-0 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`} />}
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`absolute right-0 top-[calc(100%+0.75rem)] z-[120] w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border p-4 ${panelClasses}`}
        >
          <div className="flex items-start gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${summary.iconTone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${badgeTone}`}>
                {summary.badge}
              </span>
              <div className="mt-2 text-base font-bold">{summary.title}</div>
              <div className="mt-1 break-all font-mono text-xs opacity-80">{summary.fullReference}</div>
              <p className="mt-2 text-sm opacity-75">{summary.support}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/5 px-3 py-2 dark:bg-white/5">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] opacity-60">Mode</div>
              <div className="mt-1 text-sm font-semibold">{summary.detailLabel}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/5 px-3 py-2 dark:bg-white/5">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] opacity-60">Network</div>
              <div className="mt-1 text-sm font-semibold">{summary.chainLabel}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/5 px-3 py-2 dark:bg-white/5 sm:col-span-2">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] opacity-60">Protection</div>
              <div className="mt-1 text-sm font-semibold">{summary.verificationLabel}</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                Open dashboard
                <ChevronDown className="h-4 w-4 -rotate-90 opacity-60" />
              </Link>
            )}

            <Link
              href="/settings?tab=wallet"
              className="inline-flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              Account settings
              <Settings className="h-4 w-4 opacity-70" />
            </Link>

            {summary.hasCopyableAddress && (
              <button
                type="button"
                onClick={copyAddress}
                className="inline-flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                {copied ? "Wallet copied" : "Copy wallet address"}
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 opacity-70" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleDisconnect}
              className="inline-flex items-center justify-between rounded-xl border border-red-500/20 px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
            >
              {isGuest ? "End preview" : "Sign out"}
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
