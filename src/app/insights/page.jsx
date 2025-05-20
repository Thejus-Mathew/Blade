import { getMembersAction } from "@/app/actions/member-actions"
import { getTypesAction } from "../actions/type-actions";
import { getAllExpensesAction } from "../actions/expense-actions";
import InsightFilter from "@/components/insight-filter";
import InsightDisplay from "@/components/insight-display";
export const dynamic = "force-dynamic";

export default async function InsightsPage({searchParams}) {
  let {startDate,endDate,paidBy,type,paidThrough} = await searchParams
  const members = await getMembersAction()
  const types = await getTypesAction()

  if(!startDate){
    const now = new Date();
    const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;    
    startDate = firstDay
  }
  const expensesResult = await getAllExpensesAction({startDate,endDate,paidBy,type,paidThrough})  
  
  return (
    <div className="max-w-6xl mx-auto ">
        <h1 className="text-3xl font-bold mb-6">Insights</h1>
        <InsightFilter members={members} types={types.filter(item=>item.name!=='Settle Due')} params = {{startDate,endDate,paidBy,type,paidThrough}} />
        <InsightDisplay members={members} types={types.filter(item=>item.name!=='Settle Due')} expenses={expensesResult.filter(item=>item.type!=='Settle Due')}/>
    </div>
  )
}
