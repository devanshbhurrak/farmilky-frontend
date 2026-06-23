import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useCreateComplaintMutation } from "../features/api/complaintApi";

const RELATED_TO_OPTIONS = [
  { value: "order", label: "Order" },
  { value: "subscription", label: "Subscription" },
  { value: "delivery", label: "Delivery" },
  { value: "product", label: "Product Quality" },
  { value: "other", label: "Other" },
];

const RaiseComplaint = () => {
  useDocumentTitle("Raise a Complaint")
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [createComplaint, { isLoading }] = useCreateComplaintMutation();

  const [form, setForm] = useState({
    relatedTo: searchParams.get("relatedTo") || "order",
    referenceId: searchParams.get("referenceId") || "",
    subject: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Subject and description are required.");
      return;
    }
    try {
      const payload = {
        relatedTo: form.relatedTo,
        subject: form.subject.trim(),
        description: form.description.trim(),
      };
      if (form.referenceId) payload.referenceId = form.referenceId;
      await createComplaint(payload).unwrap();
      toast.success("Complaint submitted. We'll get back to you soon.");
      navigate("/my-complaints");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit complaint.");
    }
  };

  return (
    <section className="page-shell">
      <div className="app-shell max-w-2xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back
        </button>

        <div className="surface-card p-6 sm:p-8">
          <h1 className="mb-1 hidden text-xl font-bold text-primary md:block">Raise a Complaint</h1>
          <p className="mb-6 hidden text-sm text-gray-500 md:block">
            Tell us what went wrong and we'll resolve it as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-500">
                Related To
              </label>
              <div className="flex flex-wrap gap-2">
                {RELATED_TO_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, relatedTo: opt.value }))}
                    className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all ${
                      form.relatedTo === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-500">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                maxLength={200}
                placeholder="Brief description of the issue"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 transition focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-500">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={2000}
                rows={5}
                placeholder="Describe the issue in detail..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-800 transition focus:border-secondary focus:outline-none"
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {form.description.length}/2000
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-secondary py-4 text-lg font-bold text-white transition-all disabled:opacity-70"
            >
              {isLoading ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RaiseComplaint;
