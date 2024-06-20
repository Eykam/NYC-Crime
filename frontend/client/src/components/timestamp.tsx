import { useEffect } from "react";
import useSearchStore from "../store/searchState";

function formatTimestamp(postTimestamp: number, pastTense?: boolean): string {
  const now = new Date();
  const postDate = new Date(postTimestamp * 1000); // Convert seconds to milliseconds

  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const differenceInMs = pastTense
    ? now.getTime() - postDate.getTime()
    : midnight.getTime() - now.getTime();
  const differenceInHours = Math.floor(differenceInMs / (1000 * 60 * 60));

  const prefix = pastTense ? "" : "in ";
  const suffix = pastTense ? " ago" : "";

  if (differenceInHours < 24) {
    if (differenceInHours < 1) {
      const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
      const plurality = differenceInMinutes > 1 ? "s" : "";

      return prefix + `${differenceInMinutes} minute` + plurality + suffix;
    }

    const plurality = differenceInHours > 1 ? "s" : "";

    return prefix + `${differenceInHours} hour` + plurality + suffix;
  } else {
    const year = postDate.getUTCFullYear();
    const month = String(postDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(postDate.getUTCDate()).padStart(2, "0");
    const hours = String(postDate.getUTCHours()).padStart(2, "0");
    const minutes = String(postDate.getUTCMinutes()).padStart(2, "0");

    return `${month}/${day}/${year} ${hours}:${minutes} UTC`;
  }
}

export default function Timestamp() {
  const { lastUpdated, fetchLastUpdated } = useSearchStore();

  useEffect(() => {
    fetchLastUpdated();
  }, []);

  return (
    <div className="flex flex-col text-xs text-white/80 p-2">
      <p className="space-x-2">
        <span className="font-semibold">Last Update:</span>
        <span className="text-white/50">
          {formatTimestamp(lastUpdated, true)}
        </span>
      </p>
      <p className="space-x-2">
        <span className="font-semibold">Next Update:</span>
        <span className="text-white/50">{formatTimestamp(lastUpdated)}</span>
      </p>
    </div>
  );
}
