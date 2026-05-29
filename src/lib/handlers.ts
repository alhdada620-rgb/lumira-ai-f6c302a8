import { requireSupabaseAuth } from "@/utils/auth";

interface MinimalRes {
  status: (code: number) => { json: (body: unknown) => unknown };
}

// Handler للموافقة على الدفع
export async function approvePiPayment(req: Request, res: MinimalRes) {
  const user = await requireSupabaseAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  return res.status(200).json({ message: "Payment approved", user });
}

// Handler لإتمام الدفع
export async function completePiPayment(req: Request, res: MinimalRes) {
  const user = await requireSupabaseAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  return res.status(200).json({ message: "Payment completed", user });
}
