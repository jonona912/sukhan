const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true, // Remove leading and trailing whitespace
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        select: false,
      },
    ],
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: [true, 'Comment content is required'],
          trim: true,
          maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

postSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v;
    delete returnedObject.likes;
  }
});

postSchema.index({ author: 1 }) // Index for efficient querying by author
postSchema.index({ createdAt: -1 }) // Index for sorting posts by creation date (newest first)

module.exports = mongoose.model('Post', postSchema)
