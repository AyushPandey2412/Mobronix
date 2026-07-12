// "use client";

// import { CheckCircle2, Clock, BadgeCheck } from "lucide-react";
// import { Badge } from "@/components/ui/Badge";
// import { MiniStepper } from "@/components/ui/Stepper";
// import { TRACK_STEPS, TRACK_SHORT } from "@/lib/data";
// import { fmt } from "@/lib/utils";

// interface OrderLike {
//   id:           string;
//   display_id?:  string;   // ENQ-00001 — shown to customer and admin
//   model:        string;
//   storage:      string;
//   amount:       number | null;   // null when hidden (public lookup by ENQ number)
//   step:         number;
//   mobile?:      string;   // seller contact (shown to the customer on their own order)
// }

// function StatusChip({ step }: { step: number }) {
//   if (step >= TRACK_STEPS.length - 1) {
//     return (
//       <Badge intent="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
//         Completed
//       </Badge>
//     );
//   }
//   if (TRACK_STEPS[step] === "Price Confirmed") {
//     return (
//       <Badge intent="warning" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
//         Price Confirmed
//       </Badge>
//     );
//   }
//   return (
//     <Badge intent="info" icon={<Clock className="h-3.5 w-3.5" />}>
//       In Progress · {TRACK_STEPS[step]}
//     </Badge>
//   );
// }

// export function OrderCard({ order }: { order: OrderLike }) {
//   // Prefer display_id (ENQ-00001) — fall back to local id (ENQ73210) for
//   // demo mode where Supabase hasn't assigned one yet.
//   const displayRef = order.display_id ?? order.id;

//   return (
//     <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
//       <div className="flex items-center gap-3 border-b border-border p-4">
//         <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 font-bold text-brand">
//           iP
//         </span>
//         <div className="min-w-0 flex-1">
//           <h4 className="truncate text-body-md font-bold text-text-primary">
//             {order.model} · {order.storage}
//           </h4>
//           <p className="text-caption text-text-tertiary">Order {displayRef}</p>
//           <div className="mt-1.5">
//             <StatusChip step={order.step} />
//           </div>
//         </div>
//         {order.amount != null && (
//           <span className="font-mono text-body-md font-extrabold text-text-primary">{fmt(order.amount)}</span>
//         )}
//       </div>

//       <div className="px-3 pb-4">
//         <MiniStepper steps={TRACK_STEPS} shortLabels={TRACK_SHORT} current={order.step} />
//       </div>

//       <div className="flex items-center justify-between bg-neutral-50 px-4 py-2.5 text-caption text-text-tertiary">
//         <span>Order number</span>
//         <b className="font-mono text-text-primary">{displayRef}</b>
//       </div>

//       {order.mobile && (
//         <div className="flex items-center justify-between border-t border-border bg-neutral-50 px-4 py-2.5 text-caption text-text-tertiary">
//           <span>Contact number</span>
//           <b className="font-mono text-text-primary">+91 {order.mobile}</b>
//         </div>
//       )}
//     </div>
//   );
// }


import { CheckCircle2, Clock, BadgeCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MiniStepper } from "@/components/ui/Stepper";
import { TRACK_STEPS, TRACK_SHORT } from "@/lib/data";
import { fmt } from "@/lib/utils";

interface OrderLike {
  id:           string;
  display_id?:  string;
  model:        string;
  storage:      string;
  amount:       number | null;
  step:         number;
  mobile?:      string;
}

function StatusChip({ step }: { step: number }) {
  if (TRACK_STEPS[step] === "Completed") {
    return (
      <Badge intent="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
        Completed
      </Badge>
    );
  }
  if (TRACK_STEPS[step] === "Cancelled") {
    return (
      <Badge intent="neutral" icon={<X className="h-3.5 w-3.5" />}>
        Cancelled
      </Badge>
    );
  }
  if (TRACK_STEPS[step] === "Price Confirmed") {
    return (
      <Badge intent="warning" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
        Price Confirmed
      </Badge>
    );
  }
  return (
    <Badge intent="info" icon={<Clock className="h-3.5 w-3.5" />}>
      In Progress · {TRACK_STEPS[step]}
    </Badge>
  );
}

export function OrderCard({ order }: { order: OrderLike }) {
  const displayRef = order.display_id ?? order.id;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 font-bold text-brand">
          iP
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-body-md font-bold text-text-primary">
            {order.model} · {order.storage}
          </h4>
          <p className="text-caption text-text-tertiary">Order {displayRef}</p>
          <div className="mt-1.5">
            <StatusChip step={order.step} />
          </div>
        </div>
        {order.amount != null && (
          <span className="font-mono text-body-md font-extrabold text-text-primary">{fmt(order.amount)}</span>
        )}
      </div>
      <div className="px-3 pb-4">
        <MiniStepper steps={TRACK_STEPS} shortLabels={TRACK_SHORT} current={order.step} />
      </div>
      <div className="flex items-center justify-between bg-neutral-50 px-4 py-2.5 text-caption text-text-tertiary">
        <span>Order number</span>
        <b className="font-mono text-text-primary">{displayRef}</b>
      </div>
      {order.mobile && (
        <div className="flex items-center justify-between border-t border-border bg-neutral-50 px-4 py-2.5 text-caption text-text-tertiary">
          <span>Contact number</span>
          <b className="font-mono text-text-primary">+91 {order.mobile}</b>
        </div>
      )}
    </div>
  );
}