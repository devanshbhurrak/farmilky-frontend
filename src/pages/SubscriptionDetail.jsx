import React, { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Calendar, FileText, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { useGetMyPassbookQuery } from "../features/api/passbookApi";
import {
  useCancelSubscriptionMutation,
  useGetSubscriptionByIdQuery,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useScheduleQuantityChangeMutation,
  useCancelScheduledChangeMutation,
  useScheduleVacationMutation,
  useCancelVacationMutation,
  useSkipDeliveryDateMutation,
  useUnskipDeliveryDateMutation,
} from "../features/api/subscriptionApi";

const todayStr = () => new Date().toISOString().split("T")[0];

// Project upcoming delivery dates client-side
const getUpcomingDates = (subscription, count = 7) => {
  if (!subscription || subscription.status !== "active") return [];
  const results = [];
  let current = new Date(subscription.nextDeliveryDate);
  current.setHours(0, 0, 0, 0);

  const skipped = new Set(
    (subscription.skippedDates || []).map((d) => new Date(d).setHours(0, 0, 0, 0))
  );
  const vacFrom = subscription.vacationSchedule?.pauseFrom
    ? new Date(subscription.vacationSchedule.pauseFrom).setHours(0, 0, 0, 0)
    : null;
  const vacUntil = subscription.vacationSchedule?.pauseUntil
    ? new Date(subscription.vacationSchedule.pauseUntil).setHours(0, 0, 0, 0)
    : null;

  let iterations = 0;
  while (results.length < count && iterations < 60) {
    iterations++;
    const ts = current.getTime();
    const inVacation = vacFrom && vacUntil && ts >= vacFrom && ts <= vacUntil;
    results.push({ date: new Date(current), skipped: skipped.has(ts), inVacation });

    const schedule = subscription.deliverySchedule;
    if (schedule === "daily") current.setDate(current.getDate() + 1);
    else if (schedule === "alternate") current.setDate(current.getDate() + 2);
    else if (schedule === "weekly") current.setDate(current.getDate() + 7);
    else current.setDate(current.getDate() + 1);
  }
  return results;
};

const SubscriptionDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetSubscriptionByIdQuery(id);
  const { data: passbookData } = useGetMyPassbookQuery();

  const [pauseSubscription] = usePauseSubscriptionMutation();
  const [resumeSubscription] = useResumeSubscriptionMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();
  const [updateSubscription] = useUpdateSubscriptionMutation();
  const [scheduleQuantityChange] = useScheduleQuantityChangeMutation();
  const [cancelScheduledChange] = useCancelScheduledChangeMutation();
  const [scheduleVacation] = useScheduleVacationMutation();
  const [cancelVacation] = useCancelVacationMutation();
  const [skipDeliveryDate] = useSkipDeliveryDateMutation();
  const [unskipDeliveryDate] = useUnskipDeliveryDateMutation();

  // Edit subscription state
  const [showEdit, setShowEdit] = useState(false);
  const [editQty, setEditQty] = useState(1);
  const [editSchedule, setEditSchedule] = useState("daily");
  const [editSaving, setEditSaving] = useState(false);

  // Scheduled change state
  const [newChangeQty, setNewChangeQty] = useState(1);
  const [newChangeDate, setNewChangeDate] = useState("");

  // Vacation state
  const [vacFrom, setVacFrom] = useState("");
  const [vacUntil, setVacUntil] = useState("");

  const subscription = data?.subscription;
  const ledgerEntries = passbookData?.entries || [];

  if (isLoading) return <section className="min-h-screen bg-background py-16"><Loader /></section>;

  if (error || !subscription) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <div className="surface-card max-w-md p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold text-primary">Subscription not found</h1>
          <Link to="/subscriptions" className="inline-flex rounded-xl bg-secondary px-6 py-3 font-semibold text-white">
            Back to My Subscriptions
          </Link>
        </div>
      </section>
    );
  }

  const upcomingDates = getUpcomingDates(subscription);

  const handlePause = async () => {
    await pauseSubscription(subscription._id).unwrap();
    toast.success("Subscription paused");
  };
  const handleResume = async () => {
    await resumeSubscription(subscription._id).unwrap();
    toast.success("Subscription resumed");
  };
  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) return;
    await cancelSubscription(subscription._id).unwrap();
    toast.success("Subscription cancelled");
  };

  const handleOpenEdit = () => {
    setEditQty(subscription.quantityPerDay);
    setEditSchedule(subscription.deliverySchedule);
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    setEditSaving(true);
    try {
      await updateSubscription({
        id: subscription._id,
        quantityPerDay: editQty,
        deliverySchedule: editSchedule,
      }).unwrap();
      toast.success("Subscription updated");
      setShowEdit(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update");
    } finally {
      setEditSaving(false);
    }
  };

  const handleScheduleChange = async () => {
    if (!newChangeQty || !newChangeDate) {
      toast.error("Please enter quantity and effective date");
      return;
    }
    try {
      await scheduleQuantityChange({
        id: subscription._id,
        newQuantityPerDay: Number(newChangeQty),
        effectiveDate: newChangeDate,
      }).unwrap();
      toast.success("Quantity change scheduled");
      setNewChangeQty(1);
      setNewChangeDate("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to schedule change");
    }
  };

  const handleCancelChange = async () => {
    try {
      await cancelScheduledChange(subscription._id).unwrap();
      toast.success("Scheduled change cancelled");
    } catch (err) {
      toast.error("Failed to cancel scheduled change");
    }
  };

  const handleScheduleVacation = async () => {
    if (!vacFrom || !vacUntil) {
      toast.error("Please select both dates");
      return;
    }
    try {
      await scheduleVacation({ id: subscription._id, pauseFrom: vacFrom, pauseUntil: vacUntil }).unwrap();
      toast.success("Vacation scheduled");
      setVacFrom("");
      setVacUntil("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to schedule vacation");
    }
  };

  const handleCancelVacation = async () => {
    try {
      await cancelVacation(subscription._id).unwrap();
      toast.success("Vacation cancelled");
    } catch (err) {
      toast.error("Failed to cancel vacation");
    }
  };

  const handleSkip = async (date) => {
    try {
      await skipDeliveryDate({ id: subscription._id, date: date.toISOString() }).unwrap();
      toast.success("Delivery skipped for " + date.toLocaleDateString());
    } catch (err) {
      toast.error(err?.data?.message || "Failed to skip date");
    }
  };

  const handleUnskip = async (date) => {
    try {
      await unskipDeliveryDate({ id: subscription._id, date: date.toISOString() }).unwrap();
      toast.success("Date restored");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to restore date");
    }
  };

  const hasVacation =
    subscription.vacationSchedule?.pauseFrom && subscription.vacationSchedule?.pauseUntil;
  const hasPendingChange =
    subscription.scheduledChange?.newQuantityPerDay != null;

  // Today's delivery status
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const nextDelivery = subscription.nextDeliveryDate
    ? (() => { const d = new Date(subscription.nextDeliveryDate); d.setHours(0, 0, 0, 0); return d; })()
    : null;
  const isDeliveryToday = nextDelivery && nextDelivery.getTime() === todayMidnight.getTime();
  const todayHistoryEntry = (subscription.deliveryHistory || []).find((e) => {
    const d = new Date(e.deliveryDate || e.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === todayMidnight.getTime();
  });

  return (
    <section className="page-shell">
      <div className="app-shell max-w-6xl space-y-6">
        <Link to="/subscriptions" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          Back to My Subscriptions
        </Link>

        {/* Header card */}
        <div className="surface-card p-5 sm:p-8">
          <div className="flex flex-row items-start justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="surface-panel flex h-14 w-14 shrink-0 items-center justify-center p-2 sm:h-20 sm:w-20 sm:p-3">
                <img src={subscription.productId.image} alt={subscription.productId.name} className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="mb-1 hidden text-xs font-semibold uppercase tracking-wide text-secondary md:block">Subscription Details</p>
                <h1 className="hidden text-lg font-bold text-primary sm:text-2xl md:block">{subscription.productId.name}</h1>
                <p className="mt-1 hidden text-gray-500 md:block">Started on {new Date(subscription.startDate).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={`inline-flex h-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              subscription.status === "active" ? "bg-green-100 text-green-700"
              : subscription.status === "paused" ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
            }`}>
              {subscription.status}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Quantity", value: `${subscription.quantityPerDay} ${subscription.productId.unit}` },
              { label: "Schedule", value: subscription.deliverySchedule === "alternate" ? "Alternate Days" : subscription.deliverySchedule.charAt(0).toUpperCase() + subscription.deliverySchedule.slice(1) },
              { label: "Daily Cost", value: `Rs. ${subscription.totalPricePerDay}` },
              { label: "Total Balance", value: `Rs. ${passbookData?.user?.accountBalance || 0}`, red: (passbookData?.user?.accountBalance || 0) > 0 },
            ].map((item) => (
              <div key={item.label} className="surface-panel p-4">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className={`mt-1 font-semibold ${item.red ? "text-red-600" : "text-gray-800"}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {hasPendingChange && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm text-amber-800">
                Quantity changes to <strong>{subscription.scheduledChange.newQuantityPerDay}</strong> on{" "}
                {new Date(subscription.scheduledChange.effectiveDate).toLocaleDateString()}
              </p>
              <button onClick={handleCancelChange} className="text-xs font-semibold text-red-600 hover:underline">
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Today's delivery status */}
        {subscription.status === "active" && (isDeliveryToday || todayHistoryEntry) && (
          <div className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${
            todayHistoryEntry?.status === "delivered"
              ? "border-green-200 bg-green-50"
              : todayHistoryEntry?.status === "failed"
              ? "border-red-200 bg-red-50"
              : "border-blue-200 bg-blue-50"
          }`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
              todayHistoryEntry?.status === "delivered"
                ? "bg-green-100 text-green-700"
                : todayHistoryEntry?.status === "failed"
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-700"
            }`}>
              {todayHistoryEntry?.status === "delivered" ? "✓" : todayHistoryEntry?.status === "failed" ? "✗" : "🚚"}
            </div>
            <div>
              <p className={`font-semibold ${
                todayHistoryEntry?.status === "delivered" ? "text-green-800"
                : todayHistoryEntry?.status === "failed" ? "text-red-700"
                : "text-blue-800"
              }`}>
                {todayHistoryEntry?.status === "delivered"
                  ? "Delivered today!"
                  : todayHistoryEntry?.status === "failed"
                  ? "Delivery attempted but failed"
                  : "Delivery expected today"}
              </p>
              {todayHistoryEntry?.status === "delivered" && todayHistoryEntry?.actualQuantity && (
                <p className="text-sm text-green-700">
                  {todayHistoryEntry.actualQuantity} {subscription.productId.unit} delivered
                </p>
              )}
              {todayHistoryEntry?.reason && (
                <p className="text-sm text-red-600">{todayHistoryEntry.reason}</p>
              )}
              {!todayHistoryEntry && isDeliveryToday && (
                <p className="text-sm text-blue-600">
                  {subscription.quantityPerDay} {subscription.productId.unit} scheduled
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Upcoming deliveries / skip-a-day */}
            {subscription.status === "active" && (
              <div className="surface-card p-6 sm:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <Calendar className="h-6 w-6 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
                  <h2 className="text-2xl font-bold text-primary">Upcoming Deliveries</h2>
                </div>
                <div className="space-y-2">
                  {upcomingDates.map(({ date, skipped: isSkipped, inVacation }, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                      <div>
                        <p className={`font-medium ${isSkipped || inVacation ? "text-gray-400 line-through" : "text-gray-800"}`}>
                          {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                        {inVacation && <p className="text-xs text-amber-600">On vacation</p>}
                        {isSkipped && !inVacation && <p className="text-xs text-red-500">Skipped</p>}
                      </div>
                      {!inVacation && (
                        isSkipped ? (
                          <button
                            onClick={() => handleUnskip(date)}
                            className="rounded-lg border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSkip(date)}
                            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            Skip
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery history */}
            <div className="surface-card p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <Calendar className="h-6 w-6 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
                <h2 className="text-2xl font-bold text-primary">Delivery History</h2>
              </div>
              <div className="surface-panel mb-6 p-4">
                <p className="text-sm text-gray-500">Next Delivery</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {new Date(subscription.nextDeliveryDate).toLocaleDateString(undefined, {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              <div className="space-y-4">
                {subscription.deliveryHistory?.length > 0 ? (
                  [...subscription.deliveryHistory].reverse().map((log, idx) => (
                    <div key={idx} className="flex flex-col gap-2 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {new Date(log.deliveryDate || log.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {log.actualQuantity ?? log.quantityDelivered ?? log.scheduledQuantity} unit(s) — {log.status}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-primary">Rs. {log.totalAmount}</p>
                        <p className="text-sm text-gray-500">Rate: Rs. {log.pricePerUnit}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="surface-panel p-6 text-center text-gray-500">No delivery history yet.</div>
                )}
              </div>
            </div>

            {/* Transaction Ledger */}
            <div className="surface-card p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <FileText className="h-6 w-6 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
                <h2 className="text-2xl font-bold text-primary">Transaction Ledger</h2>
              </div>
              <div className="space-y-3">
                {ledgerEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-bold uppercase text-gray-500">
                          <th className="px-2 py-3">Date</th>
                          <th className="px-2 py-3">Description</th>
                          <th className="px-2 py-3 text-right">Debit</th>
                          <th className="px-2 py-3 text-right">Credit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {ledgerEntries.map((entry, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-2 py-4 text-gray-600 whitespace-nowrap">
                              {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-2 py-4">
                              <p className="font-medium text-gray-900">{entry.description}</p>
                              {entry.notes && <p className="text-xs text-gray-500 line-clamp-1">{entry.notes}</p>}
                            </td>
                            <td className="px-2 py-4 text-right">
                              {entry.type === 'debit' ? (
                                <span className="font-semibold text-red-600">-Rs. {entry.amount}</span>
                              ) : "—"}
                            </td>
                            <td className="px-2 py-4 text-right">
                              {entry.type === 'credit' ? (
                                <span className="font-semibold text-green-600">+Rs. {entry.amount}</span>
                              ) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="surface-panel p-6 text-center text-gray-500">No transactions recorded yet.</div>
                )}
              </div>
              <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between">
                   <span className="text-sm text-gray-500">Current Outstanding Balance</span>
                   <strong className={`text-lg ${passbookData?.user?.accountBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                      Rs. {passbookData?.user?.accountBalance || 0}
                   </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6">
            {/* Edit subscription */}
            {subscription.status !== "cancelled" && (
              <div className="surface-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-primary">Edit Subscription</h2>
                  <button onClick={handleOpenEdit} className="flex items-center gap-1 text-sm font-semibold text-secondary hover:underline">
                    <Edit2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    Edit
                  </button>
                </div>
                {showEdit ? (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-600">Quantity</p>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setEditQty((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 font-bold text-primary">-</button>
                        <span className="w-10 text-center font-bold text-gray-800">{editQty}</span>
                        <button type="button" onClick={() => setEditQty((q) => q + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-bold text-white">+</button>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-600">Schedule</p>
                      {["daily", "alternate", "weekly"].map((s) => (
                        <button key={s} type="button" onClick={() => setEditSchedule(s)}
                          className={`mb-2 w-full rounded-xl border-2 px-3 py-2 text-sm font-semibold capitalize transition ${editSchedule === s ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-600"}`}
                        >
                          {s === "alternate" ? "Alternate Days" : s === "weekly" ? "Once a Week" : "Every Day"}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} disabled={editSaving} className="flex-1 rounded-xl bg-secondary py-2.5 font-semibold text-white transition disabled:opacity-60">
                        {editSaving ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setShowEdit(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 font-semibold text-gray-600">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Change quantity or schedule for upcoming deliveries.</p>
                )}
              </div>
            )}

            {/* Schedule quantity change */}
            {subscription.status !== "cancelled" && !hasPendingChange && (
              <div className="surface-card p-6">
                <h2 className="mb-4 text-xl font-bold text-primary">Schedule Qty Change</h2>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">New Quantity</label>
                    <input type="number" min={1} value={newChangeQty} onChange={(e) => setNewChangeQty(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-secondary focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Effective From</label>
                    <input type="date" min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} value={newChangeDate}
                      onChange={(e) => setNewChangeDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-secondary focus:outline-none" />
                  </div>
                  <button onClick={handleScheduleChange} className="w-full rounded-xl bg-primary/10 py-2.5 font-semibold text-primary transition hover:bg-primary/15">
                    Schedule Change
                  </button>
                </div>
              </div>
            )}

            {/* Vacation scheduling */}
            {subscription.status !== "cancelled" && (
              <div className="surface-card p-6">
                <h2 className="mb-4 text-xl font-bold text-primary">Vacation / Pause</h2>
                {hasVacation ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      <p className="font-semibold">Vacation Scheduled</p>
                      <p className="mt-1">
                        {new Date(subscription.vacationSchedule.pauseFrom).toLocaleDateString()} —{" "}
                        {new Date(subscription.vacationSchedule.pauseUntil).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={handleCancelVacation} className="w-full rounded-xl border border-red-100 bg-red-50 py-2.5 font-semibold text-red-600 transition hover:bg-red-100">
                      Cancel Vacation
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">From</label>
                      <input type="date" min={todayStr()} value={vacFrom} onChange={(e) => setVacFrom(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-secondary focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">Until</label>
                      <input type="date" min={vacFrom || todayStr()} value={vacUntil} onChange={(e) => setVacUntil(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-secondary focus:outline-none" />
                    </div>
                    <button onClick={handleScheduleVacation} className="w-full rounded-xl border border-amber-200 bg-amber-50 py-2.5 font-semibold text-amber-700 transition hover:bg-amber-100">
                      Schedule Vacation
                    </button>
                    <p className="text-xs text-gray-400">Deliveries will resume automatically after your vacation ends.</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="surface-card p-6">
              <h2 className="mb-4 text-xl font-bold text-primary">Actions</h2>
              <div className="grid gap-3">
                {subscription.status === "active" && (
                  <button onClick={handlePause} className="rounded-xl border border-orange-100 bg-orange-50 py-3 font-semibold text-orange-600">
                    Pause Delivery
                  </button>
                )}
                {subscription.status === "paused" && (
                  <button onClick={handleResume} className="rounded-xl border border-green-100 bg-green-50 py-3 font-semibold text-green-600">
                    Resume Delivery
                  </button>
                )}
                {subscription.status !== "cancelled" && (
                  <button onClick={handleCancel} className="rounded-xl border border-red-100 bg-red-50 py-3 font-semibold text-red-600">
                    Cancel Subscription
                  </button>
                )}
                <Link to="/order" className="rounded-xl bg-secondary py-3 text-center font-semibold text-white">
                  Order Extra / One-Time Items
                </Link>
                <p className="text-center text-xs text-gray-400">Need extra for a day? Place a one-time order.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionDetail;
