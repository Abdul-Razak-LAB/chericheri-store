import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/config/db";

const boolEnv = (value) => String(value || "").toLowerCase() === "true";

const hasValue = (value) => Boolean(String(value || "").trim());

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const includeConnectionChecks = url.searchParams.get("check") === "1";

    const expectedToken = process.env.CONTACT_DEBUG_TOKEN;
    if (expectedToken) {
      const providedToken =
        request.headers.get("x-contact-debug-token") ||
        url.searchParams.get("token") ||
        "";

      if (providedToken !== expectedToken) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized diagnostics request.",
          },
          { status: 401 }
        );
      }
    }

    const mongoConfigured = hasValue(process.env.MONGODB_URI);
    const smtpConfigured =
      hasValue(process.env.SMTP_HOST) &&
      hasValue(process.env.SMTP_USER) &&
      hasValue(process.env.SMTP_PASS);

    const missing = {
      mongodb: mongoConfigured ? [] : ["MONGODB_URI"],
      smtp: ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter(
        (key) => !hasValue(process.env[key])
      ),
    };

    const status = {
      configured: {
        mongodb: mongoConfigured,
        smtp: smtpConfigured,
      },
      smtpMeta: {
        hostSet: hasValue(process.env.SMTP_HOST),
        port: Number(process.env.SMTP_PORT || 587),
        secure: boolEnv(process.env.SMTP_SECURE),
        fromSet: hasValue(process.env.SMTP_FROM),
        receiverSet: hasValue(process.env.CONTACT_RECEIVER_EMAIL),
      },
      missing,
      checks: {
        mongodbReachable: null,
        smtpReachable: null,
        warnings: [],
      },
    };

    if (includeConnectionChecks) {
      if (mongoConfigured) {
        try {
          await connectDB();
          status.checks.mongodbReachable = true;
        } catch {
          status.checks.mongodbReachable = false;
          status.checks.warnings.push(
            "MongoDB is configured but connection failed."
          );
        }
      } else {
        status.checks.warnings.push("MongoDB credentials are not configured.");
      }

      if (smtpConfigured) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: boolEnv(process.env.SMTP_SECURE),
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.verify();
          status.checks.smtpReachable = true;
        } catch {
          status.checks.smtpReachable = false;
          status.checks.warnings.push(
            "SMTP is configured but verify() failed."
          );
        }
      } else {
        status.checks.warnings.push("SMTP credentials are not configured.");
      }
    }

    return NextResponse.json({
      success: true,
      message: includeConnectionChecks
        ? "Contact diagnostics with live checks."
        : "Contact diagnostics (configuration only).",
      data: status,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to run diagnostics.",
      },
      { status: 500 }
    );
  }
}
