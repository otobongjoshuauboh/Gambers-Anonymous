import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { to, type, alias } = await req.json();

    if (!to || typeof to !== "string") {
      return NextResponse.json(
        { error: "Valid recipient email is required" },
        { status: 400 }
      );
    }

    const userName = alias || "Friend";
    const resendApiKey = process.env.RESEND_API_KEY;

    let subject = "Welcome to Recovery — Your First Step is Protected";
    let htmlContent = `
      <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; padding: 32px 20px; background-color: #ffffff; color: #171717;">
        <h1 style="color: #FF5A00; font-style: italic; font-size: 26px; margin-bottom: 16px;">Welcome, ${userName}</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #404040;">
          Admitting you have an addiction is the first step to recovery. Your account is created, your email is 100% confidential and never visible to peers.
        </p>
        <div style="margin: 24px 0; padding: 20px; background-color: #FFF7ED; border-radius: 16px; border-left: 4px solid #FF5A00;">
          <p style="margin: 0; font-style: italic; color: #C2410C; font-size: 15px;">
            &ldquo;Staying truthful to yourself about your progress is the next step.&rdquo;
          </p>
        </div>
        <p style="font-size: 14px; color: #737373;">
          • Daily live circles start at <strong>7:00 PM GMT, EST, and SGT</strong>.<br />
          • Your streak starts at Day 1 today.
        </p>
        <a href="https://recovery-pwa-lovat.vercel.app/dashboard" style="display: inline-block; background-color: #FF5A00; color: #ffffff; font-weight: bold; font-style: italic; padding: 12px 28px; border-radius: 9999px; text-decoration: none; margin-top: 16px;">
          Go to Your Dashboard
        </a>
      </div>
    `;

    if (type === "encouragement") {
      subject = "Your Daily Recovery Strength — Day by Day";
      htmlContent = `
        <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; padding: 32px 20px; background-color: #ffffff; color: #171717;">
          <h1 style="color: #FF5A00; font-style: italic; font-size: 24px;">Good morning, ${userName}</h1>
          <p style="font-size: 15px; line-height: 1.6;">
            Today is an unwritten page. An urge may come, but an urge is only a passing wave—it is not an instruction.
          </p>
          <div style="margin: 20px 0; padding: 18px; background-color: #FFF7ED; border-radius: 12px;">
            <p style="margin: 0; font-style: italic; color: #C2410C;">
              &ldquo;We are humans and we all fail at some point, but coming back and working harder is better than quitting on yourself.&rdquo;
            </p>
          </div>
          <p style="font-size: 13px; color: #737373;">Stay strong today. We look forward to seeing you at today's 7:00 PM circle.</p>
        </div>
      `;
    } else if (type === "meeting") {
      subject = "Reminder: 7:00 PM Live Circle starts in 15 minutes";
      htmlContent = `
        <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; padding: 32px 20px; background-color: #ffffff; color: #171717;">
          <h1 style="color: #FF5A00; font-style: italic; font-size: 24px;">Circle Starting Soon</h1>
          <p style="font-size: 15px; line-height: 1.6;">
            The 7:00 PM Daily Truth & Grounding circle opens in 15 minutes. Take a quiet breath and join anonymously.
          </p>
          <a href="https://recovery-pwa-lovat.vercel.app/meetings" style="display: inline-block; background-color: #FF5A00; color: #ffffff; font-weight: bold; font-style: italic; padding: 12px 28px; border-radius: 9999px; text-decoration: none; margin-top: 16px;">
            Join Live Call
          </a>
        </div>
      `;
    }

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: "Recovery <onboarding@resend.dev>",
        to,
        subject,
        html: htmlContent,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: data?.id, delivered: true });
    }

    // If Resend API key is not yet set in environment
    return NextResponse.json({
      success: true,
      delivered: false,
      notice:
        "Email prepared successfully. To deliver directly to inboxes, set RESEND_API_KEY in Vercel.",
      preview: { to, subject },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
