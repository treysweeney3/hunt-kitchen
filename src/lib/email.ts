import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || "The Hunt Kitchen <noreply@thehuntkitchen.com>";
}

function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || "info@thehuntkitchen.com";
}

function isDisabled(): boolean {
  return process.env.DISABLE_EMAILS === "true";
}

// ============================================================================
// Contact Form Emails
// ============================================================================

interface ContactEmailData {
  name: string;
  email: string;
  subject: string | null;
  message: string;
  inquiryType?: string;
  companyName?: string;
  jobTitle?: string;
  collaborationType?: string;
}

export async function sendContactAdminNotification(data: ContactEmailData) {
  if (isDisabled()) {
    console.log("[EMAIL DISABLED] Would send admin notification for contact from:", data.email);
    return;
  }

  const isBusiness = data.inquiryType === "business";
  const emailSubject = isBusiness
    ? `[BUSINESS] New contact from ${data.name} (${data.companyName})`
    : `New contact form submission from ${data.name}`;

  const businessDetails = isBusiness
    ? `
      <tr>
        <td style="padding: 8px 12px; font-weight: 600; color: #0f311f; vertical-align: top;">Company</td>
        <td style="padding: 8px 12px;">${escapeHtml(data.companyName || "N/A")}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-weight: 600; color: #0f311f; vertical-align: top;">Role</td>
        <td style="padding: 8px 12px;">${escapeHtml(data.jobTitle || "N/A")}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-weight: 600; color: #0f311f; vertical-align: top;">Collaboration Type</td>
        <td style="padding: 8px 12px;">${escapeHtml(data.collaborationType || "N/A")}</td>
      </tr>`
    : "";

  await getResend().emails.send({
    from: getFromAddress(),
    to: getAdminEmail(),
    subject: emailSubject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0f311f; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">New Contact Submission</h1>
        </div>
        <div style="padding: 24px; background-color: #f9f7f3;">
          ${isBusiness ? '<p style="background-color: #ff6600; color: #ffffff; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: 600; margin-bottom: 16px;">Business Inquiry</p>' : ""}
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #0f311f; vertical-align: top;">Name</td>
              <td style="padding: 8px 12px;">${escapeHtml(data.name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #0f311f; vertical-align: top;">Email</td>
              <td style="padding: 8px 12px;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
            </tr>
            ${businessDetails}
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #0f311f; vertical-align: top;">Subject</td>
              <td style="padding: 8px 12px;">${escapeHtml(data.subject || "No subject")}</td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e5e5;">
            <p style="font-weight: 600; color: #0f311f; margin-top: 0;">Message:</p>
            <p style="white-space: pre-wrap; margin-bottom: 0;">${escapeHtml(data.message)}</p>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; color: #747355; font-size: 12px;">
          The Hunt Kitchen - Contact Form Notification
        </div>
      </div>
    `,
  });
}

export async function sendContactUserConfirmation(data: ContactEmailData) {
  if (isDisabled()) {
    console.log("[EMAIL DISABLED] Would send confirmation to:", data.email);
    return;
  }

  await getResend().emails.send({
    from: getFromAddress(),
    to: data.email,
    subject: "We received your message - The Hunt Kitchen",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0f311f; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">The Hunt Kitchen</h1>
        </div>
        <div style="padding: 32px 24px; background-color: #f9f7f3;">
          <h2 style="color: #0f311f; margin-top: 0;">Thanks for reaching out, ${escapeHtml(data.name)}!</h2>
          <p style="color: #333; line-height: 1.6;">
            We've received your message and will get back to you within 24-48 hours during business days.
          </p>
          <p style="color: #333; line-height: 1.6;">
            In the meantime, check out our latest recipes and content:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://thehuntkitchen.com/recipes" style="display: inline-block; background-color: #ff6600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
              Browse Recipes
            </a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; color: #747355; font-size: 12px;">
          The Hunt Kitchen | <a href="https://thehuntkitchen.com" style="color: #747355;">thehuntkitchen.com</a>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// Newsletter Emails
// ============================================================================

interface NewsletterWelcomeData {
  email: string;
  firstName: string | null;
}

export async function sendNewsletterWelcome(data: NewsletterWelcomeData) {
  if (isDisabled()) {
    console.log("[EMAIL DISABLED] Would send newsletter welcome to:", data.email);
    return;
  }

  const greeting = data.firstName
    ? `Welcome, ${escapeHtml(data.firstName)}!`
    : "Welcome!";

  await getResend().emails.send({
    from: getFromAddress(),
    to: data.email,
    subject: "Welcome to The Hunt Kitchen Newsletter!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0f311f; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">The Hunt Kitchen</h1>
        </div>
        <div style="padding: 32px 24px; background-color: #f9f7f3;">
          <h2 style="color: #0f311f; margin-top: 0;">${greeting}</h2>
          <p style="color: #333; line-height: 1.6;">
            You've successfully subscribed to The Hunt Kitchen newsletter. You'll be the first to know about new wild game recipes, cooking tips, and exclusive content.
          </p>
          <p style="color: #333; line-height: 1.6;">
            Here's what you can expect:
          </p>
          <ul style="color: #333; line-height: 1.8;">
            <li>New recipes delivered to your inbox</li>
            <li>Seasonal cooking guides and tips</li>
            <li>Behind-the-scenes content</li>
            <li>Exclusive subscriber-only offers</li>
          </ul>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://thehuntkitchen.com/recipes" style="display: inline-block; background-color: #ff6600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
              Explore Recipes
            </a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; color: #747355; font-size: 12px;">
          The Hunt Kitchen | <a href="https://thehuntkitchen.com" style="color: #747355;">thehuntkitchen.com</a>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// Resend Contact Management
// ============================================================================

interface AddContactData {
  email: string;
  firstName: string | null;
}

export async function addContactToResend(data: AddContactData) {
  const { error } = await getResend().contacts.create({
    email: data.email,
    firstName: data.firstName || undefined,
    unsubscribed: false,
  });

  if (error) {
    console.error("[EMAIL] Failed to add contact to Resend:", error);
    return;
  }

  console.log("[EMAIL] Added contact to Resend:", data.email);
}

export async function removeContactFromResend(email: string) {
  const { error } = await getResend().contacts.remove({ email });

  if (error) {
    console.error("[EMAIL] Failed to remove contact from Resend:", error);
    return;
  }

  console.log("[EMAIL] Removed contact from Resend:", email);
}

// ============================================================================
// Helpers
// ============================================================================

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
