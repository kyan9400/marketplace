export function niceLabel(s?: string | null) {
  return (s ?? "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
function chip(cls: string, text: string) {
  return <span className={"inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium " + cls}>{text}</span>;
}
export function StatusBadge({ value }: { value: string }) {
  const v = (value || "").toUpperCase(); const t = niceLabel(value);
  if (v === "PENDING")     return chip("bg-amber-50 text-amber-700 border-amber-200", t);
  if (v === "CONFIRMED")   return chip("bg-blue-50 text-blue-700 border-blue-200", t);
  if (v === "SHIPPED")     return chip("bg-indigo-50 text-indigo-700 border-indigo-200", t);
  if (v === "DELIVERED")   return chip("bg-green-50 text-green-700 border-green-200", t);
  if (v === "CANCELLED")   return chip("bg-rose-50 text-rose-700 border-rose-200", t);
  return chip("bg-gray-50 text-gray-700 border-gray-200", t);
}
export function PaymentBadge({ value }: { value: string }) {
  const v = (value || "").toUpperCase(); const t = niceLabel(value);
  if (v === "PAID")        return chip("bg-green-50 text-green-700 border-green-200", t);
  if (v === "UNPAID")      return chip("bg-gray-100 text-gray-700 border-gray-300", t);
  if (v === "PENDING")     return chip("bg-amber-50 text-amber-700 border-amber-200", t);
  if (v === "FAILED")      return chip("bg-rose-50 text-rose-700 border-rose-200", t);
  return chip("bg-gray-50 text-gray-700 border-gray-200", t);
}