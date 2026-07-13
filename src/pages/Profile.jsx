import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Plus, Trash2, User, Phone, Mail, Clock, FileText, ChevronRight, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {
  useGetUserProfileQuery,
  useUpdateProfileMutation,
} from "../features/api/authApi";

const TIME_SLOT_OPTIONS = [
  { value: "morning", label: "Morning", sub: "6 AM – 10 AM" },
  { value: "evening", label: "Evening", sub: "5 PM – 8 PM" },
  { value: "anytime", label: "Anytime", sub: "Flexible" },
];

const emptyAddress = { street: "", city: "", state: "", pincode: "", type: "home" };

const validateAddress = (addr) => {
  const errs = {};
  if (!String(addr.street || "").trim()) errs.street = "Street is required";
  if (!String(addr.city || "").trim()) errs.city = "City is required";
  if (!String(addr.state || "").trim()) errs.state = "State is required";
  const pin = String(addr.pincode || "").trim();
  if (!pin) errs.pincode = "Pincode is required";
  else if (!/^\d{6}$/.test(pin)) errs.pincode = "Must be 6 digits";
  return errs;
};

const SectionCard = ({ children, className = "" }) => (
  <div className={`overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-secondary/10">
        <Icon className="h-4.5 w-4.5 text-secondary" strokeWidth={1.75} aria-hidden />
      </div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
    {action}
  </div>
);

const FieldRow = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
    {children}
  </div>
);

const inputCls = (err) =>
  `w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-secondary/20 ${
    err ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-secondary"
  }`;

const Profile = () => {
  useDocumentTitle("My Profile");
  const { data: profileData, isLoading } = useGetUserProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();

  const profile = profileData?.user;

  const [personalForm, setPersonalForm] = useState({ name: "", phone: "" });
  const [personalDirty, setPersonalDirty] = useState(false);

  const [prefs, setPrefs] = useState({ preferredTimeSlot: "morning", defaultDeliveryNotes: "" });
  const [prefsDirty, setPrefsDirty] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState(emptyAddress);
  const [addrErrors, setAddrErrors] = useState({});
  const [editingIdx, setEditingIdx] = useState(null);

  useEffect(() => {
    if (profile) {
      setPersonalForm({ name: profile.name || "", phone: profile.phone || "" });
      setPrefs({
        preferredTimeSlot: profile.deliveryPreferences?.preferredTimeSlot || "morning",
        defaultDeliveryNotes: profile.deliveryPreferences?.defaultDeliveryNotes || "",
      });
      setAddresses(profile.addresses || []);
    }
  }, [profile]);

  const handlePersonalChange = (e) => {
    setPersonalForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPersonalDirty(true);
  };

  const handleSavePersonal = async () => {
    try {
      await updateProfile({ name: personalForm.name, phone: personalForm.phone }).unwrap();
      toast.success("Personal info updated");
      setPersonalDirty(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const handlePrefsChange = (key, value) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    setPrefsDirty(true);
  };

  const handleSavePrefs = async () => {
    try {
      await updateProfile({ deliveryPreferences: prefs }).unwrap();
      toast.success("Delivery preferences saved");
      setPrefsDirty(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const handleAddrChange = (e) => {
    const { name, value } = e.target;
    const sanitized = name === "pincode" ? value.replace(/\D/g, "").slice(0, 6) : value;
    setNewAddr((a) => ({ ...a, [name]: sanitized }));
    setAddrErrors((prev) => {
      const next = validateAddress({ ...newAddr, [name]: sanitized });
      return { ...prev, [name]: next[name] };
    });
  };

  const handleSaveAddress = async () => {
    const errs = validateAddress(newAddr);
    if (Object.keys(errs).length > 0) { setAddrErrors(errs); return; }
    const nextAddresses =
      editingIdx !== null
        ? addresses.map((a, i) => (i === editingIdx ? newAddr : a))
        : [...addresses, newAddr];
    try {
      await updateProfile({ addresses: nextAddresses }).unwrap();
      setAddresses(nextAddresses);
      toast.success(editingIdx !== null ? "Address updated" : "Address added");
      setShowAddForm(false);
      setNewAddr(emptyAddress);
      setAddrErrors({});
      setEditingIdx(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save address");
    }
  };

  const handleEditAddress = (idx) => {
    setNewAddr({ ...addresses[idx] });
    setEditingIdx(idx);
    setShowAddForm(true);
    setAddrErrors({});
  };

  const handleDeleteAddress = async (idx) => {
    if (!window.confirm("Remove this address?")) return;
    const nextAddresses = addresses.filter((_, i) => i !== idx);
    try {
      await updateProfile({ addresses: nextAddresses }).unwrap();
      setAddresses(nextAddresses);
      toast.success("Address removed");
    } catch {
      toast.error("Failed to remove address");
    }
  };

  if (isLoading) return <Loader className="min-h-[60vh]" message="Loading profile..." />;

  const balance = profile?.accountBalance || 0;
  const initials = profile?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#FDFAF6] to-white py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 space-y-6">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
          Back to home
        </Link>

        {/* Hero / Avatar card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 px-6 py-8 text-white shadow-lg shadow-primary/20">
          {/* decorative blob */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/5" aria-hidden />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" aria-hidden />

          <div className="relative flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-extrabold backdrop-blur-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-bold">{profile?.name || "—"}</p>
              <p className="truncate text-sm text-white/70">{profile?.email || "—"}</p>
              {profile?.phone && (
                <p className="mt-0.5 text-sm text-white/60">{profile.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Passbook banner */}
        <Link
          to="/passbook"
          className="flex items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10">
              <FileText className="h-5 w-5 text-secondary" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="font-bold text-gray-900">My Passbook</p>
              <p className="text-xs text-gray-400">Track billing &amp; payments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400">Balance</p>
              <p className={`text-lg font-extrabold ${balance > 0 ? "text-red-500" : "text-green-600"}`}>
                ₹{Math.abs(balance)}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" strokeWidth={2.5} aria-hidden />
          </div>
        </Link>

        {/* Personal Info */}
        <SectionCard>
          <SectionHeader icon={User} title="Personal Information" />
          <div className="space-y-4 p-6">
            <FieldRow label="Full Name">
              <input
                id="profile-name"
                type="text"
                name="name"
                value={personalForm.name}
                onChange={handlePersonalChange}
                className={inputCls(false)}
                placeholder="Your name"
              />
            </FieldRow>

            <FieldRow label="Phone">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" strokeWidth={2} aria-hidden />
                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  value={personalForm.phone}
                  onChange={handlePersonalChange}
                  maxLength={10}
                  inputMode="numeric"
                  className={`${inputCls(false)} pl-11`}
                  placeholder="10-digit mobile number"
                />
              </div>
            </FieldRow>

            <FieldRow label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" strokeWidth={2} aria-hidden />
                <input
                  id="profile-email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-gray-100 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-400"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">Email address cannot be changed</p>
            </FieldRow>

            <button
              onClick={handleSavePersonal}
              disabled={!personalDirty || saving}
              className="w-full rounded-2xl bg-secondary py-3 font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </SectionCard>

        {/* Delivery Preferences */}
        <SectionCard>
          <SectionHeader icon={Clock} title="Delivery Preferences" />
          <div className="space-y-5 p-6">
            <FieldRow label="Preferred Delivery Time">
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOT_OPTIONS.map((opt) => {
                  const active = prefs.preferredTimeSlot === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handlePrefsChange("preferredTimeSlot", opt.value)}
                      className={`flex flex-col items-center rounded-2xl border-2 px-3 py-3 text-center transition-all duration-150 ${
                        active
                          ? "border-secondary bg-secondary/5 text-secondary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-sm font-bold">{opt.label}</span>
                      <span className={`mt-0.5 text-[11px] ${active ? "text-secondary/70" : "text-gray-400"}`}>{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </FieldRow>

            <FieldRow label="Default Delivery Notes">
              <textarea
                id="profile-delivery-notes"
                value={prefs.defaultDeliveryNotes}
                onChange={(e) => handlePrefsChange("defaultDeliveryNotes", e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="e.g. Leave at the door, ring bell twice…"
                className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
              <p className={`mt-1 text-right text-xs ${
                prefs.defaultDeliveryNotes.length >= 180 ? "text-red-500" : prefs.defaultDeliveryNotes.length >= 140 ? "text-orange-400" : "text-gray-400"
              }`}>
                {prefs.defaultDeliveryNotes.length}/200
              </p>
            </FieldRow>

            <button
              onClick={handleSavePrefs}
              disabled={!prefsDirty || saving}
              className="w-full rounded-2xl bg-secondary py-3 font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {saving ? "Saving…" : "Save Preferences"}
            </button>
          </div>
        </SectionCard>

        {/* Saved Addresses */}
        <SectionCard>
          <SectionHeader
            icon={MapPin}
            title="Saved Addresses"
            action={
              !showAddForm && (
                <button
                  onClick={() => { setNewAddr(emptyAddress); setEditingIdx(null); setAddrErrors({}); setShowAddForm(true); }}
                  className="flex items-center gap-1.5 rounded-2xl bg-secondary/10 px-4 py-2 text-xs font-bold text-secondary transition hover:bg-secondary/20"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  Add
                </button>
              )
            }
          />

          <div className="p-6 space-y-3">
            {addresses.length === 0 && !showAddForm && (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 py-10 text-center">
                <MapPin className="h-8 w-8 text-gray-200" strokeWidth={1.5} aria-hidden />
                <p className="text-sm font-medium text-gray-400">No saved addresses yet</p>
                <button
                  onClick={() => { setNewAddr(emptyAddress); setEditingIdx(null); setAddrErrors({}); setShowAddForm(true); }}
                  className="mt-1 text-xs font-semibold text-secondary hover:underline"
                >
                  + Add your first address
                </button>
              </div>
            )}

            {addresses.map((addr, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
              >
                <div className="min-w-0">
                  <span className={`mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                    addr.type === "home" ? "bg-blue-50 text-blue-600" :
                    addr.type === "work" ? "bg-purple-50 text-purple-600" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {addr.type || "saved"}
                  </span>
                  <p className="text-sm font-medium text-gray-800">{addr.street}</p>
                  <p className="text-sm text-gray-500">{addr.city}, {addr.state} – {addr.pincode}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleEditAddress(idx)}
                    aria-label="Edit address"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-secondary hover:text-secondary"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(idx)}
                    aria-label="Delete address"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 bg-white text-red-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </div>
            ))}

            {showAddForm && (
              <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-5 space-y-4">
                <h3 className="font-bold text-gray-900">
                  {editingIdx !== null ? "Edit Address" : "New Address"}
                </h3>

                <FieldRow label="Street">
                  <input
                    id="addr-street"
                    type="text"
                    name="street"
                    value={newAddr.street}
                    onChange={handleAddrChange}
                    className={inputCls(addrErrors.street)}
                    placeholder="House No, Street Name"
                  />
                  {addrErrors.street && <p className="mt-1 text-xs text-red-500">{addrErrors.street}</p>}
                </FieldRow>

                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="City">
                    <input
                      id="addr-city"
                      type="text"
                      name="city"
                      value={newAddr.city}
                      onChange={handleAddrChange}
                      className={inputCls(addrErrors.city)}
                    />
                    {addrErrors.city && <p className="mt-1 text-xs text-red-500">{addrErrors.city}</p>}
                  </FieldRow>
                  <FieldRow label="Pincode">
                    <input
                      id="addr-pincode"
                      type="text"
                      name="pincode"
                      value={newAddr.pincode}
                      onChange={handleAddrChange}
                      inputMode="numeric"
                      maxLength={6}
                      className={inputCls(addrErrors.pincode)}
                    />
                    {addrErrors.pincode && <p className="mt-1 text-xs text-red-500">{addrErrors.pincode}</p>}
                  </FieldRow>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="State">
                    <input
                      id="addr-state"
                      type="text"
                      name="state"
                      value={newAddr.state}
                      onChange={handleAddrChange}
                      className={inputCls(addrErrors.state)}
                    />
                    {addrErrors.state && <p className="mt-1 text-xs text-red-500">{addrErrors.state}</p>}
                  </FieldRow>
                  <FieldRow label="Type">
                    <select
                      id="addr-type"
                      name="type"
                      value={newAddr.type}
                      onChange={handleAddrChange}
                      className={inputCls(false)}
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </FieldRow>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSaveAddress}
                    disabled={saving}
                    className="flex-1 rounded-2xl bg-secondary py-3 font-semibold text-white transition hover:bg-secondary/90 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : editingIdx !== null ? "Update" : "Add Address"}
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewAddr(emptyAddress); setAddrErrors({}); setEditingIdx(null); }}
                    className="flex-1 rounded-2xl border border-gray-200 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

      </div>
    </section>
  );
};

export default Profile;
