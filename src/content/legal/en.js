/**
 * Privacy policy, terms and contact help, in English. Long-form text lives
 * here rather than in locales/en.js; an Urdu version is a sibling ur.js with
 * the same shape (see ./index.js).
 *
 * A section's `body` is a list of blocks: a string is a paragraph,
 * { list: [...] } a bullet list, { notice: "..." } a highlighted rule.
 * {email} and {whatsapp} are filled in from lib/site.js.
 */

const UPDATED = "2026-11-05";

/** Owner's rule: books are view-only. Same wording in both documents. */
const NO_DOWNLOAD =
  "Books on LibraryHub are licensed for on-platform reading only. Downloading, copying, screen-recording or otherwise extracting any book, or attempting to, by any means, is prohibited. Accounts found doing so will be permanently blocked, barred from all future purchases, and will not receive a refund for any rental or package.";

const privacy = {
  title: "Privacy policy",
  description: "What LibraryHub collects, why, who it's shared with and how long it's kept.",
  updated: UPDATED,
  intro:
    "LibraryHub is an online rental library for readers in Pakistan. This policy explains what we collect when you use the site, why we need it, and what you can do about it. We don't sell your data and we don't show ads.",
  sections: [
    {
      id: "collect",
      heading: "What we collect",
      body: [
        {
          list: [
            "Account details: your name and email address, and a password (stored only as a secure hash). If you sign in with Google or Facebook, we receive your name, email and account ID from them, never your password.",
            "Profile details you choose to add: phone number, alternative email, photo, bio, date of birth and gender.",
            "Payment proofs: for each Easypaisa payment, the transaction ID, the sender's number and name, and the receipt screenshot you upload. We never see or store your Easypaisa PIN.",
            "Rentals and plans: what you rent or book, when, which plan you bought and how many credits are left.",
            "Reading activity: which pages of a book you open and when, plus the network address (IP) and browser used. This is how we protect the books (see “Protecting the books”).",
            "What you send us: book requests, category suggestions, reviews and messages to support.",
            "Technical logs: for every request to our servers, the time, address, page and browser, so we can fix problems and stop abuse.",
          ],
        },
      ],
    },
    {
      id: "use",
      heading: "How we use it",
      body: [
        {
          list: [
            "To run your account, sign you in securely and, if you turn it on, check your two-step verification code.",
            "To confirm your payments by matching them with the transfers we receive, and to send refunds.",
            "To give you access to the books you rent for exactly the time you rented them.",
            "To send you notifications and emails about your payments, rentals, plans and requests. Payment and refund emails are always sent; you can turn the others off in your profile.",
            "To keep the service safe: detect suspicious sign-ins and copying, and investigate problems.",
          ],
        },
      ],
    },
    {
      id: "books",
      heading: "Protecting the books",
      body: [
        "Every page you read is shown as an image stamped with your account ID, part of your email and the time. Page views are logged, and unusual patterns (for example many pages per minute, or one account reading from several networks at once) are flagged for our team to review. A person always reviews a flag before any action is taken.",
        { notice: NO_DOWNLOAD },
      ],
    },
    {
      id: "share",
      heading: "Who we share it with",
      body: [
        "Only with the services we need to run LibraryHub, and only what they need:",
        {
          list: [
            "Cloudinary, which stores book files, covers, photos and payment screenshots.",
            "Our email provider, which delivers account and notification emails.",
            "Google and Facebook, only if you choose to sign in with them.",
            "Google Fonts, which serves the site's typefaces (your browser asks it for the font files).",
          ],
        },
        "We'll also share information if the law requires it, for example a lawful request from the authorities in Pakistan. We never sell or rent your data.",
      ],
    },
    {
      id: "keep",
      heading: "How long we keep it",
      body: [
        {
          list: [
            "Your account and rental history: for as long as you have an account.",
            "Payment records: as long as we need them for accounting and to handle disputes.",
            "Technical request logs: 90 days.",
            "In-app notifications: 180 days.",
            "Security records (sign-ins, admin actions, flags): kept longer, because they protect you and the library.",
          ],
        },
      ],
    },
    {
      id: "browser",
      heading: "Cookies and your browser",
      body: [
        "We don't use advertising or tracking cookies. Your browser stores a few things for the site to work: your sign-in token, your light/dark theme and language, and the last page you read in each book. Signing out removes the sign-in token.",
      ],
    },
    {
      id: "choices",
      heading: "Your choices and rights",
      body: [
        {
          list: [
            "See and correct your details on your profile page.",
            "Turn optional emails off in your profile.",
            "Delete your account yourself in the app or on the website (see “Delete your account”), or ask us to by writing to {email}. Ask us for a copy of your data the same way. We may keep payment and security records the law or fraud prevention requires.",
          ],
        },
      ],
    },
    {
      id: "security",
      heading: "Security",
      body: [
        "Passwords are hashed, connections are encrypted, and staff access is limited and logged. You can add two-step verification to your account. No system is perfectly secure, so please use a strong password and tell us at once if you think your account has been misused.",
      ],
    },
    {
      id: "children",
      heading: "Children",
      body: [
        "LibraryHub is for readers aged 13 and over. Younger readers should use it with a parent or guardian, who is responsible for their account and payments.",
      ],
    },
    {
      id: "changes",
      heading: "Changes and contact",
      body: [
        "If we change this policy we'll update the date at the top, and tell you by email or in the app when the change is significant. Questions about your privacy: {email}.",
      ],
    },
  ],
};

const terms = {
  title: "Terms of use",
  description: "The rules for renting and reading books on LibraryHub.",
  updated: UPDATED,
  intro:
    "These terms are the agreement between you and LibraryHub when you create an account, rent a book or buy a plan. Please read them; by using LibraryHub you agree to them.",
  sections: [
    {
      id: "account",
      heading: "Your account",
      body: [
        "You need an account to rent and read. Give us accurate details, keep your password to yourself, and don't share your account: one account is for one reader. You're responsible for what happens on your account.",
      ],
    },
    {
      id: "rentals",
      heading: "How renting works",
      body: [
        {
          list: [
            "Each book has one copy, so one reader can have it at a time. When it's out, you can book the next free dates.",
            "A rental lasts the number of days shown on the book (usually 14). You can start now or book up to 60 days ahead.",
            "You can extend a rental once by 7 days, free, if nobody has booked the book right after you.",
            "Each reader can have up to 2 rentals running and 3 booked ahead at a time.",
            "When the rental ends, the book closes automatically. You can also return it early.",
          ],
        },
      ],
    },
    {
      id: "plans",
      heading: "Plans",
      body: [
        "A plan gives you a number of book credits (for example 3, 5 or 10). One credit rents one book. Credits are valid for one year from the day your payment is confirmed; unused credits expire after that. We'll remind you before they do.",
      ],
    },
    {
      id: "payments",
      heading: "Payments",
      body: [
        {
          list: [
            "Prices are in Pakistani rupees. You pay by Easypaisa transfer and then send us the transaction ID (and a receipt screenshot, if you can).",
            "When you book, the dates are held for 30 minutes while you pay (24 hours for a plan). If no payment proof arrives, the hold is released.",
            "Our team checks every transfer. Your rental or plan starts once your payment is confirmed. If we can't match a transfer, we'll reject it and tell you why.",
            "Never send money to any number other than the one shown on your payment page.",
          ],
        },
      ],
    },
    {
      id: "refunds",
      heading: "Cancellations and refunds",
      body: [
        {
          list: [
            "You can cancel a booked rental before it starts. If you used a plan credit, the credit comes back. If you paid, a refund request is made for you, and we send the money back to your Easypaisa number after review.",
            "Once a rental has started, it can't be refunded, including if you return the book early.",
            "Plans can't be refunded once the payment is confirmed. Unused or expired credits aren't refunded.",
            "No refund is given for accounts blocked for breaking these terms.",
          ],
        },
      ],
    },
    {
      id: "reading",
      heading: "Reading, not downloading",
      body: [
        "Renting gives you a personal licence to read the book in your browser on LibraryHub during your rental. It doesn't give you ownership of the book or any right to share it.",
        { notice: NO_DOWNLOAD },
        "Pages are watermarked with your account details and every page view is logged, so copies can be traced back to the account they came from.",
      ],
    },
    {
      id: "conduct",
      heading: "Fair use",
      body: [
        "Don't try to break, overload or get around the protections of the site; don't use bots or scrapers; and don't post anything unlawful, abusive or misleading in requests, suggestions or reviews. We can remove such content.",
      ],
    },
    {
      id: "blocking",
      heading: "Suspending accounts",
      body: [
        "We may suspend or permanently block an account that breaks these terms, after our team has reviewed what happened. A blocked account is signed out at once and loses access to its rentals and credits. If you think we've made a mistake, write to {email}.",
      ],
    },
    {
      id: "service",
      heading: "The service",
      body: [
        "We work to keep LibraryHub available, but we can't promise it will always be uninterrupted. Books may be added or removed from the catalogue; a book you've already rented stays readable until your rental ends unless the law requires otherwise. To the extent the law allows, our responsibility to you is limited to the amount you paid for the rental or plan concerned.",
      ],
    },
    {
      id: "law",
      heading: "Changes and law",
      body: [
        "We may update these terms; we'll change the date at the top and tell you about significant changes. If you keep using LibraryHub afterwards, the new terms apply. These terms are governed by the laws of Pakistan.",
        "Questions about these terms: {email}.",
      ],
    },
  ],
};

const contact = {
  title: "Contact us",
  description: "Get help with payments, rentals, plans or your account.",
  intro: "We're a small team and we read every message. We usually reply within one working day.",
  email: "Email",
  emailHint: "Best for anything about your account, payments or refunds.",
  whatsapp: "WhatsApp",
  whatsappHint: "Quick questions, Monday to Saturday.",
  tipTitle: "Writing about a payment?",
  tip: "Include the payment reference (it starts with LH-) and the Easypaisa transaction ID. You'll find both on the payment's page in your account.",
  faqTitle: "Common questions",
  faq: [
    {
      q: "How long does it take to confirm my payment?",
      a: "We check transfers by hand, usually within a few hours during the day. You'll get an email and a notification as soon as it's confirmed.",
    },
    {
      q: "How do I get a refund?",
      a: "Cancel the booking from your library before it starts. If you'd paid, a refund request is made automatically and we send the money back to your Easypaisa number after review. You can follow it on the payment's page.",
    },
    {
      q: "Can I download a book to read offline?",
      a: "No. Books can only be read on LibraryHub, and trying to download or copy one leads to a permanent block with no refund.",
    },
    {
      q: "The book I want isn't here.",
      a: "Request it on the book requests page. If others want it too, they can follow your request, and we'll let everyone know when it's added.",
    },
  ],
};

/** Public page for deleting an account (Google Play asks for this link). */
const deleteAccount = {
  title: "Delete your account",
  description: "How to delete your LibraryHub account, and what's deleted and what's kept.",
  intro:
    "You can delete your LibraryHub account yourself, in the app or on the website. It closes straight away and is deleted for good 14 days later.",
  howTitle: "How to delete it",
  inApp: {
    title: "In the LibraryHub app",
    steps: [
      "Open the Account tab.",
      "Tap “Delete account” at the bottom.",
      "Confirm. If you sign in with a password, you'll be asked for it.",
    ],
  },
  onWeb: {
    title: "On the website",
    steps: [
      "Sign in and open Account, then Profile & settings.",
      "Under “Delete account”, choose “Delete my account”.",
      "Confirm. If you sign in with a password, you'll be asked for it.",
    ],
  },
  openProfile: "Open my profile",
  byEmail:
    "Can't sign in any more? Email {email} from the address on your account and we'll delete it for you.",
  beforeTitle: "Before you can delete it",
  before: [
    "No book is being read or booked, and no payment or refund is in progress. Cancel or finish them first.",
    "Unused plan credits are given up. They aren't refunded.",
  ],
  deletedTitle: "What's deleted",
  deleted: [
    "Your name, email address and password, and links to Google or Facebook sign-in.",
    "Your profile, settings, notifications and the phones that get your notifications.",
  ],
  keptTitle: "What's kept",
  kept: [
    "Payment and booking records, without your name, for as long as the law and fraud prevention require.",
    "Security logs, for a limited time.",
    "Your reviews and book requests, shown as “Former reader”.",
  ],
  changeTitle: "Changed your mind?",
  change: "Sign in again within 14 days and your account stays exactly as it was.",
};

export default { privacy, terms, contact, deleteAccount };
