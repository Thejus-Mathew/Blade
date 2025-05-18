'use client'
import { useRouter } from "next/navigation";
import Button from "./button";
import Card from "./card";
import { useEffect, useState } from "react";
import Link from "next/link";



const InsightFilter = ({ members, types, params }) => {    
    const router = useRouter()

    const [startDate, setStartDate] = useState(params.startDate || "")
    const [endDate, setEndDate] = useState(params.endDate || "")
    const [paidBy, setPaidBy] = useState(params.paidBy)
    const [type, setType] = useState(params.type)
    const [paidThrough, setPaidThrough] = useState(params.paidThrough)

    useEffect(()=>{
    setStartDate(params.startDate || "")
    setEndDate(params.endDate || "")
    setPaidBy(params.paidBy)
    setPaidThrough(params.paidThrough)
    setType(params.type)
    },[params])

    const handleFilterSubmit = (e) => {
        e.preventDefault()

        const newParams = new URLSearchParams()
        if (startDate) newParams.set("startDate", startDate)
        if (endDate) newParams.set("endDate", endDate)
        if (paidBy) newParams.set("paidBy", paidBy)
        if (paidThrough) newParams.set("paidThrough", paidThrough)
        if (type) newParams.set("type", type)

        router.push(`/insights?${newParams.toString()}`)
    }
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


            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Payment Mode
              </label>
              <select
                id="paidThrough"
                value={paidThrough}
                onChange={(e) => setPaidThrough(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="" className="dark:text-gray-800">All Payment Modes</option>
                  <option className="dark:text-gray-800" value={"Credit Card"}>
                    {"Credit Card"}
                  </option>
                  <option className="dark:text-gray-800" value={"Bank Transfer"}>
                    {"Bank Transfer"}
                  </option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
              <Link href={"/insights"} >
                <Button type="reset" variant="secondary" onClick={()=>{setType("");setPaidBy("");setPaidThrough("")}} >
                  Reset Filter
                </Button>
              </Link>
              
              <Button type="submit" variant="primary">
                Apply Filters
              </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default InsightFilter
