import mongoose from "mongoose";

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    message: { type: String, required: true, trim: true },
    source: { type: String, default: "website-contact-form" },
  },
  { timestamps: true }
);

const ContactInquiry =
  mongoose.models.contact_inquiry ||
  mongoose.model("contact_inquiry", contactInquirySchema);

export default ContactInquiry;
