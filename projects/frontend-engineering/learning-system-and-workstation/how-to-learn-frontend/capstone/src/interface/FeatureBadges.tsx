import type { FeatureLookup } from "../application/get-feature-statuses.js";
import type { Baseline } from "../domain/feature.js";

const LABELS: Record<Baseline, string> = {
  widely: "Widely available",
  newly: "Newly available",
  limited: "Limited availability",
  unknown: "Status unknown",
};

// The badge always shows words, so colour is never the only signal.
export function FeatureBadges({ features }: { features: FeatureLookup[] }) {
  if (features.length === 0) return null;
  return (
    <ul className="badges" aria-label="Web features mentioned in this note">
      {features.map(({ key, status }) => (
        <li key={key} className={`badge badge-${status?.baseline ?? "none"}`}>
          <code>{key}</code>:{" "}
          {status ? LABELS[status.baseline] : "not in the local data (run npm run data after adding it)"}
          {status?.interoperableDate && (
            <> since {status.maybeEarlier ? "about " : ""}{status.interoperableDate}</>
          )}
          {status?.deprecated && " (deprecated)"}
          {status?.experimental && " (experimental)"}
        </li>
      ))}
    </ul>
  );
}
