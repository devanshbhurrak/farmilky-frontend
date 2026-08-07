import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft, Calendar, FileText, Edit2, Repeat2, Package,
  CalendarDays, Truck, PauseCircle, PlayCircle, XCircle, ChevronRight,
  ShoppingBag, CheckCircle2, AlertCircle, Palmtree, Settings2, X, IndianRupee,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatCurrency } from "../utils/formatCurrency";
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

const getUpcomingDates = (subscription, count = 7) => {
  if (!subscription || subscription.status !== "active" || !subscription.nextDeliveryDate) return [];
  const parsed = new Date(subscription.nextDeliveryDate);
  if (isNaN(parsed.getTime())) return [];
  const results = [];
  let current = parsed;
  current.setHours(0, 0, 0, 0);
  const skipped  = new Set((subscription.skippedDates || []).map((d) => new Date(d).setHours(0,0,0,0)));
  const vacFrom  = subscription.vacationSchedule?.pauseFrom  ? new Date(subscription.vacationSchedule.pauseFrom).setHours(0,0,0,0)  : null;
  const vacUntil = subscription.vacationSchedule?.pauseUntil ? new Date(subscription.vacationSchedule.pauseUntil).setHours(0,0,0,0) : null;
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

// ── Shared UI ─────────────────────────────────────────────────────────────────

const SectionCard = ({ children, className = "" }) => (
  <div className={`overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 md:px-6">
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10">
      <Icon className="h-4 w-4 text-secondary" strokeWidth={1.75} aria-hidden />
    </div>
    <h2 className="font-bold text-gray-900 md:text-lg">{title}</h2>
  </div>
);

const inputCls = "w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20";

// ── Settings Bottom Drawer ────────────────────────────────────────────────────

const SettingsDrawer = ({
  open, onClose, subscription, unit,
  hasPendingChange, hasVacation,
  handlePause, handleResume, handleCancel,
  handleSaveEdit, handleCancelChange,
  handleScheduleChange, handleScheduleVacation, handleCancelVacation,
}) => {
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const [showEdit, setShowEdit]             = useState(false);
  const [editQty, setEditQty]               = useState(subscription.quantityPerDay);
  const [editSchedule, setEditSchedule]     = useState(subscription.deliverySchedule);
  const [editSaving, setEditSaving]         = useState(false);
  const [newChangeQty, setNewChangeQty]     = useState(1);
  const [newChangeDate, setNewChangeDate]   = useState("");
  const [vacFrom, setVacFrom]               = useState("");
  const [vacUntil, setVacUntil]             = useState("");

  const isCancelled = subscription.status === "cancelled";

  const onSaveEdit = async () => {
    setEditSaving(true);
    await handleSaveEdit(editQty, editSchedule);
    setEditSaving(false);
    setShowEdit(false);
  };

  const doConfirm = async () => {
    if (pendingConfirm === "pause")  await handlePause();
    if (pendingConfirm === "resume") await handleResume();
    if (pendingConfirm === "cancel") await handleCancel();
    setPendingConfirm(null);
    onClose();
  };

  const CONFIRM_CFG = {
    pause:  { title: "Pause deliveries?",    desc: "Your deliveries will be temporarily stopped. You can resume anytime.",        yes: "Yes, Pause",  cls: "bg-amber-500 text-white hover:bg-amber-600" },
    resume: { title: "Resume deliveries?",   desc: "Your deliveries will restart from the next scheduled date.",                  yes: "Yes, Resume", cls: "bg-green-600 text-white hover:bg-green-700" },
    cancel: { title: "Cancel subscription?", desc: "This permanently stops your subscription and cannot be undone.",              yes: "Yes, Cancel", cls: "bg-red-600 text-white hover:bg-red-700"    },
  };

  if (!open) return null;

  const cfg = pendingConfirm ? CONFIRM_CFG[pendingConfirm] : null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative w-full rounded-t-[2rem] bg-white shadow-2xl md:max-w-lg md:mb-8 md:rounded-3xl"
        style={{ maxHeight: "82vh", display: "flex", flexDirection: "column" }}
      >
        {/* Handle */}
        <div className="flex shrink-0 justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 px-5 pt-3 pb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/8">
            <Settings2 className="h-4 w-4 text-primary" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 leading-tight">Settings</h2>
            <p className="text-xs text-gray-400 truncate">{subscription.productId.name}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="mx-5 shrink-0 border-t border-gray-100" />

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-10 space-y-6">

          {/* ── Inline confirmation ── */}
          {cfg && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5">
              <p className="font-bold text-gray-900 text-base">{cfg.title}</p>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{cfg.desc}</p>
              <div className="mt-5 flex gap-2.5">
                <button onClick={doConfirm} className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${cfg.cls}`}>
                  {cfg.yes}
                </button>
                <button onClick={() => setPendingConfirm(null)} className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition">
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* ── Manage section ── */}
          {!isCancelled && !pendingConfirm && (
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Manage Subscription</p>
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white divide-y divide-gray-100">
                {subscription.status === "active" && (
                  <button onClick={() => setPendingConfirm("pause")}
                    className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left hover:bg-amber-50/60 transition">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                      <PauseCircle className="h-4 w-4 text-amber-600" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">Pause Deliveries</p>
                      <p className="text-xs text-gray-400">Temporarily stop your daily deliveries</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" strokeWidth={2} />
                  </button>
                )}
                {subscription.status === "paused" && (
                  <button onClick={() => setPendingConfirm("resume")}
                    className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left hover:bg-green-50/60 transition">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                      <PlayCircle className="h-4 w-4 text-green-600" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">Resume Deliveries</p>
                      <p className="text-xs text-gray-400">Restart deliveries from next schedule</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" strokeWidth={2} />
                  </button>
                )}
                <button onClick={() => setPendingConfirm("cancel")}
                  className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left hover:bg-red-50/60 transition">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                    <XCircle className="h-4 w-4 text-red-500" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-red-700">Cancel Subscription</p>
                    <p className="text-xs text-red-400">Permanently stop this subscription</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-red-200" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* ── Pending change notice ── */}
          {hasPendingChange && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={1.75} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-800">Scheduled Change</p>
                  <p className="text-xs text-amber-600">
                    Qty → {subscription.scheduledChange?.newQuantityPerDay} on{" "}
                    {new Date(subscription.scheduledChange?.effectiveDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
              <button onClick={handleCancelChange} className="shrink-0 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition">
                Cancel
              </button>
            </div>
          )}

          {/* ── Edit qty + schedule ── */}
          {!isCancelled && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Edit Subscription</p>
                {!showEdit && (
                  <button onClick={() => { setEditQty(subscription.quantityPerDay); setEditSchedule(subscription.deliverySchedule); setShowEdit(true); }}
                    className="flex items-center gap-1 rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary hover:bg-secondary/20 transition">
                    <Edit2 className="h-3 w-3" strokeWidth={2} />
                    Edit
                  </button>
                )}
              </div>
              {showEdit ? (
                <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-gray-500">Quantity per day</p>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setEditQty((q) => Math.max(1, q - 1))} disabled={editQty <= 1}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white font-bold text-primary transition hover:border-gray-300 disabled:opacity-40">−</button>
                      <span className="w-14 text-center text-xl font-extrabold text-gray-900">{editQty} <span className="text-sm font-normal text-gray-400">{unit}</span></span>
                      <button type="button" onClick={() => setEditQty((q) => q + 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary font-bold text-white transition hover:bg-secondary/90">+</button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-gray-500">Delivery Schedule</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ val: "daily", label: "Daily" }, { val: "alternate", label: "Alternate" }, { val: "weekly", label: "Weekly" }].map(({ val, label }) => (
                        <button key={val} type="button" onClick={() => setEditSchedule(val)}
                          className={`rounded-xl border-2 py-2 text-sm font-semibold transition ${editSchedule === val ? "border-secondary bg-secondary/5 text-secondary" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={onSaveEdit} disabled={editSaving}
                      className="flex-1 rounded-xl bg-secondary py-2.5 text-sm font-bold text-white disabled:opacity-60 transition">
                      {editSaving ? "Saving…" : "Save Changes"}
                    </button>
                    <button onClick={() => setShowEdit(false)}
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3.5">
                  <Package className="h-4 w-4 shrink-0 text-gray-300" strokeWidth={1.75} />
                  <p className="text-sm text-gray-400 flex-1">{subscription.quantityPerDay} {unit} · {subscription.deliverySchedule}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Schedule qty change ── */}
          {!isCancelled && !hasPendingChange && (
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Schedule Quantity Change</p>
              <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">New Quantity</label>
                    <input type="number" min={1} value={newChangeQty} onChange={(e) => setNewChangeQty(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">Effective From</label>
                    <input type="date" min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} value={newChangeDate}
                      onChange={(e) => setNewChangeDate(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <button onClick={() => { handleScheduleChange(newChangeQty, newChangeDate); setNewChangeQty(1); setNewChangeDate(""); }}
                  className="w-full rounded-xl bg-primary/10 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15 transition">
                  Schedule Change
                </button>
              </div>
            </div>
          )}

          {/* ── Vacation ── */}
          {!isCancelled && (
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Vacation / Pause</p>
              {hasVacation ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                      <Palmtree className="h-4 w-4 text-amber-600" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-800">Vacation Scheduled</p>
                      <p className="text-xs text-amber-700">
                        {new Date(subscription.vacationSchedule.pauseFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                        {new Date(subscription.vacationSchedule.pauseUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { handleCancelVacation(); onClose(); }}
                    className="w-full rounded-xl border border-red-100 bg-white py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition">
                    Cancel Vacation
                  </button>
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">From</label>
                      <input type="date" min={todayStr()} value={vacFrom} onChange={(e) => setVacFrom(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">Until</label>
                      <input type="date" min={vacFrom || todayStr()} value={vacUntil} onChange={(e) => setVacUntil(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <button onClick={() => { handleScheduleVacation(vacFrom, vacUntil); setVacFrom(""); setVacUntil(""); }}
                    className="w-full rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition">
                    Schedule Vacation
                  </button>
                  <p className="text-center text-xs text-gray-400">Deliveries resume automatically after your vacation ends.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body,
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────

const SubscriptionDetail = () => {
  useDocumentTitle("Subscription Details");
  const { id } = useParams();
  const { data, isLoading, error } = useGetSubscriptionByIdQuery(id);
  const { data: passbookData }     = useGetMyPassbookQuery();

  const [pauseSubscription]      = usePauseSubscriptionMutation();
  const [resumeSubscription]     = useResumeSubscriptionMutation();
  const [cancelSubscription]     = useCancelSubscriptionMutation();
  const [updateSubscription]     = useUpdateSubscriptionMutation();
  const [scheduleQuantityChange] = useScheduleQuantityChangeMutation();
  const [cancelScheduledChange]  = useCancelScheduledChangeMutation();
  const [scheduleVacation]       = useScheduleVacationMutation();
  const [cancelVacation]         = useCancelVacationMutation();
  const [skipDeliveryDate]       = useSkipDeliveryDateMutation();
  const [unskipDeliveryDate]     = useUnskipDeliveryDateMutation();

  const [activeTab, setActiveTab]       = useState("deliveries");
  const [showSettings, setShowSettings] = useState(false);

  const TABS = [
    { id: "deliveries",   label: "Deliveries"   },
    { id: "transactions", label: "Transactions" },
  ];

  const subscription  = data?.subscription;
  const ledgerEntries = passbookData?.entries || [];
  const upcomingDates = useMemo(() => getUpcomingDates(subscription), [subscription]);

  if (isLoading) return <Loader className="min-h-[60vh]" message="Loading subscription…" />;
  if (error || !subscription) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-2 text-xl font-bold text-primary">Subscription not found</h1>
          <Link to="/subscriptions" className="inline-flex rounded-2xl bg-secondary px-6 py-3 font-semibold text-white">
            Back to My Subscriptions
          </Link>
        </div>
      </section>
    );
  }

  // Handlers
  const handlePause  = async () => { try { await pauseSubscription(subscription._id).unwrap();  toast.success("Paused");    } catch { toast.error("Failed to pause.");  } };
  const handleResume = async () => { try { await resumeSubscription(subscription._id).unwrap(); toast.success("Resumed");   } catch { toast.error("Failed to resume."); } };
  const handleCancel = async () => {
    try { await cancelSubscription(subscription._id).unwrap(); toast.success("Cancelled"); } catch { toast.error("Failed to cancel."); }
  };
  const handleSaveEdit = async (qty, schedule) => {
    try { await updateSubscription({ id: subscription._id, quantityPerDay: qty, deliverySchedule: schedule }).unwrap(); toast.success("Updated"); }
    catch (err) { toast.error(err?.data?.message || "Failed to update"); throw err; }
  };
  const handleCancelChange = async () => { try { await cancelScheduledChange(subscription._id).unwrap(); toast.success("Change cancelled"); } catch { toast.error("Failed"); } };
  const handleScheduleChange = async (qty, date) => {
    if (!qty || !date) { toast.error("Enter quantity and date"); return; }
    try { await scheduleQuantityChange({ id: subscription._id, newQuantityPerDay: Number(qty), effectiveDate: date }).unwrap(); toast.success("Change scheduled"); }
    catch (err) { toast.error(err?.data?.message || "Failed"); }
  };
  const handleScheduleVacation = async (from, until) => {
    if (!from || !until) { toast.error("Select both dates"); return; }
    if (until < from)    { toast.error("End date must be after start"); return; }
    try { await scheduleVacation({ id: subscription._id, pauseFrom: from, pauseUntil: until }).unwrap(); toast.success("Vacation scheduled"); }
    catch (err) { toast.error(err?.data?.message || "Failed"); }
  };
  const handleCancelVacation = async () => { try { await cancelVacation(subscription._id).unwrap(); toast.success("Vacation cancelled"); } catch { toast.error("Failed"); } };
  const handleSkip   = async (date) => { try { await skipDeliveryDate({ id: subscription._id, date: date.toISOString() }).unwrap();   toast.success("Skipped");  } catch (err) { toast.error(err?.data?.message || "Failed"); } };
  const handleUnskip = async (date) => { try { await unskipDeliveryDate({ id: subscription._id, date: date.toISOString() }).unwrap(); toast.success("Restored"); } catch (err) { toast.error(err?.data?.message || "Failed"); } };

  const hasVacation      = subscription.vacationSchedule?.pauseFrom && subscription.vacationSchedule?.pauseUntil;
  const hasPendingChange = subscription.scheduledChange?.newQuantityPerDay != null;
  const pricePerUnit     = subscription.pricePerUnit ?? (subscription.quantityPerDay > 0 ? subscription.totalPricePerDay / subscription.quantityPerDay : 0);
  const unit             = subscription.variantUnit || subscription.productId.unit;

  const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0);
  const nextDelivery  = subscription.nextDeliveryDate
    ? (() => { const d = new Date(subscription.nextDeliveryDate); d.setHours(0,0,0,0); return d; })()
    : null;
  const isDeliveryToday = nextDelivery && nextDelivery.getTime() === todayMidnight.getTime();
  const todayHistoryEntry = (subscription.deliveryHistory || []).find((e) => {
    const d = new Date(e.deliveryDate || e.date); d.setHours(0,0,0,0);
    return d.getTime() === todayMidnight.getTime();
  });

  const statusBar   = { active: "bg-green-500", paused: "bg-amber-400", cancelled: "bg-red-400" }[subscription.status] || "bg-gray-300";
  const statusBadge = { active: "bg-green-100 text-green-700", paused: "bg-amber-100 text-amber-700", cancelled: "bg-red-100 text-red-600" }[subscription.status] || "bg-gray-100 text-gray-600";

  const scheduleLabel = subscription.deliverySchedule === "alternate" ? "Alternate Days"
    : subscription.deliverySchedule === "weekly" ? "Weekly"
    : "Daily";

  return (
    <section className="page-shell">
      <div className="app-shell max-w-2xl lg:max-w-6xl space-y-5">

        {/* Back */}
        <Link to="/subscriptions" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
          Back to My Subscriptions
        </Link>

        {/* ── Desktop: 2-column  |  Mobile: stacked ── */}
        <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-6 lg:items-start">

        {/* ═══ LEFT COLUMN — Product card (sticky on desktop) ═══ */}
        <div className="lg:sticky lg:top-6">
        <SectionCard>
          <div className={`h-1 w-full ${statusBar}`} />

          {/* ── Hero row: image + name + status + settings ── */}
          <div className="flex items-start gap-4 px-5 pt-5 pb-5">
            {/* Product image */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F5EFE4] p-2.5">
              <img
                src={subscription.productId.image}
                alt={subscription.productId.name}
                loading="lazy" decoding="async"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Name + meta */}
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="truncate text-lg font-extrabold text-gray-900 leading-tight">
                {subscription.productId.name}
              </h1>
              <p className="mt-0.5 text-xs text-gray-400">
                Since {new Date(subscription.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            {/* Status badge + Settings button stacked on right */}
            <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
              <span className={`rounded-xl px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
                {subscription.status}
              </span>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:border-gray-300 hover:bg-gray-100"
              >
                <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                Settings
              </button>
            </div>
          </div>

          {/* ── 4-col stats strip ── */}
          <div className="mx-5 grid grid-cols-2 divide-x divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50/70">
            {[
              { icon: Package,      label: "Qty / Day",      value: `${subscription.quantityPerDay} ${unit}` },
              { icon: Repeat2,      label: "Schedule",       value: scheduleLabel },
              { icon: FileText,     label: `Rate/${unit}`,   value: formatCurrency(pricePerUnit) },
              { icon: CalendarDays, label: "Daily Cost",     value: formatCurrency(subscription.totalPricePerDay) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 px-3 py-3 text-center">
                <Icon className="mb-0.5 h-3.5 w-3.5 text-gray-400" strokeWidth={1.75} aria-hidden />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="text-sm font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* ── Next delivery + Pending due ── */}
          <div className="mx-5 mt-3 grid grid-cols-2 gap-3">
            {/* Next delivery */}
            <div className="flex items-center gap-3 rounded-2xl border border-secondary/15 bg-secondary/5 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/15">
                <Truck className="h-4 w-4 text-secondary" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary/60">Next Delivery</p>
                {subscription.nextDeliveryDate ? (
                  <>
                    <p className="text-sm font-extrabold text-gray-900 leading-tight">
                      {new Date(subscription.nextDeliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(subscription.nextDeliveryDate).toLocaleDateString("en-IN", { weekday: "long" })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-extrabold text-gray-400">—</p>
                )}
              </div>
            </div>

            {/* Pending due */}
            {(() => {
              const due = subscription.pendingAmount || 0;
              const hasDue = due > 0;
              return (
                <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${hasDue ? "border-red-100 bg-red-50" : "border-green-100 bg-green-50"}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${hasDue ? "bg-red-100" : "bg-green-100"}`}>
                    <FileText className={`h-4 w-4 ${hasDue ? "text-red-500" : "text-green-600"}`} strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${hasDue ? "text-red-400" : "text-green-500"}`}>Pending Due</p>
                    <p className={`text-sm font-extrabold leading-tight ${hasDue ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(due)}
                    </p>
                    <p className={`text-[11px] ${hasDue ? "text-red-400" : "text-green-500"}`}>
                      {hasDue ? "Amount due" : "All clear"}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── Today's delivery banner ── */}
          {subscription.status === "active" && (isDeliveryToday || todayHistoryEntry) && (() => {
            const s = todayHistoryEntry?.status;
            const cfg = s === "delivered"
              ? { border: "border-green-100", bg: "bg-green-50", icon: CheckCircle2, iconBg: "bg-green-100", iconColor: "text-green-600", title: "Delivered today!", sub: `${todayHistoryEntry.actualQuantity} ${unit} delivered`, titleColor: "text-green-800" }
              : s === "failed"
              ? { border: "border-red-100",   bg: "bg-red-50",   icon: XCircle,      iconBg: "bg-red-100",   iconColor: "text-red-500",   title: "Delivery failed",         sub: todayHistoryEntry?.reason,                               titleColor: "text-red-700"   }
              : { border: "border-blue-100",  bg: "bg-blue-50",  icon: Truck,        iconBg: "bg-blue-100",  iconColor: "text-blue-500",  title: "Delivery expected today", sub: `${subscription.quantityPerDay} ${unit} scheduled`,       titleColor: "text-blue-800"  };
            return (
              <div className={`mx-5 mt-3 flex items-center gap-3 rounded-2xl border ${cfg.border} ${cfg.bg} px-4 py-3`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg}`}>
                  <cfg.icon className={`h-4 w-4 ${cfg.iconColor}`} strokeWidth={1.75} aria-hidden />
                </div>
                <div>
                  <p className={`text-sm font-bold ${cfg.titleColor}`}>{cfg.title}</p>
                  {cfg.sub && <p className={`text-xs ${cfg.iconColor}`}>{cfg.sub}</p>}
                </div>
              </div>
            );
          })()}

          {/* ── Alerts ── */}
          {hasPendingChange && (
            <div className="mx-5 mt-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={1.75} aria-hidden />
                <p className="text-sm text-amber-800">
                  Qty changes to <strong>{subscription.scheduledChange.newQuantityPerDay}</strong> on{" "}
                  {new Date(subscription.scheduledChange.effectiveDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              <button onClick={handleCancelChange} className="shrink-0 text-xs font-bold text-red-600 hover:underline">Cancel</button>
            </div>
          )}
          {hasVacation && (
            <div className="mx-5 mt-3 flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
              <Palmtree className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={1.75} aria-hidden />
              <p className="text-sm text-amber-800">
                <span className="font-bold">Vacation:</span>{" "}
                {new Date(subscription.vacationSchedule.pauseFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                {new Date(subscription.vacationSchedule.pauseUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </p>
            </div>
          )}

          {/* ── Footer action ── */}
          <div className="mx-5 mt-3 mb-5">
            <Link
              to="/order"
              className="flex items-center justify-center gap-2 rounded-2xl border border-secondary/20 bg-secondary/5 py-3 text-sm font-semibold text-secondary transition hover:bg-secondary/10"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Order Extra / One-Time Items
            </Link>
          </div>
        </SectionCard>
        </div>

        {/* ═══ RIGHT COLUMN — Tabs + content ═══ */}
        <div className="mt-5 lg:mt-0 space-y-5">

        {/* Tab bar */}
        <div className="flex gap-1 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm" role="tablist">
          {TABS.map((tab) => (
            <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition md:py-3 ${activeTab === tab.id ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-primary"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Deliveries tab ── */}
        {activeTab === "deliveries" && (
          <div className="space-y-4">
            {subscription.status === "active" && upcomingDates.length > 0 && (
              <SectionCard>
                <SectionHeader icon={Calendar} title="Upcoming Deliveries" />
                <div className="px-5 py-3 space-y-2 md:px-6 md:py-4">
                  {upcomingDates.map(({ date, skipped: isSkipped, inVacation }, idx) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dim = isSkipped || inVacation;
                    const deliveryCost = formatCurrency(subscription.totalPricePerDay);
                    return (
                      <div key={date.toISOString()}
                        className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all ${
                          isToday && !dim
                            ? "bg-secondary/5 border border-secondary/25 shadow-sm"
                            : inVacation
                            ? "bg-amber-50/60 border border-amber-100"
                            : isSkipped
                            ? "bg-red-50/40 border border-red-100"
                            : idx === 0
                            ? "bg-primary/5 border border-primary/15"
                            : "bg-gray-50/50 border border-gray-100"
                        }`}>
                        {/* Date chip */}
                        <div className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-center ${
                          isToday && !dim ? "bg-secondary text-white shadow-sm"
                          : inVacation   ? "bg-amber-100 text-amber-600"
                          : isSkipped    ? "bg-red-100 text-red-400"
                          : idx === 0    ? "bg-primary/10 text-primary"
                          : "bg-white border border-gray-200 text-gray-600"
                        }`}>
                          <span className="text-[9px] font-bold uppercase tracking-wide leading-none">
                            {date.toLocaleDateString("en-IN", { weekday: "short" })}
                          </span>
                          <span className="text-base font-extrabold leading-tight">{date.getDate()}</span>
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className={`text-sm font-semibold leading-tight ${
                              dim ? "text-gray-400 line-through decoration-gray-300" : "text-gray-800"
                            }`}>
                              {date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            </p>
                            {isToday && !dim && (
                              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">Today</span>
                            )}
                            {idx === 0 && !isToday && !dim && (
                              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary leading-none">Next</span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            {inVacation && (
                              <span className="text-[11px] font-medium text-amber-600">On vacation</span>
                            )}
                            {isSkipped && !inVacation && (
                              <span className="text-[11px] font-medium text-red-500">Skipped</span>
                            )}
                            {!dim && (
                              <span className="text-[11px] text-gray-400">
                                {subscription.quantityPerDay} {unit} · {deliveryCost}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action */}
                        {!inVacation && (
                          isSkipped ? (
                            <button
                              onClick={() => handleUnskip(date)}
                              className="shrink-0 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100 active:scale-95"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSkip(date)}
                              className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-95"
                            >
                              Skip
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            <SectionCard>
              <SectionHeader icon={CalendarDays} title="Delivery History" />
              {subscription.deliveryHistory?.length > 0 ? (
                <div className="px-5 py-3 space-y-2 md:px-6 md:py-4">
                  {[...subscription.deliveryHistory].reverse().map((log) => {
                    const s = log.status;
                    const isDelivered = s === "delivered";
                    const isFailed    = s === "failed";
                    const iconBg    = isDelivered ? "bg-green-100"  : isFailed ? "bg-red-100"  : "bg-gray-100";
                    const iconColor = isDelivered ? "text-green-600": isFailed ? "text-red-500": "text-gray-400";
                    const rowBg     = isDelivered ? "bg-green-50/30 border-green-100" : isFailed ? "bg-red-50/30 border-red-100" : "bg-gray-50/60 border-gray-100";
                    const Icon      = isDelivered ? CheckCircle2 : isFailed ? XCircle : Truck;
                    const qty = log.actualQuantity ?? log.quantityDelivered ?? log.scheduledQuantity;
                    const logDate = new Date(log.deliveryDate || log.date);
                    return (
                      <div key={String(log.deliveryDate || log.date)} className={`flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 ${rowBg}`}>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                          <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={1.75} aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800 leading-tight">
                            {logDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className={`text-[11px] font-medium capitalize ${iconColor}`}>{s}</span>
                            <span className="text-[11px] text-gray-300">·</span>
                            <span className="text-[11px] text-gray-400">{qty} {unit}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`text-sm font-bold ${isDelivered ? "text-gray-900" : isFailed ? "text-red-400 line-through" : "text-gray-500"}`}>
                            {formatCurrency(log.totalAmount)}
                          </p>
                          <p className="text-[11px] text-gray-400">{formatCurrency(log.pricePerUnit)}/{unit}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <CalendarDays className="h-8 w-8 text-gray-200" strokeWidth={1.5} aria-hidden />
                  <p className="text-sm text-gray-400">No delivery history yet</p>
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* ── Transactions tab ── */}
        {activeTab === "transactions" && (
          <div className="space-y-4 md:space-y-5">
            {/* Balance summary */}
            <SectionCard>
              <div className="flex items-center gap-4 px-5 py-5 md:px-6 md:py-6">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl md:h-14 md:w-14 ${
                  (passbookData?.user?.accountBalance || 0) > 0 ? "bg-red-100" : "bg-green-100"
                }`}>
                  <IndianRupee className={`h-5 w-5 md:h-6 md:w-6 ${
                    (passbookData?.user?.accountBalance || 0) > 0 ? "text-red-500" : "text-green-600"
                  }`} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 md:text-xs">Outstanding Balance</p>
                  <p className={`text-2xl font-extrabold leading-tight md:text-3xl ${(passbookData?.user?.accountBalance || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(passbookData?.user?.accountBalance || 0)}
                  </p>
                </div>
                <span className={`rounded-xl px-3.5 py-1.5 text-xs font-bold md:text-sm ${
                  (passbookData?.user?.accountBalance || 0) > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                }`}>
                  {(passbookData?.user?.accountBalance || 0) > 0 ? "Due" : "Clear"}
                </span>
              </div>
            </SectionCard>

            {/* Transaction list */}
            <SectionCard>
              <SectionHeader icon={FileText} title="Transactions" />
              {ledgerEntries.length > 0 ? (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-6 py-3.5 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">Date</th>
                          <th className="px-6 py-3.5 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">Description</th>
                          <th className="px-6 py-3.5 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100 text-right">Debit (−)</th>
                          <th className="px-6 py-3.5 font-bold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100 text-right">Credit (+)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {ledgerEntries.map((entry, idx) => (
                          <tr key={`dt-${entry.date}-${entry.type}-${entry.amount}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                              {new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-900">{entry.description}</p>
                              {entry.notes && <p className="text-xs text-gray-400 mt-0.5">{entry.notes}</p>}
                            </td>
                            <td className="px-6 py-4 text-right tabular-nums">
                              {entry.type === "debit"
                                ? <span className="font-bold text-red-600">{formatCurrency(entry.amount)}</span>
                                : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-6 py-4 text-right tabular-nums">
                              {entry.type === "credit"
                                ? <span className="font-bold text-green-600">{formatCurrency(entry.amount)}</span>
                                : <span className="text-gray-300">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card list */}
                  <div className="md:hidden divide-y divide-gray-100 px-2 py-1.5">
                    {ledgerEntries.map((entry, idx) => {
                      const isDebit  = entry.type === "debit";
                      const isCredit = entry.type === "credit";
                      return (
                        <div key={`mb-${entry.date}-${entry.type}-${entry.amount}-${idx}`}
                          className="flex items-center gap-3 px-3 py-3.5">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                            isDebit  ? "bg-red-100 text-red-600" :
                            isCredit ? "bg-green-100 text-green-700" :
                                       "bg-gray-100 text-gray-500"
                          }`}>
                            {isDebit ? "Dr" : isCredit ? "Cr" : "—"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-800">{entry.description}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              {entry.notes && <> · {entry.notes}</>}
                            </p>
                          </div>
                          <p className={`shrink-0 text-sm font-bold tabular-nums ${isDebit ? "text-red-500" : isCredit ? "text-green-600" : "text-gray-400"}`}>
                            {isDebit ? "−" : isCredit ? "+" : ""}{formatCurrency(entry.amount)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-14 text-center px-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <FileText className="h-7 w-7 text-gray-300" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500">No transactions yet</p>
                    <p className="mt-1 text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Your charges and payments will appear here once your first delivery is confirmed.
                    </p>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* How it works */}
            <div className="rounded-2xl border border-primary/10 bg-primary/5 px-5 py-4 md:px-6 md:py-5">
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white md:h-10 md:w-10">
                  <IndianRupee className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary">How it works</p>
                  <p className="mt-1 text-xs text-primary/70 leading-relaxed md:text-sm">
                    Deliveries are added as <strong>Debits</strong>. Payments you make are added as <strong>Credits</strong>.
                    The balance shows the net amount you owe or have in advance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        </div>{/* end right column */}
        </div>{/* end 2-column grid */}

      </div>

      {/* ── Settings bottom drawer ── */}
      <SettingsDrawer
        open={showSettings}
        onClose={() => setShowSettings(false)}
        subscription={subscription}
        unit={unit}
        hasPendingChange={hasPendingChange}
        hasVacation={hasVacation}
        handlePause={handlePause}
        handleResume={handleResume}
        handleCancel={handleCancel}
        handleSaveEdit={handleSaveEdit}
        handleCancelChange={handleCancelChange}
        handleScheduleChange={handleScheduleChange}
        handleScheduleVacation={handleScheduleVacation}
        handleCancelVacation={handleCancelVacation}
      />
    </section>
  );
};

export default SubscriptionDetail;
