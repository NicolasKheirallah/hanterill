import Link from "next/link";
import "./globals.css";

// Rendered for paths outside any locale segment, so it carries its own shell.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
          gap: "0.75rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Error 404
        </p>
        <h1
          style={{
            fontFamily: "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
            fontSize: "2rem",
            fontWeight: 500,
            letterSpacing: "-0.022em",
            margin: 0,
          }}
        >
          No route to that page.
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "24rem" }}>
          The address did not resolve.{" "}
          <Link href="/en" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            Back to home
          </Link>
          .
        </p>
      </body>
    </html>
  );
}
