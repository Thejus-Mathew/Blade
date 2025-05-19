"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { calculateRemainingEvenSplit } from "@/lib/utils"
import Button from "./button"
import Card from "./card"
import { addExpenseAction } from "@/app/actions/expense-actions"

export default function AddExpenseForm({ members , types}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState({})
  const [splitAmounts, setSplitAmounts] = useState({})
  const [manualSplits, setManualSplits] = useState({})

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm()

  const totalAmount = watch("totalAmount")

  // Initialize selected members (all checked by default)
  useEffect(() => {
    const initialSelectedMembers = {}
    members.forEach((member) => {
      initialSelectedMembers[member._id] = false
    })
    setSelectedMembers(initialSelectedMembers)
  }, [members])

  // Calculate split amounts when total amount or selected members change
  useEffect(() => {
    if (!totalAmount) return

    const selectedMemberIds = Object.entries(selectedMembers)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id)

    const manualSplitAmounts = {}
    Object.entries(manualSplits)
      .filter(([_, isManual]) => isManual)
      .forEach(([id]) => {
        manualSplitAmounts[id] = splitAmounts[id] || 0
      })

    const evenSplitAmount = calculateRemainingEvenSplit(totalAmount, manualSplitAmounts, selectedMemberIds.length)

    const newSplitAmounts = {}
    selectedMemberIds.forEach((id) => {
      if (manualSplits[id]) {
        newSplitAmounts[id] = splitAmounts[id] || 0
      } else {
        newSplitAmounts[id] = evenSplitAmount
      }
    })

    setSplitAmounts(newSplitAmounts)
  }, [totalAmount, selectedMembers, manualSplits])

  const handleMemberToggle = (memberId) => {
    setSelectedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }))

    if (selectedMembers[memberId] && manualSplits[memberId]) {
      // If deselecting a member with manual split, remove the manual split
      setManualSplits((prev) => {
        const updated = { ...prev }
        delete updated[memberId]
        return updated
      })
    }
  }

  const handleSplitAmountChange = (memberId, amount) => {
    setManualSplits((prev) => ({
      ...prev,
      [memberId]: true,
    }))

    setSplitAmounts((prev) => ({
      ...prev,
      [memberId]: amount,
    }))
  }

  const resetManualSplit = (memberId) => {
    setManualSplits((prev) => {
      const updated = { ...prev }
      delete updated[memberId]
      return updated
    })
  }

  const getTotalSplitAmount = () => {
    return Object.entries(selectedMembers)
      .filter(([_, isSelected]) => isSelected)
      .reduce((sum, [id]) => sum + (splitAmounts[id] || 0), 0)
  }

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)

      // Validate that total amount equals total split amount
      const totalSplitAmount = getTotalSplitAmount()
      if (Math.abs(totalSplitAmount - data.totalAmount) > 0.02) {
        toast.error("Total amount must equal the sum of all split amounts")
        return
      }

      // Prepare splits data
      const splits = Object.entries(selectedMembers)
        .filter(([_, isSelected]) => isSelected)
        .map(([memberId]) => ({
          member: memberId,
          amount: splitAmounts[memberId] || 0,
        }))

      // Submit expense
      await addExpenseAction({
        ...data,
        splits,
      })

      toast.success("Expense added successfully")

      // Reset form
      setValue("type", "")
      setValue("totalAmount", 0)

      // Reset splits
      setManualSplits({})
    } catch (error) {
      console.error("Error adding expense:", error)
      toast.error("Failed to add expense")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Expense Type*
            </label>
            <select
              id="type"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:text-gray-200"
              {...register("type", { required: "Expense type is required" })}
            >
              <option value="" className="dark:text-gray-800">Select the Expense Type</option>
              {types.map((type) => (
                <option className="dark:text-gray-800" key={type._id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>

          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Total Amount*
            </label>
            <input
              id="totalAmount"
              type="number"
              step="0.01"
              min="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="0.00"
              {...register("totalAmount", {
                required: "Total amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
                valueAsNumber: true,
              })}
            />
            {errors.totalAmount && <p className="mt-1 text-sm text-red-600">{errors.totalAmount.message}</p>}
          </div>

          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Paid By*
            </label>
            <select
              id="paidBy"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:text-gray-200"
              {...register("paidBy", { required: "Paid by is required", onChange:(e)=>{if(e.target.value) setSelectedMembers({...selectedMembers,[e.target.value]:true})}})}
            >
              <option value="" className="dark:text-gray-800">Select a person</option>
              {members.map((member) => (
                <option className="dark:text-gray-800" key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
            {errors.paidBy && <p className="mt-1 text-sm text-red-600">{errors.paidBy.message}</p>}
          </div>

          <div>
            <label htmlFor="paidThrough" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Paid Through*
            </label>
            <select
              id="paidThrough"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:text-gray-200"
              {...register("paidThrough", { required: "Paid Through is required" })}
            >
              <option value="" className="dark:text-gray-800">Select Payment Option</option>
              <option className="dark:text-gray-800" value={"Credit Card"}>
                {"Credit Card"}
              </option>
              <option className="dark:text-gray-800" value={"Bank Transfer"}>
                {"Bank Transfer"}
              </option>
            </select>
            {errors.paidThrough && <p className="mt-1 text-sm text-red-600">{errors.paidThrough.message}</p>}
          </div>

        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Split Among</h3>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex flex-wrap gap-4 mb-4">
              {members.map((member) => (
                <label key={member._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                    checked={selectedMembers[member._id] || false}
                    onChange={() => handleMemberToggle(member._id)}
                  />
                  <span className="dark:text-gray-700">{member.name}</span>
                </label>
              ))}
            </div>

            {totalAmount > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span  className="dark:text-gray-900">Person</span>
                  <span  className="dark:text-gray-900">Split Amount</span>
                </div>

                {members.map(
                  (member) =>
                    selectedMembers[member._id] && (
                      <div key={member._id} className="flex items-center justify-between">
                        <span className="dark:text-gray-600">{member.name}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={splitAmounts[member._id] || 0}
                            onChange={(e) => handleSplitAmountChange(member._id, Number.parseFloat(e.target.value))}
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-purple-600 dark:text-gray-600"
                          />
                          {manualSplits[member._id] && (
                            <button
                              type="button"
                              onClick={() => resetManualSplit(member._id)}
                              className="text-xs text-purple-600 hover:text-purple-800"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    ),
                )}

                <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                  <span className="dark:text-gray-800">Total</span>
                  <span className={Math.abs(getTotalSplitAmount() - (totalAmount || 0)) > 0.02 ? "text-red-600" : "dark:text-gray-800"}>
                    ₹{getTotalSplitAmount().toFixed(2)} / ₹{totalAmount?.toFixed(2) || "0.00"}
                  </span>
                </div>

                {Math.abs(getTotalSplitAmount() - (totalAmount || 0)) > 0.02 && (
                  <p className="text-sm text-red-600">Total split amount must equal the total expense amount</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={Math.abs(getTotalSplitAmount() - (totalAmount || 0)) > 0.02}
          >
            Add Expense
          </Button>
        </div>
      </form>
    </Card>
  )
}
