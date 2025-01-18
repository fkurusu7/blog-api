import mongoose, { Schema } from "mongoose";
import User from "./user.model.js";
import { generateSlug } from "../utils/slugify.js";
import Tag from "./tag.model.js";

const postSchema = mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    banner: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 200,
      required: true,
    },
    content: {
      type: String,
      required: true,
      default: "",
    },
    tags: {
      type: [Schema.Types.ObjectId],
      required: true,
      default: [],
      ref: Tag,
    },
    total_reads: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    version: { type: Number, default: 1 },
    history: [
      {
        content: Object,
        updatedAt: Date,
        version: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for better query performance
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ title: 1 }, { unique: true });
postSchema.index({ slug: 1 }, { unique: true });
// postSchema.index({ tags: 1, createdAt: -1 });

// When updating posts, maintain history
postSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.history.push({
      content: this.content,
      updatedAt: new Date(),
      version: this.version,
    });
    this.version += 1;
  }
  next();
});

// // Middleware to update tag postCount when a post is saved or removed
// postSchema.pre("save", async function (next) {
//   if (this.isModified("tags")) {
//     // Ensure oldTags is an array of strings/ObjectIds, not nested array
//     const oldTags = (this._oldTags || []).flat();
//     const newTags = (this.tags || []).flat();

//     // Decrease count for removed tags
//     const removedTags = oldTags.filter((tag) => !newTags.includes(tag));
//     if (removedTags.length) {
//       await Tag.updateMany(
//         { _id: { $in: removedTags } },
//         { $inc: { postCount: -1 } }
//       );
//     }

//     // Increase count for new tags
//     const addedTags = newTags.filter((tag) => !oldTags.includes(tag));
//     if (addedTags.length) {
//       await Tag.updateMany(
//         { _id: { $in: addedTags } },
//         { $inc: { postCount: 1 } }
//       );
//     }
//   }
//   next();
// });

// postSchema.pre("remove", async function (next) {
//   if (this.tags?.length) {
//     await Tag.updateMany(
//       { _id: { $in: this.tags } },
//       { $inc: { postCount: -1 } }
//     );
//   }
//   next();
// });

// Update the pre-save middleware to use the unique slug generator
// check slug uniqueness
postSchema.methods.generateUniqueSlug = async function () {
  let slug = this.slug;
  let counter = 1;

  while (true) {
    const existingPost = await this.constructor.findOne({
      slug,
      _id: { $ne: this._id }, // exclude current post when updating
    });
    if (!existingPost) break;

    // if slug exists, append counter and try again
    slug = `${this.slug}-${counter}`;
  }

  this.slug = slug;
};

postSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    this.slug = generateSlug(this.title);
    await this.generateUniqueSlug();
  }
  next();
});

const Post = mongoose.model("Post", postSchema);
export default Post;
