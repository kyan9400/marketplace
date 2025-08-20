"use client";

type Props = {
  orderId: string;
  className?: string;
};

export default function DeleteOrderButton({ orderId, className }: Props) {
  function confirmDelete(e: React.MouseEvent<HTMLButtonElement>) {
    if (!confirm("Delete this order? This cannot be undone.")) {
      e.preventDefault();
    }
  }

  return (
    <form method="post" action={`/api/orders/${orderId}/delete`}>
      <button
        type="submit"
        onClick={confirmDelete}
        className={`btn btn-ghost text-red-600 hover:bg-red-50 ${className ?? ""}`}
      >
        Delete Order
      </button>
    </form>
  );
}