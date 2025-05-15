"use server"

import { revalidatePath } from "next/cache"
import connectDB from "@/lib/db"
import Expense from "@/models/expense"
import Type from "@/models/types"

export async function getTypesAction() {
  try {
    await connectDB()
    const types = await Type.find()
    return JSON.parse(JSON.stringify(types))
  } catch (error) {
    console.error("Error getting Expense Types:", error)
  }
}

export async function addTypeAction(name) {
  try {
    await connectDB()

    const existingType = await Type.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    })

    if (existingType) {
        return { success: false, message:"Expense Type already exists" }
    }

    const type = new Type({ name })
    await type.save()

    revalidatePath("/expense-types")

    return { success: true, type:JSON.parse(JSON.stringify(type)) }
  } catch (error) {
    console.error("Error adding expense type:", error)
  }
}

export async function deleteTypeAction(type) {
  try {
    await connectDB()
    const existingExpense = await Expense.findOne({ type: type.name })

    if (existingExpense) {
        return {success:false, message:"Cannot delete Expense Types which are in the added expenses"}
    }

    await Type.findByIdAndDelete(type._id)

    revalidatePath("/expense-types")

    return { success: true }
  } catch (error) {
    console.error("Error deleting Expense Type:", error)
  }
}
