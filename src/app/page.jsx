import AddExpenseForm from "@/components/add-expense-form"
import { getMembersAction } from "@/app/actions/member-actions"
import { getTypesAction } from "./actions/type-actions";
export const dynamic = "force-dynamic";

export default async function Home() {
  const members = await getMembersAction()
  const types = await getTypesAction()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Expense</h1>
      <AddExpenseForm members={members} types={types}/>
    </div>
  )
}
