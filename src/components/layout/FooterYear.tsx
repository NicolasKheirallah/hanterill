/**
 * The year of the current build, for the footer spec plate. Rendered on the
 * server, so it stamps when the static export was produced.
 */
export function FooterYear() {
  const year = new Date().getFullYear();
  return <time dateTime={String(year)}>{year}</time>;
}
