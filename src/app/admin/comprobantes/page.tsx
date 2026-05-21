import { fetchProofs } from "./actions";
import ComprobantesClient from "./ComprobantesClient";

export const dynamic = "force-dynamic";

export default async function ComprobantesPage() {
  const proofs = await fetchProofs();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Comprobantes</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Valida comprobantes y revisa el historial de procesados
        </p>
      </div>
      <ComprobantesClient proofs={proofs} />
    </div>
  );
}
