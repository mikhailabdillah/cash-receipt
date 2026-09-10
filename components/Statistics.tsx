"use client";

import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { useMemo } from "react";
import type { Debt } from "@/types";

export default function Statistics({ initialDebts }: { initialDebts: Debt[] }) {
  const totalOwedToMe = useMemo(
    () =>
      initialDebts
        .filter((d) => d.type === "owed_to_me" && !d.settled_at)
        .reduce((sum, d) => sum + d.amount, 0),
    [initialDebts]
  );

  const totalIOwe = useMemo(
    () =>
      initialDebts
        .filter((d) => d.type === "i_owe" && !d.settled_at)
        .reduce((sum, d) => sum + d.amount, 0),
    [initialDebts]
  );

  const netAmount = totalOwedToMe - totalIOwe;

  const isNetPositive = netAmount > 0;
  const isNetNegative = netAmount < 0;

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      currency: "IDR",
      style: "currency",
    }).format(amount);
  }

  return (
    <div className="mt-8 mb-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
      {/* 1. Total dihutang ke saya */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Total Dihutang ke Saya
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
        </div>
        <div className="font-extrabold text-2xl text-emerald-600 tracking-tight sm:text-3xl">
          {formatRupiah(totalOwedToMe)}
        </div>
        <p className="mt-1 text-slate-500 text-xs">
          Uang kamu yang dipinjam orang lain
        </p>
      </div>

      {/* 2. Total saya hutang */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Total Saya Hutang
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
        <div className="font-extrabold text-2xl text-rose-600 tracking-tight sm:text-3xl">
          {formatRupiah(totalIOwe)}
        </div>
        <p className="mt-1 text-slate-500 text-xs">
          Uang yang wajib kamu bayar kembali
        </p>
      </div>

      {/* 3. Net */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Saldo Net (Selisih)
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isNetPositive
                ? "bg-emerald-50 text-emerald-600"
                : // biome-ignore lint/style/noNestedTernary: <>
                  isNetNegative
                  ? "bg-rose-50 text-rose-600"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            <Scale className="h-5 w-5" />
          </div>
        </div>
        <div
          className={`font-extrabold text-2xl tracking-tight sm:text-3xl ${
            isNetPositive
              ? "text-emerald-600"
              : // biome-ignore lint/style/noNestedTernary: <>
                isNetNegative
                ? "text-rose-600"
                : "text-slate-700"
          }`}
        >
          {netAmount >= 0
            ? formatRupiah(netAmount)
            : `-${formatRupiah(Math.abs(netAmount))}`}
        </div>
        <p className="mt-1 text-slate-500 text-xs">
          {isNetPositive
            ? "Surplus (piutang lebih besar)"
            : // biome-ignore lint/style/noNestedTernary: <>
              isNetNegative
              ? "Defisit (utang lebih besar)"
              : "Seimbang (utang & piutang sama)"}
        </p>
      </div>
    </div>
  );
}
