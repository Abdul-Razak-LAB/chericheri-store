import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import { promises as fs } from "fs";
import connectDB from "@/config/db";
import ContactInquiry from "@/models/ContactInquiry";

const isValidEmail = (value) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);

const clean = (value) => (typeof value === "string" ? value.trim() : "");

const getSafeErrorMessage = (error, fallbackMessage) => {
  const message = clean(error?.message);
  if (!message) return fallbackMessage;

  // Keep responses user-friendly and avoid leaking low-level internals.
  if (message.toLowerCase().includes("auth")) {
    return "Authentication failed. Check your credentials.";
  }
  if (message.toLowerCase().includes("timeout")) {
    return "Connection timed out. Please try again.";
  }
  if (message.toLowerCase().includes("enotfound")) {
    return "Host not found. Check server host settings.";
  }

  return fallbackMessage;
};

const appendLocalInquiry = async (inquiry) => {
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "contact-inquiries.json");

  await fs.mkdir(dataDir, { recursive: true });

  let current = [];
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    current = Array.isArray(parsed) ? parsed : [];
  } catch {
    current = [];
  }

  current.unshift(inquiry);
  await fs.writeFile(filePath, JSON.stringify(current, null, 2), "utf-8");
};

export async function POST(request) {
  try {
    const body = await request.json();

    const name = clean(body.name);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);
    const message = clean(body.message);

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const hasMongo = Boolean(process.env.MONGODB_URI);
    const hasSmtp =
      Boolean(process.env.SMTP_HOST) &&
      Boolean(process.env.SMTP_USER) &&
      Boolean(process.env.SMTP_PASS);

    if (!hasMongo && !hasSmtp) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Contact service is not configured yet. Add MONGODB_URI and SMTP credentials.",
        },
        { status: 500 }
      );
    }

    let inquiryId = null;
    let savedToDb = false;
    let emailSent = false;
    let dbErrorMessage = "";
    let smtpErrorMessage = "";
    let fallbackSaved = false;
    let fallbackErrorMessage = "";

    if (hasMongo) {
      try {
        await connectDB();
        const inquiry = await ContactInquiry.create({
          name,
          email,
          phone,
          message,
        });
        inquiryId = inquiry._id?.toString() || null;
        savedToDb = true;
      } catch (error) {
        dbErrorMessage = getSafeErrorMessage(error, "Database is unavailable.");
      }
    }

    if (hasSmtp) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const targetEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER;
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

        await transporter.sendMail({
          from: `Chericheri Contact <${fromEmail}>`,
          to: targetEmail,
          replyTo: email,
          subject: `New Contact Inquiry from ${name}`,
          text: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone || "N/A"}`,
            "",
            "Message:",
            message,
          ].join("\n"),
          html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f252e;">
            <h2 style="margin: 0 0 12px;">New Contact Inquiry</h2>
            <p style="margin: 0 0 6px;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 6px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0 0 6px;"><strong>Phone:</strong> ${phone || "N/A"}</p>
            <p style="margin: 14px 0 6px;"><strong>Message:</strong></p>
            <p style="margin: 0; white-space: pre-line;">${message}</p>
          </div>
        `,
        });

        emailSent = true;
      } catch (error) {
        smtpErrorMessage = getSafeErrorMessage(error, "Email service is unavailable.");
      }
    }

    if (!savedToDb && !emailSent) {
      try {
        const fallbackInquiry = {
          _id: Date.now().toString(),
          name,
          email,
          phone,
          message,
          source: "contact-form-fallback",
          createdAt: new Date().toISOString(),
          errors: {
            dbErrorMessage,
            smtpErrorMessage,
          },
        };

        await appendLocalInquiry(fallbackInquiry);
        fallbackSaved = true;
      } catch (error) {
        fallbackErrorMessage = getSafeErrorMessage(error, "Local fallback save failed.");
      }

      if (fallbackSaved) {
        return NextResponse.json({
          success: true,
          message:
            "Your inquiry was received and queued for follow-up. Messaging services are temporarily unavailable.",
          data: {
            inquiryId: null,
            savedToDb,
            emailSent,
            fallbackSaved,
            warning: [dbErrorMessage, smtpErrorMessage].filter(Boolean).join(" "),
          },
        });
      }

      const details = [dbErrorMessage, smtpErrorMessage, fallbackErrorMessage].filter(Boolean).join(" ");
      return NextResponse.json(
        {
          success: false,
          message: details
            ? `Unable to submit your inquiry right now. ${details}`
            : "Unable to submit your inquiry right now.",
        },
        { status: 503 }
      );
    }

    if (savedToDb && emailSent) {
      return NextResponse.json({
        success: true,
        message: "Your message has been sent successfully.",
        data: { inquiryId, savedToDb, emailSent },
      });
    }

    if (savedToDb && !emailSent) {
      return NextResponse.json({
        success: true,
        message: "Your inquiry was saved, but email notification failed. We will still follow up.",
        data: {
          inquiryId,
          savedToDb,
          emailSent,
          fallbackSaved,
          warning: smtpErrorMessage || "Email notification failed.",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent, but database save failed.",
      data: {
        inquiryId,
        savedToDb,
        emailSent,
        fallbackSaved,
        warning: dbErrorMessage || "Database save failed.",
      },
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to process your inquiry right now. Please check configuration and try again.",
      },
      { status: 500 }
    );
  }
}
