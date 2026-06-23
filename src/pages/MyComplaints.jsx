import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Plus } from "lucide-react";
import { useGetMyComplaintsQuery } from "../features/api/complaintApi";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import useDocumentTitle from "../hooks/useDocumentTitle";

const PAGE_SIZE = 8;

const STATUS_STYLES = {
  open: "bg-yellow-50 text-yellow-700",
  in_progress: "bg-blue-50 text-blue-700",
  resolved: "bg-green-50 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const MyComplaints = () => {
  useDocumentTitle("My Complaints")
  const { data, isLoading } = useGetMyComplaintsQuery();
  const [page, setPage] = useState(1);
  const complaints = data?.complaints ?? [];
  const totalPages = Math.ceil(complaints.length / PAGE_SIZE);
  const paginatedComplaints = complaints.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) {
    return (
      <section className="min-h-screen bg-background py-16">
        <Loader />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="app-shell max-w-4xl">
        <div className="mb-4 flex items-center justify-end gap-3 md:mb-6 md:justify-between">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-primary">My Complaints</h1>
            <p className="mt-0.5 text-sm text-gray-500">Track the status of issues you've raised</p>
          </div>
          <Link
            to="/raise-complaint"
            className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 font-semibold text-white shadow-md shadow-secondary/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Raise New
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="surface-card flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
              <MessageSquare className="h-8 w-8 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-semibold text-gray-700">No complaints raised yet</p>
            <p className="max-w-sm text-gray-500">
              If you have an issue with an order or delivery, let us know and we'll resolve it quickly.
            </p>
            <Link
              to="/raise-complaint"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 font-semibold text-white"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Raise a Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedComplaints.map((c) => (
              <div key={c._id} className="surface-card p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[c.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium capitalize text-gray-600">
                        {c.relatedTo}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-gray-800">{c.subject}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{c.description}</p>
                    {c.resolution && (
                      <div className="mt-3 rounded-xl bg-green-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Resolution</p>
                        <p className="mt-0.5 text-sm text-green-800">{c.resolution}</p>
                      </div>
                    )}
                  </div>
                  <p className="shrink-0 text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </section>
  );
};

export default MyComplaints;
