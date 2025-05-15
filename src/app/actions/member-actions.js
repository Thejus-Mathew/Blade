"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db"
import Member from "@/models/member"
import Expense from "@/models/expense"

export async function getMembersAction() {
  try {
    await connectDB()
    const members = await Member.find().sort({ name: 1 })
    return JSON.parse(JSON.stringify(members))
  } catch (error) {
    console.error("Error getting members:", error)
  }
}

export async function addMemberAction(name) {
  try {
    await connectDB()

    // Check if member with same name exists (case insensitive)
    const existingMember = await Member.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    })

    if (existingMember) {
      return { success: false, message:"A member with this name already exists" }
    }

    const member = new Member({ name })
    await member.save()

    revalidatePath("/members")

    return { success: true, member:JSON.parse(JSON.stringify(member)) }
  } catch (error) {
    console.error("Error adding member:", error)
  }
}

export async function deleteMemberAction(id) {
  try {
    await connectDB()

    // Check if member has any expenses or is part of any splits
    const expensesAsPayer = await Expense.countDocuments({ paidBy: id })
    const expensesAsSplitter = await Expense.countDocuments({ "splits.member": id })

    if (expensesAsPayer > 0 || expensesAsSplitter > 0) {
      return { success: false, message:"Cannot delete member who has expenses or is part of expense splits" }
    }

    await Member.findByIdAndDelete(id)

    revalidatePath("/members")

    return { success: true }
  } catch (error) {
    console.error("Error deleting member:", error)
  }
}

export async function canDeleteMemberAction(id) {
  try {
    await connectDB()

    // Get all expenses
    const expenses = await Expense.find().populate("paidBy", "name").populate("splits.member", "name")

    // Calculate dues
    const dues = []

    expenses.forEach((expense) => {
      const paidBy = expense.paidBy

      expense.splits.forEach((split) => {
        const member = split.member

        // Skip if the person paid for themselves
        if (paidBy._id.toString() === member._id.toString()) return

        dues.push({
          from: member._id.toString(),
          to: paidBy._id.toString(),
          amount: split.amount,
        })
      })
    })

    // Import the simplifyDues function from utils
    const { simplifyDues } = await import("@/lib/utils")

    // Simplify dues by removing middlemen
    const simplifiedDues = simplifyDues(dues)

    // Check if member is involved in any dues
    const memberInvolved = simplifiedDues.some((due) => due.from === id || due.to === id)

    return { canDelete: !memberInvolved }
  } catch (error) {
    console.error("Error checking if member can be deleted:", error)
  }
}
