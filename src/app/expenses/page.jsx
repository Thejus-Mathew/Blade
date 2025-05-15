import { getMembersAction } from "@/app/actions/member-actions"
import ExpensesDisplay from "@/components/expenses-display"
import { getTypesAction } from "../actions/type-actions";
export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const members = await getMembersAction()
  const types = await getTypesAction()

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Expenses</h1>
       <ExpensesDisplay members={members} types={types}/>
    </div>
  )
}
