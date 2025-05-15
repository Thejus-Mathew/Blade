import mongoose, { Schema, models } from "mongoose"

const ExpenseSchema = new Schema({
  type: {
    type: String,
    required: [true, "Expense type is required"],
    trim: true,
  },
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [0.01, "Amount must be greater than 0"],
  },
  paidBy: {
    type: Schema.Types.ObjectId,
    ref: "Member",
    required: [true, "Paid by is required"],
  },
  paidThrough: {
    type: String,
    required: [true, "Payment Option is required"],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  splits: [
    {
      member: {
        type: Schema.Types.ObjectId,
        ref: "Member",
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: [0.01, "Split amount must be greater than 0"],
      },
    },
  ],
})

const Expense = models.Expense || mongoose.model("Expense", ExpenseSchema)

export default Expense
