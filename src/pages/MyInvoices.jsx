import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, FileText, ChevronDown, ChevronUp,
  IndianRupee, CheckCircle2, Clock, AlertCircle, XCircle,
} from "lucide-react";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatCurrency } from "../utils/formatCurrency";
import { useGetMyInvoicesQuery, useGetMyInvoiceDetailQuery } from "../features/api/invoiceApi";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function monthYearLabel(m, y) {
  const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${names[m - 1]} ${y}`;
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_CONFIG = {
  draft:          { label: "Draft",          icon: Clock,         iconColor: "text-gray-400",  badge: "bg-gray-100 text-gray-600" },
  sent:           { label: "Sent",           icon: FileText,      iconColor: "text-blue-500",  badge: "bg-blue-50 text-blue-700"  },
  paid:           { label: "Paid",           icon: CheckCircle2,  iconColor: "text-green-600", badge: "bg-green-50 text-green-700"},
  partially_paid: { label: "Partial",        icon: IndianRupee,   iconColor: "text-amber-500", badge: "bg-amber-50 text-amber-700"},
  overdue:        { label: "Overdue",        icon: AlertCircle,   iconColor: "text-red-500",   badge: "bg-red-50 text-red-700"   },
  cancelled:      { label: "Cancelled",      icon: XCircle,       iconColor: "text-gray-400",  badge: "bg-gray-100 text-gray-500"},
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function InvoiceCard({ invoice }) {
  const [expanded, setExpanded] = useState(false);
  const { data, isFetching } = useGetMyInvoiceDetailQuery(invoice._id, { skip: !expanded });
  const detail = data?.invoice;

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-gray-100">
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-5 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-primary">{invoice.invoiceNumber}</span>
            <StatusBadge status={invoice.status} />
            {invoice.isEarlyBilling && (
              <span className="text-xs bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 font-semibold">Early</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {monthYearLabel(invoice.billingPeriod.month, invoice.billingPeriod.year)}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className={`text-lg font-black ${invoice.netAmountDue > 0 ? "text-red-600" : "text-green-600"}`}>
            {formatCurrency(invoice.netAmountDue)}
          </p>
          <p className="text-xs text-gray-400">{invoice.netAmountDue > 0 ? "Due" : "Settled"}</p>
        </div>

        <span className="text-gray-400 shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Quick stats strip */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-3 border-t border-gray-50">
        <div className="text-center pt-3">
          <p className="text-xs text-gray-400 font-medium">Charges</p>
          <p className="text-sm font-bold text-gray-800">{formatCurrency(invoice.totalCharges)}</p>
        </div>
        <div className="text-center pt-3 border-x border-gray-100">
          <p className="text-xs text-gray-400 font-medium">Paid</p>
          <p className="text-sm font-bold text-green-600">{formatCurrency(invoice.totalPayments)}</p>
        </div>
        <div className="text-center pt-3">
          <p className="text-xs text-gray-400 font-medium">Prev. Balance</p>
          <p className={`text-sm font-bold ${invoice.previousBalance > 0 ? "text-red-500" : "text-gray-800"}`}>
            {formatCurrency(invoice.previousBalance)}
          </p>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100">
          {isFetching ? (
            <div className="py-6 flex justify-center"><Loader /></div>
          ) : detail ? (
            <>
              {/* Product summary */}
              {detail.productSummary?.length > 0 && (
                <div className="p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Product Summary</h3>
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-sm min-w-[420px]">
                      <thead>
                        <tr className="text-left">
                          {["Product", "Qty", "Amount", "Outstanding"].map(h => (
                            <th key={h} className="pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider pr-3 last:pr-0 last:text-right">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {detail.productSummary.map((p, i) => (
                          <tr key={i}>
                            <td className="py-2 pr-3 font-medium text-gray-800">
                              {p.productName}
                              {p.variantLabel && <span className="block text-xs text-gray-400">{p.variantLabel}</span>}
                            </td>
                            <td className="py-2 pr-3 text-gray-600">{p.totalQuantity} {p.unit}</td>
                            <td className="py-2 pr-3 text-gray-800 font-semibold">{formatCurrency(p.totalAmount)}</td>
                            <td className={`py-2 text-right font-bold ${p.outstandingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                              {formatCurrency(p.outstandingAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Invoice summary */}
              <div className="mx-5 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Invoice Summary</h3>
                <div className="space-y-2 text-sm">
                  {detail.previousBalance !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Previous Balance</span>
                      <span className={`font-semibold ${detail.previousBalance > 0 ? "text-red-500" : "text-green-600"}`}>
                        {formatCurrency(detail.previousBalance)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Charges</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(detail.totalCharges)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payments Received</span>
                    <span className="font-semibold text-green-600">({formatCurrency(detail.totalPayments)})</span>
                  </div>
                  {detail.totalAdjustments !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Adjustments</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(detail.totalAdjustments)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-800">Net Amount Due</span>
                    <span className={`font-black text-base ${detail.netAmountDue > 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(detail.netAmountDue)}
                    </span>
                  </div>
                </div>
                {detail.netAmountDue <= 0 && (
                  <p className="mt-2 text-xs text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Account fully settled — thank you!
                  </p>
                )}
              </div>

              {/* Line items — collapsible */}
              {detail.lineItems?.length > 0 && (
                <LineItemsSection lineItems={detail.lineItems} />
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function LineItemsSection({ lineItems }) {
  const [show, setShow] = useState(false);
  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setShow(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold">Transaction Details ({lineItems.length} entries)</span>
        {show ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {show && (
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-xs min-w-[380px]">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-2 text-gray-400 font-bold uppercase tracking-wider pr-3">Date</th>
                <th className="pb-2 text-gray-400 font-bold uppercase tracking-wider pr-3">Description</th>
                <th className="pb-2 text-gray-400 font-bold uppercase tracking-wider pr-3 text-right">Amount</th>
                <th className="pb-2 text-gray-400 font-bold uppercase tracking-wider text-right">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lineItems.map((item, i) => (
                <tr key={i}>
                  <td className="py-2 pr-3 text-gray-500 whitespace-nowrap">{formatDate(item.date)}</td>
                  <td className="py-2 pr-3 text-gray-700">{item.description}</td>
                  <td className={`py-2 pr-3 text-right font-semibold ${item.entryType === "credit" ? "text-green-600" : "text-gray-800"}`}>
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-2 text-right">
                    <span className={`inline-block rounded px-1.5 py-0.5 font-bold text-[10px] ${item.entryType === "credit" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {item.entryType === "credit" ? "CR" : "DR"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const MyInvoices = () => {
  useDocumentTitle("My Invoices");
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  const { data, isLoading, error, refetch } = useGetMyInvoicesQuery({ year });
  const invoices = data?.invoices || [];

  const totalDue = invoices
    .filter(i => !["paid", "cancelled"].includes(i.status))
    .reduce((s, i) => s + Math.max(0, i.netAmountDue || 0), 0);

  if (isLoading) return <section className="min-h-screen bg-background py-16"><Loader /></section>;

  if (error) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <ErrorState message="Failed to load invoices" onAction={refetch} actionLabel="Retry" />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="app-shell max-w-2xl space-y-6">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          Back to Profile
        </Link>

        {/* Header */}
        <div className="surface-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">My Invoices</h1>
                <p className="text-sm text-gray-500">Monthly billing statements</p>
              </div>
            </div>

            {totalDue > 0 && (
              <div className="surface-panel px-6 py-4 rounded-2xl border border-red-100 bg-red-50/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-1">Total Outstanding</p>
                <p className="text-2xl font-black text-red-600">{formatCurrency(totalDue)}</p>
              </div>
            )}
            {totalDue <= 0 && invoices.length > 0 && (
              <div className="surface-panel px-6 py-4 rounded-2xl border border-green-100 bg-green-50/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-1">Account Status</p>
                <p className="text-lg font-black text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 size={18} /> All Settled
                </p>
              </div>
            )}
          </div>

          {/* Year filter */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Year:</span>
            <div className="flex gap-2">
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                    year === y
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice list */}
        {invoices.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-700">No invoices yet</p>
            <p className="text-sm text-gray-400 mt-1">Your monthly invoices will appear here once generated.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map(inv => (
              <InvoiceCard key={inv._id} invoice={inv} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyInvoices;
