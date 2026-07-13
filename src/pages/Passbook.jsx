import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, IndianRupee, History } from "lucide-react";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatCurrency } from "../utils/formatCurrency";
import { useGetMyPassbookQuery } from "../features/api/passbookApi";

const PAGE_SIZE = 10;

const Passbook = () => {
  useDocumentTitle("My Passbook")
  const { data: passbookData, isLoading, error, refetch } = useGetMyPassbookQuery();
  const [page, setPage] = useState(1);

  const ledgerEntries = passbookData?.entries || [];
  const totalPages = Math.ceil(ledgerEntries.length / PAGE_SIZE);
  const paginatedEntries = ledgerEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <section className="min-h-screen bg-background py-16"><Loader /></section>;

  if (error) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <div className="surface-card max-w-md p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold text-primary">Failed to load Passbook</h1>
          <p className="text-gray-500 mb-6">There was an error fetching your transaction history.</p>
          <button
            onClick={refetch}
            className="inline-flex rounded-xl bg-secondary px-6 py-3 font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="app-shell max-w-4xl space-y-6">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          Back to Profile
        </Link>

        <div className="surface-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <History size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">My Passbook</h1>
                <p className="text-sm text-gray-500">Unified view of your charges and payments</p>
              </div>
            </div>
            
            <div className="surface-panel px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50">
               <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Current Outstanding Balance</p>
               <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-gray-400">₹</span>
                  <span className={`text-2xl font-black ${
                    (passbookData?.user?.accountBalance ?? 0) > 0 ? "text-red-600"
                    : (passbookData?.user?.accountBalance ?? 0) < 0 ? "text-green-600"
                    : "text-gray-500"
                  }`}>
                    {Math.abs(passbookData?.user?.accountBalance ?? 0)}
                  </span>
                  <span className="text-xs font-bold text-gray-500 ml-1">
                    {(passbookData?.user?.accountBalance ?? 0) > 0 ? "Due"
                      : (passbookData?.user?.accountBalance ?? 0) < 0 ? "Advance"
                      : "Settled"}
                  </span>
               </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-5 flex items-center gap-3">
              <FileText className="h-5 w-5 text-secondary" />
              <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
            </div>

            {ledgerEntries.length > 0 ? (
              <>
              <p className="mb-2 text-right text-xs text-gray-400 sm:hidden">← Scroll to see more →</p>
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <table className="w-full min-w-[480px] text-left text-sm border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-4 sm:px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-y border-gray-100 rounded-tl-2xl">Date</th>
                      <th className="px-4 sm:px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-y border-gray-100">Description</th>
                      <th className="px-4 sm:px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-y border-gray-100 text-right">Debit (-)</th>
                      <th className="px-4 sm:px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs border-y border-gray-100 text-right rounded-tr-2xl">Credit (+)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedEntries.map((entry, idx) => (
                      <tr key={`${entry.date}-${entry.type}-${entry.amount}-${idx}`} className="group hover:bg-gray-50/30 transition-colors">
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-gray-600 whitespace-nowrap text-xs sm:text-sm">
                          {new Date(entry.date).toLocaleDateString(undefined, {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5">
                          <p className="font-semibold text-gray-900">{entry.description}</p>
                          {entry.notes && <p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p>}
                          {entry.recordedBy && <p className="text-xs text-gray-400 mt-1 italic">Recorded by {entry.recordedBy}</p>}
                        </td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                          {entry.type === 'debit' ? (
                            <span className="font-bold text-red-600 text-sm sm:text-base">{formatCurrency(entry.amount)}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                          {entry.type === 'credit' ? (
                            <span className="font-bold text-green-600 text-sm sm:text-base">{formatCurrency(entry.amount)}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            ) : (
              <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No transactions yet</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Your account activity will appear here once your first delivery is confirmed or payment is recorded.</p>
              </div>
            )}
          </div>

          <div className="mt-10 bg-primary/5 rounded-3xl p-6 border border-primary/10">
             <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary flex items-center justify-center text-white">
                  <IndianRupee size={20} />
                </div>
                <div>
                   <h4 className="font-bold text-primary mb-1">How it works</h4>
                   <p className="text-sm text-primary/70 leading-relaxed">
                     Every delivery and order is added to your balance as a <strong>Debit</strong>. 
                     Payments you make are added as a <strong>Credit</strong>. 
                     The <strong>Current Balance</strong> shows the net amount you owe or have in advance.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Passbook;
