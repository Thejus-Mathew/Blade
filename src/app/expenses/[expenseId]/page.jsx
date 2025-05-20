import { getAnExpenseAction } from "@/app/actions/expense-actions"
import BackButton from "@/components/back-button"

const ExpensePage =async ({params}) => {
    const {expenseId} = await params
    const expense = await getAnExpenseAction(expenseId)
    
  return (
     <div className="max-w-4xl mx-auto p-4">
      <BackButton/>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 space-y-4 border">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{expense?.type}{expense?.otherInfo && ` - ${expense?.otherInfo}`}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {new Date(expense?.date)?.toLocaleDateString()} | {new Date(expense?.date)?.toLocaleTimeString()} | Paid via {expense?.paidThrough}
            </p>
          </div>
          <div className="text-right md:text-left">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium dark:font-semibold">Total:</span> ₹{expense?.totalAmount?.toFixed(2)}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium dark:font-semibold">Paid by:</span> {expense?.paidBy?.name}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">Split Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expense?.splits?.map((split) => (
              <div
                key={split?._id}
                className="bg-gray-50 dark:bg-gray-100 p-4 rounded-xl border border-gray-400 dark:border-gray-600"
              >
                <p className="text-gray-800 dark:text-gray-900 font-semibold">{split?.member?.name}</p>
                <p className="text-gray-600 dark:text-gray-800 text-sm">Owes: ₹{split?.amount?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpensePage
