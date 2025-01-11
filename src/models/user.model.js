import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    personal_info: {
      fullname: {
        type: String,
        required: true,
        lowercase: true,
        minlength: [3, "fullname must be 3 letters long"],
      },
      username: {
        type: String,
        required: true,
        lowercase: true,
        minlength: [3, "fullname must be 3 letters long"],
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: true,
      },
      profile_img: {
        type: String, // URL string
      },
    },
    account_info: {
      total_posts: { type: Number, default: 0 },
      total_reads: { type: Number, default: 0 },
    },
    // TODO: ADD POSTS field, IDs
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const User = mongoose.model("User", userSchema);
export default User;
