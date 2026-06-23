import React from "react";

const ErrorIllustration = () => (
  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
    <circle cx="48" cy="48" r="40" fill="#fff4ea" stroke="#f97a00" strokeWidth="2.5" />
    <rect x="44" y="24" width="8" height="30" rx="4" fill="#f97a00" />
    <circle cx="48" cy="68" r="5" fill="#f97a00" />
  </svg>
);

const ErrorState = ({
  title = "Something went wrong",
  message = "Please try again.",
  actionLabel = "Try Again",
  onAction,
  className = "min-h-[60vh]",
}) => {
  return (
    <section className={`flex items-center justify-center bg-background px-4 ${className}`}>
      <div className="surface-card w-full max-w-md p-8 text-center">
        <div className="mb-5 flex justify-center">
          <ErrorIllustration />
        </div>
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        <p className="mt-3 text-gray-600">{message}</p>
        {onAction ? (
          <button
            onClick={onAction}
            className="mt-6 rounded-xl bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-secondary/90"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
};

export default ErrorState;
