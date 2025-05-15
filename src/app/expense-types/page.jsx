import TypesDisplay from "@/components/types-display";
import { getTypesAction } from "../actions/type-actions";

export const dynamic = "force-dynamic";

export default async function ExpenseTypePage() {
  const types = await getTypesAction()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Expense Types</h1>
      <TypesDisplay initialTypes={types} />
    </div>
  )
}
