import { getMembersAction } from "@/app/actions/member-actions"
import ExpensesDisplay from "@/components/expenses-display"
import { getTypesAction } from "../actions/type-actions";
import { getExpensesAction } from "../actions/expense-actions";
export const dynamic = "force-dynamic";

export default async function ExpensesPage({searchParams}) {
  let {startDate,endDate,paidBy,type,paidThrough,page} = await searchParams
  const members = await getMembersAction()
  const types = await getTypesAction()

  if(!startDate){
    const now = new Date();
    const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;    
    startDate = firstDay
  }
  const expensesResult = await getExpensesAction(startDate,endDate,paidBy,type,paidThrough,page)    
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Expenses</h1>
       <ExpensesDisplay members={members} types={types} expenses={expensesResult.expenses} totalPages={expensesResult.totalPages} params = {{startDate,endDate,paidBy,type,paidThrough,page}} />
    </div>
  )
}
