import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Plus, Trash2, User, Phone, Mail, Clock, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {
  useGetUserProfileQuery,
  useUpdateProfileMutation,
} from "../features/api/authApi";

const TIME_SLOT_OPTIONS = [
  { value: "morning", label: "Morning (6 AM – 10 AM)" },
  { value: "evening", label: "Evening (5 PM – 8 PM)" },
  { value: "anytime", label: "Anytime" },
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

const Profile = () => {
  useDocumentTitle("My Profile")
  const { data: profileData, isLoading } = useGetUserProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();

  const profile = profileData?.user;

  // Personal info
  const [personalForm, setPersonalForm] = useState({ name: "", phone: "" });
  const [personalDirty, setPersonalDirty] = useState(false);

  // Delivery preferences
  const [prefs, setPrefs] = useState({ preferredTimeSlot: "morning", defaultDeliveryNotes: "" });
  const [prefsDirty, setPrefsDirty] = useState(false);

  // Addresses
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
    if (Object.keys(errs).length > 0) {
      setAddrErrors(errs);
      return;
    }
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
    } catch (err) {
      toast.error("Failed to remove address");
    }
  };

  if (isLoading) return <Loader className="min-h-[60vh]" message="Loading profile..." />;

  return (
    <section className="page-shell">
      <div className="app-shell max-w-3xl space-y-6">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            Back to home
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-primary">My Profile</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage your account details and delivery preferences</p>
        </div>

        {/* Personal Info */}
        <div className="surface-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <User className="h-5 w-5 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
            <h2 className="text-xl font-bold text-primary">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">Full Name</label>
              <input
                type="text"
                name="name"
                value={personalForm.name}
                onChange={handlePersonalChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                <Phone className="mr-1 inline h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={personalForm.phone}
                onChange={handlePersonalChange}
                maxLength={10}
                inputMode="numeric"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                <Mail className="mr-1 inline h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
            </div>

            <button
              onClick={handleSavePersonal}
              disabled={!personalDirty || saving}
              className="mt-2 rounded-xl bg-secondary px-6 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Financial Overview / Passbook Link */}
        <div className="surface-card p-6 sm:p-8 border-2 border-primary/10 bg-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">My Passbook</h3>
                <p className="text-sm text-primary/60">Track your billing and payments</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-primary/10 pt-4 sm:pt-0">
               <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-1">Current Balance</p>
                  <p className={`text-2xl font-black ${ (profile?.accountBalance || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
                    ₹{Math.abs(profile?.accountBalance || 0)}
                  </p>
               </div>
               <Link 
                to="/passbook" 
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-md hover:bg-primary-dark transition-all"
               >
                View Ledger
               </Link>
            </div>
          </div>
        </div>

        {/* Delivery Preferences */}
        <div className="surface-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Clock className="h-5 w-5 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
            <h2 className="text-xl font-bold text-primary">Delivery Preferences</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Preferred Delivery Time
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {TIME_SLOT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handlePrefsChange("preferredTimeSlot", opt.value)}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                      prefs.preferredTimeSlot === opt.value
                        ? "border-secondary bg-secondary/5 text-secondary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                <FileText className="mr-1 inline h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Default Delivery Notes
              </label>
              <textarea
                value={prefs.defaultDeliveryNotes}
                onChange={(e) => handlePrefsChange("defaultDeliveryNotes", e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="e.g. Leave at the door, ring bell twice..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm transition focus:border-secondary focus:outline-none"
              />
              <p className={`mt-1 text-right text-xs transition-colors ${
                prefs.defaultDeliveryNotes.length >= 180 ? "text-red-500" : prefs.defaultDeliveryNotes.length >= 140 ? "text-orange-400" : "text-gray-400"
              }`}>
                {prefs.defaultDeliveryNotes.length}/200
              </p>
            </div>

            <button
              onClick={handleSavePrefs}
              disabled={!prefsDirty || saving}
              className="rounded-xl bg-secondary px-6 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="surface-card p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-secondary" strokeWidth={1.75} aria-hidden />
              <h2 className="text-xl font-bold text-primary">Saved Addresses</h2>
            </div>
            {!showAddForm && (
              <button
                onClick={() => {
                  setNewAddr(emptyAddress);
                  setEditingIdx(null);
                  setAddrErrors({});
                  setShowAddForm(true);
                }}
                className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
                Add Address
              </button>
            )}
          </div>

          <div className="space-y-3">
            {addresses.length === 0 && !showAddForm && (
              <p className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                No saved addresses yet.
              </p>
            )}

            {addresses.map((addr, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4"
              >
                <div className="min-w-0">
                  <span className="mb-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-500">
                    {addr.type || "saved"}
                  </span>
                  <p className="text-sm text-gray-800">
                    {addr.street}, {addr.city}
                  </p>
                  <p className="text-sm text-gray-500">
                    {addr.state} – {addr.pincode}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleEditAddress(idx)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(idx)}
                    className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </div>
            ))}

            {showAddForm && (
              <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-5 space-y-4">
                <h3 className="font-semibold text-primary">
                  {editingIdx !== null ? "Edit Address" : "New Address"}
                </h3>

                <div>
                  <label className="mb-1 block text-sm text-gray-600">Street</label>
                  <input
                    type="text"
                    name="street"
                    value={newAddr.street}
                    onChange={handleAddrChange}
                    className={`w-full rounded-xl border px-4 py-3 transition focus:border-secondary focus:outline-none ${addrErrors.street ? "border-red-400" : "border-gray-300"}`}
                    placeholder="House No, Street Name"
                  />
                  {addrErrors.street && <p className="mt-1 text-xs text-red-500">{addrErrors.street}</p>}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">City</label>
                    <input
                      type="text"
                      name="city"
                      value={newAddr.city}
                      onChange={handleAddrChange}
                      className={`w-full rounded-xl border px-4 py-3 transition focus:border-secondary focus:outline-none ${addrErrors.city ? "border-red-400" : "border-gray-300"}`}
                    />
                    {addrErrors.city && <p className="mt-1 text-xs text-red-500">{addrErrors.city}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={newAddr.pincode}
                      onChange={handleAddrChange}
                      inputMode="numeric"
                      maxLength={6}
                      className={`w-full rounded-xl border px-4 py-3 transition focus:border-secondary focus:outline-none ${addrErrors.pincode ? "border-red-400" : "border-gray-300"}`}
                    />
                    {addrErrors.pincode && <p className="mt-1 text-xs text-red-500">{addrErrors.pincode}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">State</label>
                    <input
                      type="text"
                      name="state"
                      value={newAddr.state}
                      onChange={handleAddrChange}
                      className={`w-full rounded-xl border px-4 py-3 transition focus:border-secondary focus:outline-none ${addrErrors.state ? "border-red-400" : "border-gray-300"}`}
                    />
                    {addrErrors.state && <p className="mt-1 text-xs text-red-500">{addrErrors.state}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Type</label>
                    <select
                      name="type"
                      value={newAddr.type}
                      onChange={handleAddrChange}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition focus:border-secondary focus:outline-none"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveAddress}
                    disabled={saving}
                    className="rounded-xl bg-secondary px-5 py-2.5 font-semibold text-white transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : editingIdx !== null ? "Update" : "Add"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewAddr(emptyAddress);
                      setAddrErrors({});
                      setEditingIdx(null);
                    }}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
