import { deleteOrderAction } from "@/app/orders/actions";

export default function DeleteOrderForm(props: { orderId: string; redirectTo?: string }) {
  const { orderId, redirectTo } = props;

  return (
    <form action={deleteOrderAction}>
      <input type="hidden" name="orderId" value={orderId} />
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <button
        type="submit"
        className="btn btn-secondary border-red-200 text-red-600 hover:bg-red-50"
        title="Delete order"
      >
        Delete
      </button>
    </form>
  );
}
