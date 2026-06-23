import { useEffect } from "react";

const BASE_TITLE = "Farmilky";

/**
 * Sets the browser tab title for a page.
 * Appends "| Farmilky" automatically so every page has brand context.
 *
 * Usage: useDocumentTitle("My Orders")
 *   → sets document.title to "My Orders | Farmilky"
 *
 * Pass no argument (or empty string) on the home page to use just "Farmilky".
 */
const useDocumentTitle = (pageTitle) => {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : BASE_TITLE;

    // Restore base title on unmount so stale titles don't persist
    return () => {
      document.title = BASE_TITLE;
    };
  }, [pageTitle]);
};

export default useDocumentTitle;
