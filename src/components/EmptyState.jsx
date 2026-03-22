import React from "react";
import { Link } from "react-router-dom";

const EmptyState = ({
  title,
  message,
  actionLabel,
  actionTo,
  icon,
  className = "",
}) => {
  return (
    <section className={`page-shell flex items-center justify-center px-4 ${className}`}>
      <div className="surface-card w-full max-w-md p-10 text-center sm:p-12">
        {icon ? <div className="mb-6 flex justify-center">{icon}</div> : null}
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        <p className="mt-3 text-gray-600">{message}</p>
        {actionLabel && actionTo ? (
          <Link
            to={actionTo}
            className="mt-8 inline-flex rounded-xl bg-secondary px-8 py-3 font-semibold text-white transition hover:bg-secondary/90"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
};

export default EmptyState;
