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
          background: "#f5f5f3",
          color: "#111111",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          gap: "0.75rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.2em", color: "#92928e" }}>
          ERROR 404
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 500, margin: 0 }}>No route to that page.</h1>
        <p style={{ color: "#686866", maxWidth: "22rem" }}>
          The address did not resolve.{" "}
          <Link href="/en" style={{ color: "#3557e0" }}>
            Back to home
          </Link>
          .
        </p>
      </body>
    </html>
  );
}
