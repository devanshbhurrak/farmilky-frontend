import React from "react";
import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

const NotFound = () => {
  useDocumentTitle("Page Not Found")
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <div className="surface-card max-w-md p-10 text-center">
        <p className="text-7xl font-extrabold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold text-primary">Page not found</h1>
        <p className="mt-3 text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl bg-secondary px-8 py-3 font-semibold text-white transition hover:bg-secondary/90"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
