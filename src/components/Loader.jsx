import React from "react";

const Loader = ({
  message = "Loading...",
  className = "py-20",
}) => {
  return (
    <div role="status" aria-label={message || "Loading"} className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent" aria-hidden />
      {message ? <p className="text-sm font-medium text-gray-500">{message}</p> : null}
    </div>
  );
};

export default Loader;
