import LegalLayout, { Section, Detail } from "./LegalLayout";
import { BUSINESS, PRICING } from "./legalContent";

const { supportEmail, supportPhone, legalName, tradeName, address, responseTimeHours, siteUrl } = BUSINESS;

function Address() {
  return (
    <span>
      <Detail value={address.line1} label="address.line1" />,{" "}
      <Detail value={address.line2} label="address.line2" />, {address.city},{" "}
      {address.state} <Detail value={address.postalCode} label="address.postalCode" />,{" "}
      {address.country}
    </span>
  );
}

export function Terms() {
  return (
    <LegalLayout
      title="Terms and Conditions"
      subtitle={`The rules for using ${tradeName}.`}
    >
      <Section heading="1. Who we are">
        <p>
          {tradeName} (&ldquo;the Service&rdquo;) is operated by{" "}
          <Detail value={legalName} label="legalName" />, at <Address />. You can
          reach us at <Detail value={supportEmail} label="supportEmail" />.
        </p>
        <p>
          The Service is an independent study resource for placement preparation.
          It is not an official publication of CMR Institute of Technology, and it
          is not endorsed by, affiliated with, or operated on behalf of any company
          named on the site.
        </p>
      </Section>

      <Section heading="2. Eligibility and accounts">
        <p>
          Access requires signing in with a Google account on the{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px]">@cmrit.ac.in</code>{" "}
          domain. You are responsible for activity under your account. Accounts and
          paid access are personal and non-transferable.
        </p>
        <p>
          Sharing your login, or redistributing paid content to people who have not
          purchased access, is a breach of these terms and may result in access
          being revoked without refund.
        </p>
      </Section>

      <Section heading="3. What you get">
        <p>
          A free tier shows a preview of the question bank. The{" "}
          {PRICING.productName} costs &#8377;{PRICING.amountInr} and unlocks the
          full question bank, the notes library, AI-assisted answers, and mock
          interviews for {PRICING.durationDays} days from the date of purchase.
        </p>
        <p>
          This is a one-time purchase for a fixed period. It does{" "}
          <strong>not</strong> auto-renew, and no recurring mandate is created on
          your payment instrument.
        </p>
      </Section>

      <Section heading="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>scrape, bulk-download, resell, or republish content from the Service;</li>
          <li>share paid material with people who have not purchased access;</li>
          <li>attempt to bypass authentication, payment, or access controls;</li>
          <li>upload unlawful material, or anything you do not have the right to upload;</li>
          <li>disrupt the Service or place unreasonable load on it.</li>
        </ul>
      </Section>

      <Section heading="5. Accuracy of content">
        <p>
          Questions are contributed and compiled from students&rsquo; recollections
          of past campus drives. They are provided for study purposes only. We do
          not guarantee that any question will appear in a future interview, and we
          make no representation about placement outcomes.
        </p>
        <p>
          AI-generated answers and mock-interview feedback are produced
          automatically and may be incomplete or wrong. Verify anything important
          against a primary source before relying on it.
        </p>
      </Section>

      <Section heading="6. Intellectual property">
        <p>
          Company names and logos are the trademarks of their respective owners and
          are used for identification only. The compilation, site design, and
          original material remain the property of the operator.
        </p>
      </Section>

      <Section heading="7. Availability">
        <p>
          The Service is provided &ldquo;as is&rdquo;. We aim to keep it available
          but do not guarantee uninterrupted access, and we may change or withdraw
          features. If we permanently discontinue the Service while your pass is
          active, we will refund the unused portion on a pro-rata basis.
        </p>
      </Section>

      <Section heading="8. Limitation of liability">
        <p>
          To the extent permitted by law, our total liability arising from your use
          of the Service is limited to the amount you paid us in the twelve months
          before the claim.
        </p>
      </Section>

      <Section heading="9. Governing law">
        <p>
          These terms are governed by the laws of India. Disputes are subject to the
          exclusive jurisdiction of the courts at {address.city}, {address.state}.
        </p>
      </Section>

      <Section heading="10. Changes">
        <p>
          We may update these terms. Material changes will be reflected in the
          &ldquo;last updated&rdquo; date above. Continued use after a change means
          you accept the revised terms.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="What we collect, why, and what we do not do with it."
    >
      <Section heading="1. What we collect">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Account details</strong> — your name, {" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[13px]">@cmrit.ac.in</code>{" "}
            email address, and profile picture, received from Google when you sign in.
          </li>
          <li>
            <strong>Purchase records</strong> — payment identifiers, amount, and status.
            Card and UPI details are handled entirely by Razorpay and never reach our servers.
          </li>
          <li>
            <strong>Usage data</strong> — pages viewed and features used, via Vercel
            Analytics and Microsoft Clarity, including session recordings of
            interactions with the site.
          </li>
          <li>
            <strong>Content you send</strong> — questions you ask the AI features, in
            order to generate a response.
          </li>
        </ul>
      </Section>

      <Section heading="2. What stays on your device">
        <p>
          Bookmarks, completed-question progress, and any Groq API key you choose to
          add are stored in your browser&rsquo;s local storage and are never sent to us.
        </p>
        <p>
          Resumes uploaded for a mock interview are parsed <strong>in your browser</strong>.
          The file is not uploaded to our servers. Text extracted from it is sent to
          the AI provider to generate questions.
        </p>
      </Section>

      <Section heading="3. Why we process it">
        <p>
          To authenticate you, to deliver what you paid for, to provide support, to
          detect abuse and account sharing, and to understand which parts of the
          site are useful.
        </p>
      </Section>

      <Section heading="4. Who we share it with">
        <p>We use these processors, and share only what each needs to function:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Google</strong> — sign-in</li>
          <li><strong>Razorpay</strong> — payment processing</li>
          <li><strong>MongoDB Atlas</strong> — database hosting</li>
          <li><strong>Cloudinary</strong> — notes storage and delivery</li>
          <li><strong>Groq</strong> — AI responses</li>
          <li><strong>Vercel, Microsoft Clarity</strong> — hosting and analytics</li>
        </ul>
        <p>We do not sell your personal data, and we do not share it for advertising.</p>
      </Section>

      <Section heading="5. Advertising">
        <p>
          The site shows ads through Google AdSense, which may use cookies to
          personalise them. You can manage this at{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 underline underline-offset-2"
          >
            Google Ads Settings
          </a>.
        </p>
      </Section>

      <Section heading="6. Retention">
        <p>
          Account and purchase records are kept while your account exists and for as
          long afterwards as tax and accounting rules require. Ask us to delete your
          account and we will remove your personal data, retaining only the
          transaction records we are legally obliged to keep.
        </p>
      </Section>

      <Section heading="7. Your rights">
        <p>
          You can ask for a copy of your data, ask us to correct it, or ask us to
          delete your account. Email{" "}
          <Detail value={supportEmail} label="supportEmail" /> and we will respond
          within {responseTimeHours} hours.
        </p>
      </Section>

      <Section heading="8. Security">
        <p>
          Sessions use signed tokens, payments are verified by HMAC signature, notes
          are stored as private assets served through short-lived signed URLs, and
          traffic is served over HTTPS. No system is perfectly secure, but we do not
          store payment credentials at all.
        </p>
      </Section>

      <Section heading="9. Children">
        <p>
          The Service is intended for college students. It is not directed at
          children under 13, and we do not knowingly collect their data.
        </p>
      </Section>

      <Section heading="10. Contact">
        <p>
          Questions about this policy: <Detail value={supportEmail} label="supportEmail" />,
          or write to <Address />.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function Refund() {
  return (
    <LegalLayout
      title="Refund and Cancellation Policy"
      subtitle={`For the ${PRICING.productName}.`}
    >
      <Section heading="What you are buying">
        <p>
          The {PRICING.productName} is a one-time purchase of &#8377;
          {PRICING.amountInr} that unlocks digital content for{" "}
          {PRICING.durationDays} days. Access begins immediately on successful
          payment. There is no auto-renewal and nothing to cancel: the pass simply
          expires at the end of its term.
        </p>
      </Section>

      <Section heading="Refund window">
        <p>
          Because access to the full content is granted instantly, refunds are
          available within <strong>7 days</strong> of purchase, provided the
          request is made in good faith. Ask by emailing{" "}
          <Detail value={supportEmail} label="supportEmail" /> from the address you
          purchased with, including your payment reference.
        </p>
      </Section>

      <Section heading="When we will refund in full">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>You were charged more than once for the same pass.</li>
          <li>Payment succeeded but access was never granted, and we cannot fix it.</li>
          <li>The Service is unavailable for an extended period during your term.</li>
          <li>You were charged without authorisation.</li>
        </ul>
        <p>
          In these cases the 7-day window does not apply — contact us whenever you
          notice the problem.
        </p>
      </Section>

      <Section heading="When we may decline">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>The request comes more than 7 days after purchase.</li>
          <li>The pass was used substantially — bulk downloading of notes, for example.</li>
          <li>Access was revoked for breaching the terms, such as sharing an account.</li>
          <li>Dissatisfaction with question content that is accurately described on the site.</li>
        </ul>
      </Section>

      <Section heading="How refunds are paid">
        <p>
          Approved refunds are issued to the original payment method through
          Razorpay. We process them within {responseTimeHours} hours of approval;
          your bank or UPI provider typically takes a further 5&ndash;7 working days
          to credit the amount.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Refund requests and payment problems:{" "}
          <Detail value={supportEmail} label="supportEmail" /> or{" "}
          <Detail value={supportPhone} label="supportPhone" />.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function Contact() {
  return (
    <LegalLayout
      title="Contact Us"
      subtitle="Payment problems, refunds, corrections, or anything else."
    >
      <Section heading="Get in touch">
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-200/80 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Email</p>
            <p className="mt-1 text-[14px] text-zinc-900">
              <Detail value={supportEmail} label="supportEmail" />
            </p>
            <p className="mt-1 text-[12px] text-zinc-400">
              We reply within {responseTimeHours} hours.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Phone</p>
            <p className="mt-1 text-[14px] text-zinc-900">
              <Detail value={supportPhone} label="supportPhone" />
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Registered address
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-zinc-900">
              <Detail value={legalName} label="legalName" />
              <br />
              <Address />
            </p>
          </div>
        </div>
      </Section>

      <Section heading="Reporting a mistake in a question">
        <p>
          The question bank comes from students&rsquo; recollections, so errors
          happen. Email us the company, the year, and the question, and we will
          correct or remove it.
        </p>
      </Section>

      <Section heading="Business details">
        <p>
          {tradeName} is operated by <Detail value={legalName} label="legalName" />.
          The site is <a href={siteUrl} className="text-zinc-900 underline underline-offset-2">{siteUrl}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function Pricing() {
  return (
    <LegalLayout
      title="Pricing"
      subtitle="One pass. Everything included. No auto-renewal."
    >
      <Section heading="Free">
        <p>
          Browse a preview of every company&rsquo;s technical questions, and the
          complete HR question bank, at no cost. No payment details required.
        </p>
      </Section>

      <Section heading={PRICING.productName}>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6">
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-semibold tracking-[-0.03em] text-zinc-900">
              &#8377;{PRICING.amountInr}
            </span>
            <span className="text-[14px] text-zinc-400">
              for {PRICING.durationDays} days
            </span>
          </div>
          <ul className="mt-5 space-y-2.5">
            {[
              "Every technical, coding and HR question",
              "All 92 companies, 2022 to 2026",
              "Premium notes library",
              "AI answers and resume-based mock interviews",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[14px] text-zinc-600">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-[13px] text-zinc-500">
          A one-time payment, not a subscription. Nothing is charged again when the
          term ends. If you renew before your pass expires, the remaining days are
          added to the new term rather than lost.
        </p>
      </Section>

      <Section heading="Payment and refunds">
        <p>
          Payments are processed by Razorpay (UPI, cards, net banking). We never see
          or store your payment credentials. See our{" "}
          <a href="/refund" className="text-zinc-900 underline underline-offset-2">
            refund policy
          </a>{" "}
          for the 7-day window and how to request one.
        </p>
      </Section>
    </LegalLayout>
  );
}
