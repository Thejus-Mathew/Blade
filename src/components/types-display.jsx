"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { Plus, Trash2 } from "lucide-react"
import Card from "./card"
import Button from "./button"
import { addTypeAction, deleteTypeAction } from "@/app/actions/type-actions"

export default function TypesDisplay({ initialTypes }) {
  const [types, setTypes] = useState(initialTypes)
  const [newTypeName, setNewTypeName] = useState("")
  const [isAddingType, setIsAddingType] = useState(false)
  const [isDeletingType, setIsDeletingType] = useState({})

  const handleAddType = async (e) => {
    e.preventDefault()

    if (!newTypeName.trim()) {
      toast.error("Please enter a type name")
      return
    }

    try {
      setIsAddingType(true)

      const result = await addTypeAction(newTypeName)
      if(!result.success){
        toast.error(result.message)
        return
      }

      setTypes((prev) => [...prev, result.type])
      setNewTypeName("")

      toast.success("Expense Type added successfully")
    } catch (error) {
      console.error("Error adding Type:", error)
      toast.error(error.message || "Failed to add Type")
    } finally {
      setIsAddingType(false)
    }
  }

  const handleDeleteType = async (type) => {
    try {
      setIsDeletingType((prev) => ({ ...prev, [type._id]: true }))

      // Confirm deletion
      if (!confirm("Are you sure you want to delete this Expense Type?")) {
        return
      }

      const result = await deleteTypeAction(type)
      if(!result.success){
        toast.error(result.message)
        return
      }

      setTypes((prev) => prev.filter((item) => item._id !== type._id))

      toast.success("Expense Type deleted successfully")
    } catch (error) {
      console.error("Error deleting type:", error)
      toast.error(error.message || "Failed to delete type")
    } finally {
      setIsDeletingType((prev) => ({ ...prev, [type._id]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleAddType} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="Enter Type name"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Button type="submit" isLoading={isAddingType}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense Type
          </Button>
        </form>
      </Card>

      <Card>
        {types.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {types.map((type) => (
              <div key={type._id} className="flex justify-between items-center py-3">
                <span className="font-medium">{type.name}</span>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDeleteType(type)}
                  isLoading={isDeletingType[type._id]}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No Expense Type found. Add an Expense Type to get started.</div>
        )}
      </Card>
    </div>
  )
}
