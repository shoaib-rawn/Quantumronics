import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    applicationId: { type: Number, required: true, index: true },
    text: {
      type: String,
      required: [true, 'text is required'],
      trim: true,
      minlength: [1, 'text cannot be empty'],
      maxlength: [1000, 'text must be 1000 characters or less'],
    },
    category: {
      type: String,
      enum: ['general', 'interview', 'followup'],
      default: 'general',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
