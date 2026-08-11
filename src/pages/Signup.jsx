import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  User,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useRegisterUserMutation } from "../features/api/authApi";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ─── constants ───────────────────────────────────────────────────────────────

const ACCURACY_TARGET_M = 30;
const MAX_WAIT_MS = 15000;
const DEFAULT_LAT = 23.1815;
const DEFAULT_LNG = 79.9864;
const DEFAULT_ZOOM = 13;
const GPS_ZOOM = 17;

const TILE_LAYERS = {
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
    overlayUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
  },
  street: {
    label: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    overlayUrl: null,
  },
};

// ─── helpers ────────────────────────────────────────────────────────────────

const getPasswordStrength = (password) => {
  if (!password) return null;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  if (password.length < 6) return { level: 1, label: "Weak", color: "bg-red-400" };
  if (password.length < 10 && score < 2) return { level: 2, label: "Fair", color: "bg-amber-400" };
  if (password.length >= 8 && score >= 2) return { level: 3, label: "Strong", color: "bg-green-500" };
  return { level: 2, label: "Fair", color: "bg-amber-400" };
};

const INITIAL_ACCOUNT = { name: "", email: "", phone: "", password: "" };
const INITIAL_ADDRESS = { street: "", city: "", state: "", pincode: "", lat: null, lng: null };

// ─── MapPicker ───────────────────────────────────────────────────────────────

const MapPicker = ({ lat, lng, onPick }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const baseTileRef = useRef(null);
  const overlayTileRef = useRef(null);
  const [viewMode, setViewMode] = useState("satellite");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const hasGps = lat != null && lng != null;
    const centre = [hasGps ? lat : DEFAULT_LAT, hasGps ? lng : DEFAULT_LNG];
    const zoom = hasGps ? GPS_ZOOM : DEFAULT_ZOOM;
    const tileDef = TILE_LAYERS.satellite;

    const map = L.map(containerRef.current, {
      center: centre,
      zoom,
      zoomControl: true,
      scrollWheelZoom: false, // prevent accidental zoom on mobile scroll
      tap: true,
    });

    const base = L.tileLayer(tileDef.url, {
      attribution: tileDef.attribution,
      maxZoom: tileDef.maxZoom,
    }).addTo(map);

    const overlay = tileDef.overlayUrl
      ? L.tileLayer(tileDef.overlayUrl, { maxZoom: tileDef.maxZoom, opacity: 0.9 }).addTo(map)
      : null;

    const marker = L.marker(centre, { draggable: true }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onPick(pos.lat, pos.lng);
    });

    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      onPick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
    baseTileRef.current = base;
    overlayTileRef.current = overlay;

    setTimeout(() => map.invalidateSize(), 80);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      baseTileRef.current = null;
      overlayTileRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap tile layers on toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const tileDef = TILE_LAYERS[viewMode];
    if (baseTileRef.current) map.removeLayer(baseTileRef.current);
    if (overlayTileRef.current) map.removeLayer(overlayTileRef.current);
    const base = L.tileLayer(tileDef.url, {
      attribution: tileDef.attribution,
      maxZoom: tileDef.maxZoom,
    }).addTo(map);
    const overlay = tileDef.overlayUrl
      ? L.tileLayer(tileDef.overlayUrl, { maxZoom: tileDef.maxZoom, opacity: 0.9 }).addTo(map)
      : null;
    if (markerRef.current) { markerRef.current.remove(); markerRef.current.addTo(map); }
    baseTileRef.current = base;
    overlayTileRef.current = overlay;
  }, [viewMode]);

  // Pan/zoom to GPS fix when it arrives
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || lat == null || lng == null) return;
    const pos = [lat, lng];
    markerRef.current.setLatLng(pos);
    mapRef.current.setView(pos, GPS_ZOOM, { animate: true });
  }, [lat, lng]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-md">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-gray-900 px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs text-white/70">
          <MapPin className="h-3 w-3 shrink-0 text-secondary" />
          <span>Drag pin or tap map to set your exact location</span>
        </div>
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-white/15 text-xs font-medium">
          {Object.entries(TILE_LAYERS).map(([key, def]) => (
            <button
              key={key}
              type="button"
              onClick={() => setViewMode(key)}
              className={`px-2.5 py-1 transition-colors ${
                viewMode === key ? "bg-secondary text-white" : "text-white/60 hover:bg-white/10"
              }`}
            >
              {def.label}
            </button>
          ))}
        </div>
      </div>
      {/* Map canvas — taller on larger screens */}
      <div ref={containerRef} className="h-52 sm:h-64 md:h-72" />
    </div>
  );
};

// ─── Maps link helpers ───────────────────────────────────────────────────────

const SHORT_URL_RE = /goo\.gl|maps\.app\.goo\.gl/;

/**
 * Try to extract {lat, lng} from any Google Maps URL variant:
 *   /@lat,lng            share/embed links
 *   ?q=lat,lng           simple query links
 *   ?ll=lat,lng          older format
 *   !3dlat!4dlng         encoded path segments
 */
const extractCoordsFromUrl = (url) => {
  let m;

  // /@lat,lng  (most common: share and embed links)
  m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };

  // ?q=lat,lng  or  &q=lat,lng
  m = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };

  // ?ll=lat,lng
  m = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };

  // !3dlat!4dlng  (encoded places URL)
  m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };

  return null;
};

const BACKEND = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

/** Resolve a short goo.gl / maps.app.goo.gl link via the backend proxy */
const resolveShortUrl = async (url) => {
  const res = await fetch(`${BACKEND}/api/utils/resolve-maps-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Could not resolve link.");
  }
  const data = await res.json();
  return data.resolvedUrl;
};

// ─── MapsLinkExtractor ───────────────────────────────────────────────────────

const MapsLinkExtractor = ({ onExtract }) => {
  const [open, setOpen] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleExtract = async () => {
    const raw = linkInput.trim();
    if (!raw) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      let urlToparse = raw;

      // Short links must be resolved server-side first
      if (SHORT_URL_RE.test(raw)) {
        urlToparse = await resolveShortUrl(raw);
      }

      const coords = extractCoordsFromUrl(urlToparse);
      if (!coords) {
        setStatus("error");
        setErrorMsg("Couldn't find coordinates in this link. Try sharing the location again from Google Maps.");
        return;
      }

      await onExtract(coords.lat, coords.lng);
      setStatus("idle");
      setLinkInput("");
      setOpen(false);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try the full Google Maps URL.");
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setStatus("idle"); setErrorMsg(""); }}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-600 transition-colors hover:text-gray-800"
      >
        <Link2 className="h-4 w-4 shrink-0 text-secondary" strokeWidth={2} />
        <span className="flex-1 font-medium">Paste a Google Maps link instead</span>
        <span className={`text-xs text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-gray-200 px-4 pb-4 pt-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Open Google Maps, long-press your location, tap <strong>Share</strong>, and paste the link below.
            Works with short links (<code className="rounded bg-gray-200 px-1">maps.app.goo.gl</code>) too.
          </p>

          <div className="flex gap-2">
            <input
              type="url"
              value={linkInput}
              onChange={(e) => { setLinkInput(e.target.value); setStatus("idle"); setErrorMsg(""); }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleExtract())}
              placeholder="https://maps.app.goo.gl/..."
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/15"
            />
            <button
              type="button"
              onClick={handleExtract}
              disabled={!linkInput.trim() || status === "loading"}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <MapPin className="h-4 w-4" strokeWidth={2} />
              )}
              {status === "loading" ? "Extracting…" : "Extract"}
            </button>
          </div>

          {status === "error" && (
            <p className="flex items-start gap-1.5 text-xs text-red-500">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {errorMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── AuthInput ───────────────────────────────────────────────────────────────

const AuthInput = ({ icon, label, id, rightAddon, error, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <div
      className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-sm transition-all duration-200 focus-within:ring-2 ${
        error
          ? "border-red-400 focus-within:border-red-400 focus-within:ring-red-100"
          : "border-gray-200 focus-within:border-secondary focus-within:ring-secondary/15 hover:border-gray-300"
      }`}
    >
      <span className={`shrink-0 transition-colors ${error ? "text-red-400" : "text-gray-400"}`} aria-hidden>
        {icon}
      </span>
      <input
        id={id}
        {...props}
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none focus-visible:outline-none"
      />
      {rightAddon}
    </div>
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ─── StepIndicator ───────────────────────────────────────────────────────────

const StepIndicator = ({ step }) => (
  <div className="flex items-center gap-0">
    {/* Step 1 */}
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
          step === 1
            ? "bg-secondary text-white shadow-lg shadow-secondary/30"
            : "bg-green-500 text-white shadow-md shadow-green-500/30"
        }`}
      >
        {step > 1 ? <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} /> : "1"}
      </div>
      <span className={`text-[10px] font-semibold tracking-wide uppercase transition-colors ${step === 1 ? "text-secondary" : "text-green-600"}`}>
        Account
      </span>
    </div>

    {/* Connector */}
    <div className="mx-2 mb-4 flex-1">
      <div className="relative h-0.5 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-green-400 transition-all duration-500 ease-out ${
            step >= 2 ? "w-full" : "w-0"
          }`}
        />
      </div>
    </div>

    {/* Step 2 */}
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
          step === 2
            ? "bg-secondary text-white shadow-lg shadow-secondary/30"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        2
      </div>
      <span className={`text-[10px] font-semibold tracking-wide uppercase transition-colors ${step === 2 ? "text-secondary" : "text-gray-400"}`}>
        Location
      </span>
    </div>
  </div>
);

// ─── GpsRequestingView ───────────────────────────────────────────────────────

const GpsRequestingView = () => (
  <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50 to-white px-6 py-10 text-center">
    {/* Pulsing GPS rings */}
    <div className="relative flex h-16 w-16 items-center justify-center">
      <div className="absolute inset-0 animate-ping rounded-full bg-secondary/20" style={{ animationDuration: "1.5s" }} />
      <div className="absolute inset-2 animate-ping rounded-full bg-secondary/15" style={{ animationDuration: "1.5s", animationDelay: "0.3s" }} />
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
        <Navigation className="h-5 w-5 text-secondary" strokeWidth={2} />
      </div>
    </div>
    <div>
      <p className="font-semibold text-gray-800">Locking onto your location…</p>
      <p className="mt-1 text-sm text-gray-500">
        Allow location access when prompted.
        <br />
        GPS accuracy improves over a few seconds.
      </p>
    </div>
  </div>
);

// ─── main component ──────────────────────────────────────────────────────────

const SignupPage = () => {
  useDocumentTitle("Create Account");
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = location.state?.from
    ? `${location.state.from.pathname || ""}${location.state.from.search || ""}`
    : "/";

  const [registerUser, { data, error, isLoading, isSuccess }] = useRegisterUserMutation();

  const [account, setAccount] = useState(INITIAL_ACCOUNT);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [address, setAddress] = useState(INITIAL_ADDRESS);
  const [addrErrors, setAddrErrors] = useState({});
  const [geoState, setGeoState] = useState("idle");
  const [step, setStep] = useState(1);

  // Tracks mount state to prevent setState calls after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const showAddressForm = ["success", "denied", "error", "manual"].includes(geoState);
  const showMap = ["success", "denied", "error"].includes(geoState);

  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data.message || "Account created!");
      navigate(redirectTo, { replace: true });
    }
    if (error) {
      toast.error(error?.data?.message || "Sign-up failed. Please try again.");
    }
  }, [isSuccess, data, error, navigate, redirectTo]);

  // ── step 1 ────────────────────────────────────────────────────────────────

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    const sanitized = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setAccount((prev) => ({ ...prev, [name]: sanitized }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!account.name.trim()) errs.name = "Name is required";
    if (account.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!account.phone) errs.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(account.phone)) errs.phone = "Enter a valid 10-digit Indian mobile number";
    if (!account.password) errs.password = "Password is required";
    else if (account.password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  // ── step 2 ────────────────────────────────────────────────────────────────

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const applyGeoResult = (geo, lat, lng) => {
    if (geo) {
      const a = geo.address || {};
      setAddress({
        street: [a.road, a.neighbourhood, a.suburb].filter(Boolean).join(", ") || "",
        city: a.city || a.town || a.village || a.county || a.state_district || "",
        state: a.state || "",
        pincode: a.postcode || "",
        lat,
        lng,
      });
    } else {
      setAddress((prev) => ({ ...prev, lat, lng }));
    }
  };

  const handleMapPick = async (lat, lng) => {
    const geo = await reverseGeocode(lat, lng);
    applyGeoResult(geo, lat, lng);
  };

  // Called by MapsLinkExtractor after parsing coords from a pasted link.
  // Transitions manual → success so the map becomes visible and centred.
  const handleMapsLinkExtract = async (lat, lng) => {
    const geo = await reverseGeocode(lat, lng);
    applyGeoResult(geo, lat, lng);
    setGeoState("success");
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setGeoState("manual");
      return;
    }
    setGeoState("requesting");

    let watchId = null;
    let bestPosition = null;
    let settled = false;

    const commit = async (pos) => {
      if (settled) return;
      settled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      clearTimeout(deadline);
      const { latitude: lat, longitude: lng } = pos.coords;
      const geo = await reverseGeocode(lat, lng);
      if (!mountedRef.current) return;
      applyGeoResult(geo, lat, lng);
      if (!geo) toast("Address couldn't be auto-filled — drag the pin to your exact location.", { icon: "ℹ️" });
      setGeoState("success");
    };

    const deadline = setTimeout(() => {
      if (settled) return;
      if (bestPosition) { commit(bestPosition); return; }
      settled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      setGeoState("error");
    }, MAX_WAIT_MS);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) bestPosition = pos;
        if (pos.coords.accuracy <= ACCURACY_TARGET_M) commit(pos);
      },
      (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(deadline);
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        setGeoState(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: MAX_WAIT_MS, maximumAge: 0 }
    );
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    const sanitized = name === "pincode" ? value.replace(/\D/g, "").slice(0, 6) : value;
    setAddress((prev) => ({ ...prev, [name]: sanitized }));
    if (addrErrors[name]) setAddrErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const buildPayload = (includeAddress) => {
    const { name, phone, password, email } = account;
    const payload = { name, phone, password };
    if (email && email.trim()) payload.email = email.trim();
    if (includeAddress) {
      const hasAny = address.street || address.city || address.state || address.pincode;
      if (hasAny || address.lat != null) {
        payload.address = {
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode ? Number(address.pincode) : undefined,
          lat: address.lat,
          lng: address.lng,
          type: "home",
        };
      }
    }
    return payload;
  };

  const handleSubmitWithAddress = (e) => {
    e.preventDefault();
    const errs = {};
    if (address.pincode && !/^\d{6}$/.test(address.pincode)) errs.pincode = "Must be 6 digits";
    if (Object.keys(errs).length) { setAddrErrors(errs); return; }
    registerUser(buildPayload(true));
  };

  const handleSkip = () => {
    if (isLoading) return;
    registerUser(buildPayload(false));
  };

  // ─── render ───────────────────────────────────────────────────────────────

  const strength = getPasswordStrength(account.password);

  return (
    // items-start keeps the card pinned to the top on mobile (avoids centering
    // a tall step-2 card, which would cause it to overflow off-screen)
    <div className="page-shell flex items-start justify-center px-3 pt-4 pb-10 sm:items-center sm:px-4 sm:py-8">
      <div className="surface-card w-full max-w-md space-y-5 p-5 sm:space-y-6 sm:p-8">

        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          Back to home
        </Link>

        {/* Step indicator */}
        <StepIndicator step={step} />

        {/* ════════════════ STEP 1 ════════════════ */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                Create Your Account
              </h1>
              <p className="text-sm text-gray-500">
                Join Farmilky for fresh dairy delivered to your door.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleNext} noValidate>
              <AuthInput
                id="signup-name"
                label="Full Name"
                icon={<User className="h-4.5 w-4.5" strokeWidth={1.75} />}
                name="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                value={account.name}
                onChange={handleAccountChange}
                error={errors.name}
              />
              <AuthInput
                id="signup-phone"
                label="Phone Number"
                icon={<Phone className="h-4.5 w-4.5" strokeWidth={1.75} />}
                name="phone"
                type="tel"
                placeholder="10-digit mobile number"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                value={account.phone}
                onChange={handleAccountChange}
                error={errors.phone}
              />
              <AuthInput
                id="signup-email"
                label="Email Address (optional)"
                icon={<Mail className="h-4.5 w-4.5" strokeWidth={1.75} />}
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={account.email}
                onChange={handleAccountChange}
                error={errors.email}
              />

              <div className="space-y-2">
                <AuthInput
                  id="signup-password"
                  label="Password"
                  icon={<Lock className="h-4.5 w-4.5" strokeWidth={1.75} />}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  value={account.password}
                  onChange={handleAccountChange}
                  error={errors.password}
                  rightAddon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword
                        ? <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                        : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                    </button>
                  }
                />
                {strength && (
                  <div className="space-y-1 px-0.5">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            n <= strength.level ? strength.color : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Password strength:{" "}
                      <span className={`font-semibold ${strength.level === 3 ? "text-green-600" : strength.level === 2 ? "text-amber-600" : "text-red-500"}`}>
                        {strength.label}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-secondary/25 transition-all duration-200 hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/30 active:scale-[0.98]"
              >
                Continue
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                state={location.state}
                className="font-semibold text-primary hover:text-secondary"
              >
                Login
              </Link>
            </p>
          </div>
        )}

        {/* ════════════════ STEP 2 ════════════════ */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
                  Pin Your Location
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">
                  Helps us deliver right to your door.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                disabled={isLoading}
                className="shrink-0 rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 disabled:pointer-events-none disabled:opacity-40"
              >
                Skip
              </button>
            </div>

            {/* ── Idle ── */}
            {geoState === "idle" && (
              <div className="overflow-hidden rounded-2xl border border-dashed border-secondary/30 bg-gradient-to-br from-secondary/5 via-white to-primary/5">
                <div className="flex flex-col items-center px-5 py-7 text-center sm:px-8">
                  {/* Animated GPS icon */}
                  <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-secondary/10" />
                    <div className="absolute inset-2 rounded-full bg-secondary/10" />
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary/15">
                      <MapPin className="h-5 w-5 text-secondary" strokeWidth={2} />
                    </div>
                  </div>
                  <p className="mb-1 font-semibold text-gray-800">Set your delivery location</p>
                  <p className="mb-5 max-w-xs text-sm text-gray-500 leading-relaxed">
                    We'll centre the map on your GPS position, then you can drag the pin to your exact door.
                  </p>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-secondary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-secondary/25 transition-all hover:bg-secondary/90 hover:shadow-lg active:scale-[0.98]"
                  >
                    <Navigation className="h-4 w-4" strokeWidth={2} />
                    Use my current location
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeoState("manual")}
                    className="mt-3 text-sm text-gray-400 underline-offset-2 transition-colors hover:text-gray-600 hover:underline"
                  >
                    Enter address manually instead
                  </button>
                </div>
              </div>
            )}

            {/* ── Requesting ── */}
            {geoState === "requesting" && <GpsRequestingView />}

            {/* ── Status banners ── */}
            {geoState === "success" && (
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                <p className="text-green-800 font-medium">
                  Location found! Drag the pin to your exact door if needed.
                </p>
              </div>
            )}
            {geoState === "denied" && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="font-semibold text-amber-800">Location access denied</p>
                  <p className="text-amber-700">Drag the map pin to your location or fill in the form below.</p>
                </div>
              </div>
            )}
            {geoState === "error" && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="font-semibold text-amber-800">Couldn't detect location</p>
                  <p className="text-amber-700">Drag the map pin or fill in your address below.</p>
                </div>
              </div>
            )}

            {/* ── Map ── */}
            {showMap && (
              <MapPicker lat={address.lat} lng={address.lng} onPick={handleMapPick} />
            )}

            {/* ── Address form ── */}
            {showAddressForm && (
              <form className="space-y-4" onSubmit={handleSubmitWithAddress} noValidate>
                {/* Coordinates chip */}
                {address.lat != null && address.lng != null && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs text-secondary">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="font-mono font-medium">
                      {address.lat.toFixed(5)}, {address.lng.toFixed(5)}
                    </span>
                  </div>
                )}

                {/* Address fields */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Street / Locality</label>
                    <input
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      placeholder="House no., street, locality"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition-all hover:border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/15"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">City / Town</label>
                      <input
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition-all hover:border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/15"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        placeholder="State"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition-all hover:border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/15"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input
                      name="pincode"
                      value={address.pincode}
                      onChange={handleAddressChange}
                      placeholder="6-digit pincode"
                      inputMode="numeric"
                      maxLength={6}
                      className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition-all hover:border-gray-300 focus:ring-2 ${
                        addrErrors.pincode
                          ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-secondary focus:ring-secondary/15"
                      }`}
                    />
                    {addrErrors.pincode && (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {addrErrors.pincode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Google Maps link extractor */}
                <MapsLinkExtractor onExtract={handleMapsLinkExtract} />

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex min-h-[48px] flex-[2] items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-secondary/25 transition-all hover:bg-secondary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                        Creating account…
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Back button on idle state (form has its own) */}
            {geoState === "idle" && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
