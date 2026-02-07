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
// Email Verification
// ============================================================================

interface VerificationEmailData {
  email: string;
  firstName: string;
  verificationUrl: string;
}

export async function sendVerificationEmail(data: VerificationEmailData) {
  if (isDisabled()) {
    console.log("[EMAIL DISABLED] Would send verification email to:", data.email);
    console.log("[EMAIL DISABLED] Verification URL:", data.verificationUrl);
    return;
  }

  await getResend().emails.send({
    from: getFromAddress(),
    to: data.email,
    subject: "Verify your email - The Hunt Kitchen",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0f311f; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">The Hunt Kitchen</h1>
        </div>
        <div style="padding: 32px 24px; background-color: #f9f7f3;">
          <h2 style="color: #0f311f; margin-top: 0;">Verify your email, ${escapeHtml(data.firstName)}!</h2>
          <p style="color: #333; line-height: 1.6;">
            Thanks for creating an account with The Hunt Kitchen. Please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${escapeHtml(data.verificationUrl)}" style="display: inline-block; background-color: #ff6600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        <div style="padding: 16px; text-align: center; color: #747355; font-size: 12px;">
          The Hunt Kitchen | <a href="https://thehuntkitchen.com" style="color: #747355;">thehuntkitchen.com</a>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// Newsletter Compose & Send
// ============================================================================

export interface NewsletterRecipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  featuredImageUrl: string | null;
}

export interface NewsletterProduct {
  name: string;
  price: string;
  imageUrl: string;
  link: string;
}

export interface NewsletterData {
  subject: string;
  heroHeading?: string;
  heroText?: string;
  recipes?: NewsletterRecipe[];
  product?: NewsletterProduct;
  contentHtml?: string;
}

export function buildNewsletterHtml(data: NewsletterData): string {
  const siteUrl = "https://thehuntkitchen.com";

  // Hero section
  const heroSection =
    data.heroHeading || data.heroText
      ? `
      <div style="padding: 40px 32px 24px; background-color: #f9f7f3;">
        ${data.heroHeading ? `<h2 style="color: #0f311f; margin: 0 0 12px; font-size: 24px; font-weight: 700;">${escapeHtml(data.heroHeading)}</h2>` : ""}
        ${data.heroText ? `<p style="color: #333; line-height: 1.6; margin: 0; font-size: 16px;">${escapeHtml(data.heroText)}</p>` : ""}
      </div>`
      : "";

  // Featured recipes section
  let recipesSection = "";
  if (data.recipes && data.recipes.length > 0) {
    const recipeCards = data.recipes
      .map(
        (recipe) => `
        <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5; margin-bottom: 16px;">
          ${
            recipe.featuredImageUrl
              ? `<img src="${escapeHtml(recipe.featuredImageUrl)}" alt="${escapeHtml(recipe.title)}" style="width: 100%; height: 200px; object-fit: cover; display: block;" />`
              : ""
          }
          <div style="padding: 16px;">
            <h3 style="color: #0f311f; margin: 0 0 8px; font-size: 18px; font-weight: 600;">${escapeHtml(recipe.title)}</h3>
            <p style="color: #555; margin: 0 0 16px; font-size: 14px; line-height: 1.5;">${escapeHtml(recipe.description.length > 120 ? recipe.description.slice(0, 120) + "..." : recipe.description)}</p>
            <a href="${siteUrl}/recipes/${escapeHtml(recipe.slug)}" style="display: inline-block; background-color: #ff6600; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px;">
              View Recipe
            </a>
          </div>
        </div>`
      )
      .join("");

    recipesSection = `
      <div style="padding: 24px 32px; background-color: #f9f7f3;">
        <h2 style="color: #0f311f; margin: 0 0 16px; font-size: 20px; font-weight: 700;">Featured Recipes</h2>
        ${recipeCards}
      </div>`;
  }

  // Product spotlight section
  let productSection = "";
  if (data.product) {
    productSection = `
      <div style="padding: 24px 32px; background-color: #f9f7f3;">
        <h2 style="color: #0f311f; margin: 0 0 16px; font-size: 20px; font-weight: 700;">Product Spotlight</h2>
        <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5; text-align: center; padding: 24px;">
          <img src="${escapeHtml(data.product.imageUrl)}" alt="${escapeHtml(data.product.name)}" style="max-width: 280px; width: 100%; height: auto; border-radius: 6px; display: inline-block;" />
          <h3 style="color: #0f311f; margin: 16px 0 4px; font-size: 18px; font-weight: 600;">${escapeHtml(data.product.name)}</h3>
          <p style="color: #555; margin: 0 0 16px; font-size: 16px;">${escapeHtml(data.product.price)}</p>
          <a href="${escapeHtml(data.product.link)}" style="display: inline-block; background-color: #ff6600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
            Shop Now
          </a>
        </div>
      </div>`;
  }

  // Content block section
  const contentSection = data.contentHtml
    ? `
      <div style="padding: 24px 32px; background-color: #f9f7f3;">
        <div style="color: #333; line-height: 1.7; font-size: 16px;">
          ${data.contentHtml}
        </div>
      </div>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(data.subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #e8e6df; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #f9f7f3;">
        <!-- Header -->
        <div style="background-color: #0f311f; padding: 28px 32px; text-align: center;">
          <a href="${siteUrl}" style="text-decoration: none;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">The Hunt Kitchen</h1>
          </a>
        </div>

        ${heroSection}
        ${recipesSection}
        ${productSection}
        ${contentSection}

        <!-- Footer -->
        <div style="padding: 24px 32px; background-color: #0f311f; text-align: center;">
          <div style="margin-bottom: 16px;">
            <a href="${siteUrl}/recipes" style="color: #ffffff; text-decoration: none; margin: 0 12px; font-size: 14px;">Recipes</a>
            <a href="${siteUrl}/shop" style="color: #ffffff; text-decoration: none; margin: 0 12px; font-size: 14px;">Shop</a>
            <a href="${siteUrl}/about" style="color: #ffffff; text-decoration: none; margin: 0 12px; font-size: 14px;">About</a>
          </div>
          <p style="color: #a0a0a0; font-size: 12px; margin: 0 0 8px; line-height: 1.5;">
            You're receiving this because you subscribed to The Hunt Kitchen newsletter.
          </p>
          <p style="color: #a0a0a0; font-size: 12px; margin: 0; line-height: 1.5;">
            <a href="mailto:info@thehuntkitchen.com?subject=Unsubscribe" style="color: #a0a0a0; text-decoration: underline;">Unsubscribe</a>
            &nbsp;&middot;&nbsp;
            &copy; ${new Date().getFullYear()} The Hunt Kitchen
          </p>
        </div>
      </div>
    </body>
    </html>`;
}

interface SendNewsletterResult {
  sent: number;
  errors: number;
}

export async function sendNewsletterPreview(
  data: NewsletterData,
  toEmail: string
): Promise<void> {
  if (isDisabled()) {
    console.log("[EMAIL DISABLED] Would send newsletter preview to:", toEmail);
    return;
  }

  const html = buildNewsletterHtml(data);

  await getResend().emails.send({
    from: getFromAddress(),
    to: toEmail,
    subject: `[PREVIEW] ${data.subject}`,
    html,
  });
}

export async function sendNewsletter(
  data: NewsletterData,
  subscribers: { email: string }[]
): Promise<SendNewsletterResult> {
  if (isDisabled()) {
    console.log(
      "[EMAIL DISABLED] Would send newsletter to",
      subscribers.length,
      "subscribers"
    );
    return { sent: subscribers.length, errors: 0 };
  }

  const html = buildNewsletterHtml(data);
  const from = getFromAddress();
  let totalSent = 0;
  let totalErrors = 0;

  // Batch in chunks of 100 (Resend limit)
  for (let i = 0; i < subscribers.length; i += 100) {
    const chunk = subscribers.slice(i, i + 100);
    const emails = chunk.map((sub) => ({
      from,
      to: sub.email,
      subject: data.subject,
      html,
    }));

    try {
      await getResend().batch.send(emails);
      totalSent += chunk.length;
    } catch (error) {
      console.error(
        `[EMAIL] Batch send error (chunk ${i / 100 + 1}):`,
        error
      );
      totalErrors += chunk.length;
    }
  }

  return { sent: totalSent, errors: totalErrors };
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
