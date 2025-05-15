"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { Plus, Trash2 } from "lucide-react"
import Card from "./card"
import Button from "./button"
import { addMemberAction, deleteMemberAction, canDeleteMemberAction } from "@/app/actions/member-actions"

export default function MembersDisplay({ initialMembers }) {
  const [members, setMembers] = useState(initialMembers)
  const [newMemberName, setNewMemberName] = useState("")
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isDeletingMember, setIsDeletingMember] = useState({})

  const handleAddMember = async (e) => {
    e.preventDefault()

    if (!newMemberName.trim()) {
      toast.error("Please enter a member name")
      return
    }

    try {
      setIsAddingMember(true)

      const result = await addMemberAction(newMemberName)
      if(!result.success){
        toast.error(result.message)
        return
      }

      setMembers((prev) => [...prev, result.member])
      setNewMemberName("")

      toast.success("Member added successfully")
    } catch (error) {
      console.error("Error adding member:", error)
      toast.error(error.message || "Failed to add member")
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleDeleteMember = async (id) => {
    try {
      setIsDeletingMember((prev) => ({ ...prev, [id]: true }))

      // Check if member can be deleted
      const { canDelete } = await canDeleteMemberAction(id)

      if (!canDelete) {
        toast.error("Cannot delete member who has pending dues")
        return
      }

      // Confirm deletion
      if (!confirm("Are you sure you want to delete this member?")) {
        return
      }

      const result = await deleteMemberAction(id)
      if(!result.success){
        toast.error(result.message)
        return
      }

      setMembers((prev) => prev.filter((member) => member._id !== id))

      toast.success("Member deleted successfully")
    } catch (error) {
      console.error("Error deleting member:", error)
      toast.error(error.message || "Failed to delete member")
    } finally {
      setIsDeletingMember((prev) => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Enter member name"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Button type="submit" isLoading={isAddingMember}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </form>
      </Card>

      <Card>
        {members.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <div key={member._id} className="flex justify-between items-center py-3">
                <span className="font-medium">{member.name}</span>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDeleteMember(member._id)}
                  isLoading={isDeletingMember[member._id]}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No members found. Add a member to get started.</div>
        )}
      </Card>
    </div>
  )
}
