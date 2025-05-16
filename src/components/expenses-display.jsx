"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { Download, Trash2,ExternalLink } from "lucide-react"
import Card from "./card"
import Button from "./button"
import { formatDateTime, formatCurrency, exportToExcel } from "@/lib/utils"
import { deleteExpenseAction, getAllExpensesAction } from "@/app/actions/expense-actions"
import Link from "next/link"

export default function ExpensesDisplay({ members, types, expenses, params, totalPages }) {
  totalPages = Number(totalPages)
  
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState({})

  const [startDate, setStartDate] = useState(params.startDate || "")
  const [endDate, setEndDate] = useState(params.endDate || "")
  const [paidBy, setPaidBy] = useState(params.paidBy)
  const [type, setType] = useState(params.type)
  const [page, setPage] = useState(Number(params.page) || 1)

  useEffect(()=>{
  setStartDate(params.startDate || "")
  setEndDate(params.endDate || "")
  setPaidBy(params.paidBy)
  setType(params.type)
  setPage(Number(params.page) || 1)
  },[params])

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    refetch()
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)

      const allExpenses = await getAllExpensesAction({
        startDate,
        endDate,
        paidBy,
        type,
      })

      // Create a map of all member IDs to prepare columns
      const memberMap = new Map()
      members.forEach((member) => {
        memberMap.set(member._id, member.name)
      })

      // Prepare data for export
      const exportData = allExpenses.map((expense, index) => {
        const row = {
          "Sl No": index + 1,
          "Expense Type": expense.type,
          "Paid By": expense.paidBy.name,
          Date: formatDateTime(expense.date),
          "Total Amount": expense.totalAmount.toFixed(2),
        }

        // Add a column for each member
        members.forEach((member) => {
          const split = expense.splits.find((s) => s.member._id.toString() === member._id.toString())
          row[member.name] = split ? split.amount.toFixed(2) : "0.00"
        })

        return row
      })

      // Add totals row
      const totalsRow = {
        "Sl No": "",
        "Expense Type": "",
        "Paid By": "",
        Date: "",
        "Total Amount": allExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0).toFixed(2),
      }

      // Calculate totals for each member
      members.forEach((member) => {
        let total = 0

        allExpenses.forEach((expense) => {
          const split = expense.splits.find((s) => s.member._id.toString() === member._id.toString())
          if (split) {
            total += split.amount
          }
        })

        totalsRow[member.name] = total.toFixed(2)
      })

      exportData.push(totalsRow)

      // Generate filename based on filters
      let filename = "Blade"
      if (startDate || endDate) {
        filename += `-${startDate}-to-${endDate}`
      }

      // Export to Excel
      exportToExcel(exportData, filename, startDate, endDate)

      toast.success("Expenses exported successfully")
    } catch (error) {
      console.error("Error exporting expenses:", error)
      toast.error("Failed to export expenses")
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteExpense = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return
    }

    try {
      setIsDeleting((prev) => ({ ...prev, [id]: true }))

      await deleteExpenseAction(id)
      toast.success("Expense deleted successfully")
      
      refetch()
      } catch (error) {
      console.error("Error deleting expense:", error)
      toast.error("Failed to delete expense")
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }))
    }
  }

  const refetch = () => {
    const newParams = new URLSearchParams()
    if (startDate) newParams.set("startDate", startDate)
    if (endDate) newParams.set("endDate", endDate)
    if (paidBy) newParams.set("paidBy", paidBy)
    if (type) newParams.set("type", type)
    if (page) newParams.set("page", page)      

    router.push(`/expenses?${newParams.toString()}`)
  }

  useEffect(()=>{
    if(page !== Number(params.page)){
      refetch()
    }
  },[page])
  

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Paid By
              </label>
              <select
                id="paidBy"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="" className="dark:text-gray-800">All Members</option>
                {members.map((member) => (
                  <option className="dark:text-gray-800" key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Expense Type
              </label>
              <select
                id="paidBy"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="" className="dark:text-gray-800">All Expense Type</option>
                {types.map((type) => (
                  <option className="dark:text-gray-800" key={type._id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <Link href={"/expenses"} className="block">
              <Button type="reset" variant="" className="bg-gray-500" style={{width:"100%"}}>
                Reset Filter
              </Button>
            </Link>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="submit" variant="primary">
              Apply Filters
            </Button>

            <Button type="button" variant="secondary" onClick={handleExport} isLoading={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        {expenses.length > 0 ? (
          <div className="overflow-x-auto pb-6">
            <table className="w-full border-collapse table-responsive">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Paid By</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 flex justify-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4 text-sm">{expense.type}</td>
                    <td className="px-4 py-4 text-sm min-w-[100px]">{expense.paidBy.name}</td>
                    <td className="px-4 py-4 text-sm min-w-[150px]">{formatDateTime(expense.date)}</td>
                    <td className="px-4 py-4 text-sm font-medium">{formatCurrency(expense.totalAmount)}</td>
                    <td className="px-4 py-4 text-sm flex justify-between gap-2">
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDeleteExpense(expense._id)}
                        isLoading={isDeleting[expense._id]}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Link href={`/expenses/${expense._id}`}>
                        <Button
                          variant="outline"
                          size="small"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant={page === 1 ? "primary" : "outline"}
                    size="small"
                    onClick={() => setPage(1)}
                  >
                    1
                  </Button>

                  {[-2,-1, 0, 1, 2].map((offset) => {
                    const p = page + offset;
                    if((p > 1 && p < totalPages) && [-1,0,1].includes(offset)) {
                      return <Button
                            key={offset}
                            variant={p === page ? "primary" : "outline"}
                            size="small"
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </Button>
                    }else if((p>1 && p<(totalPages)) && [-2,2].includes(offset)){
                      return <span key={offset} className="px-2">...</span>
                    }
                    return null
                  })}

                  <Button
                    variant={page===totalPages? "primary" : "outline"}
                    size="small"
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No expenses found. Try adjusting your filters or add a new expense.
          </div>
        )}
      </Card>
    </div>
  )
}
