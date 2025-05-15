import mongoose, { Schema, models } from "mongoose"

const MemberSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})


const Member = models.Member || mongoose.model("Member", MemberSchema)

export default Member
