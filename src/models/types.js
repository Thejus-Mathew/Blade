import mongoose, { Schema, models } from "mongoose"

const TypeSchema = new Schema({
  name: {
    type: String,
    required: [true, "Type is required"],
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})


const Type = models.Type || mongoose.model("Type", TypeSchema)

export default Type
