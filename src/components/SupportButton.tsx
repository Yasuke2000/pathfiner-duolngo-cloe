import { SUPPORT_URL, hasSupport } from "@/lib/config";

/** A tasteful donate link. Renders nothing until SUPPORT_URL is configured. */
export function SupportButton({
  label = "♥ Support this free project",
  className = "support-link",
}: {
  label?: string;
  className?: string;
}) {
  if (!hasSupport()) return null;
  return (
    <a className={className} href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}
