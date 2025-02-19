import mongoose, { Schema } from "mongoose";
import User from "./user.model.js";
import { generateSlug } from "../utils/slugify.js";

const tagSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
      lowercase: true,
    },
    slug: {
      type: String,
      // required: true,
      lowercase: true,
    },
    post_count: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
  },
  { timestamps: true }
);

// Create indexes for name and slug
tagSchema.index({ name: 1 }, { unique: true });
tagSchema.index({ slug: 1 }, { unique: true });

// Pre-save middleware to generate Slug from name
tagSchema.pre("save", function (next) {
  if (this.name) {
    this.slug = generateSlug(this.name);
  }
  next();
});

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;
