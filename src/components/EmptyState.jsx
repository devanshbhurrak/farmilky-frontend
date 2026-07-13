import React from "react";
import { Link } from "react-router-dom";

const EmptyIllustration = () => (
  <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
    <rect x="18" y="42" width="84" height="48" rx="8" fill="#e8f4e9" stroke="#386641" strokeWidth="2" />
    <path d="M18 42 L18 28 L102 28 L102 42" stroke="#386641" strokeWidth="2" fill="none" />
    <path d="M18 28 L12 10 L108 10 L102 28" stroke="#386641" strokeWidth="2" fill="#c8e6cd" />
    <line x1="38" y1="60" x2="82" y2="60" stroke="#386641" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3" opacity="0.45" />
    <line x1="46" y1="72" x2="74" y2="72" stroke="#386641" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3" opacity="0.45" />
  </svg>
);

const EmptyState = ({
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
  icon,
  className = "",
}) => {
  return (
    <section className={`flex items-center justify-center px-4 ${className}`}>
      <div className="surface-card w-full max-w-md p-10 text-center sm:p-12">
        <div className="mb-6 flex justify-center">
          {icon ?? <EmptyIllustration />}
        </div>
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        <p className="mt-3 text-gray-600">{message}</p>
        {actionLabel && actionTo ? (
          <Link
            to={actionTo}
            className="mt-8 inline-flex min-h-12 items-center rounded-2xl bg-secondary px-8 py-3 font-semibold text-white transition hover:bg-secondary/90"
          >
            {actionLabel}
          </Link>
        ) : actionLabel && onAction ? (
          <button
            onClick={onAction}
            className="mt-8 inline-flex min-h-12 items-center rounded-2xl bg-secondary px-8 py-3 font-semibold text-white transition hover:bg-secondary/90"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
};

export default EmptyState;
