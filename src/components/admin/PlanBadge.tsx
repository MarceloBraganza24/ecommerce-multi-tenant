"use client";

type Props = {
  plan: "free" | "pro";
};

export function PlanBadge({ plan }: Props) {
  if (plan === "pro") {
    return (
      <span className="ml-2 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white">
        PRO
      </span>
    );
  }

  return (
    <span className="ml-2 rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
      FREE
    </span>
  );
}