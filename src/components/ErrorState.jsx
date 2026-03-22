import React from "react";

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
