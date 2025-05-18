"use client"

import { useMemo } from "react"
import Card from "./card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, Users } from "lucide-react"

export default function DuesDisplay({ members, dues }) {
  // Create a map of member IDs to names for easy lookup
  const memberMap = useMemo(() => {
    const map = {}
    members.forEach((member) => {
      map[member._id] = member.name
    })
    return map
  }, [members])

  // Calculate total dues for each person
  const totalDues = useMemo(() => {
    const toPay = {}
    const toReceive = {}

    dues.forEach((due) => {
      toPay[due.from] = (toPay[due.from] || 0) + due.amount
      toReceive[due.to] = (toReceive[due.to] || 0) + due.amount
    })

    return { toPay, toReceive }
  }, [dues])

  // Group dues by person who needs to pay
  const duesByPayer = useMemo(() => {
    const grouped = {}

    dues.forEach((due) => {
      if (!grouped[due.from]) {
        grouped[due.from] = []
      }
      grouped[due.from].push(due)
    })

    return grouped
  }, [dues])

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="To Pay">
          {Object.entries(totalDues.toPay).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(totalDues.toPay)
                .sort((a, b) => b[1] - a[1])
                .map(([memberId, amount]) => (
                  <div key={memberId} className="flex justify-between items-center">
                    <span className="font-medium">{memberMap[memberId]}</span>
                    <span className="dark:text-red-300 text-red-600 font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">No dues to pay</p>
          )}
        </Card>

        <Card title="To Receive">
          {Object.entries(totalDues.toReceive).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(totalDues.toReceive)
                .sort((a, b) => b[1] - a[1])
                .map(([memberId, amount]) => (
                  <div key={memberId} className="flex justify-between items-center">
                    <span className="font-medium">{memberMap[memberId]}</span>
                    <span className="text-green-600 dark:text-green-300 font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">No dues to receive</p>
          )}
        </Card>
      </div>

      {/* Detailed Dues */}
      <Card title="Detailed Dues">
        {dues.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(duesByPayer).map(([payerId, payerDues]) => (
              payerDues.map((due, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{memberMap[payerId]}</p>
                    <p className="text-sm text-muted-foreground">owes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-medium text-right">{memberMap[due.to]}</p>
                    <p className="text-sm text-muted-foreground text-right">{formatCurrency(due.amount)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
              ))))}
          </div>
        ) : (
          <p className="text-gray-500">No dues to settle</p>
        )}
      </Card>
    </div>
  )
}
