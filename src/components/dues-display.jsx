"use client"

import { useMemo } from "react"
import Card from "./card"
import { formatCurrency } from "@/lib/utils"

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
                    <span className="text-red-600 font-medium">{formatCurrency(amount)}</span>
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
                    <span className="text-green-600 font-medium">{formatCurrency(amount)}</span>
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
          <div className="space-y-8">
            {Object.entries(duesByPayer).map(([payerId, payerDues]) => (
              <div key={payerId} className="space-y-3">
                <h3 className="font-semibold text-lg">{memberMap[payerId]} owes:</h3>
                <div className="pl-4 space-y-2">
                  {payerDues.map((due, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{memberMap[due.to]}</span>
                      <span className="font-medium">{formatCurrency(due.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No dues to settle</p>
        )}
      </Card>
    </div>
  )
}
