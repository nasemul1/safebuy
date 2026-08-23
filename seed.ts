import { db } from "./src/lib/db";
import {
  users,
  reports,
  evidence,
  comments,
  votes,
} from "./src/lib/db/schema";
import { hashPassword } from "./src/lib/auth";

async function seed() {
  console.log("Seeding database...");

  // Create users
  const hashedPassword = await hashPassword("password123");

  const [admin] = await db
    .insert(users)
    .values({
      name: "Admin User",
      email: "admin@safebuy.com",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: true,
    })
    .returning();

  const [moderator] = await db
    .insert(users)
    .values({
      name: "Moderator User",
      email: "mod@safebuy.com",
      password: hashedPassword,
      role: "MODERATOR",
      emailVerified: true,
    })
    .returning();

  const [regularUser] = await db
    .insert(users)
    .values({
      name: "Regular User",
      email: "user@safebuy.com",
      password: hashedPassword,
      role: "USER",
      emailVerified: true,
    })
    .returning();

  console.log("Created users:", admin.email, moderator.email, regularUser.email);

  // Create reports
  const reportData = [
    {
      title: "Fake iPhone seller on Facebook",
      description:
        "Seller claimed to sell original iPhone 15 Pro Max at 50% discount. After payment via bank transfer, seller blocked me and deleted the Facebook page.",
      platform: "Facebook" as const,
      sellerName: "TechDeals BD",
      sellerUrl: "https://facebook.com/techdealsbd",
      status: "VERIFIED" as const,
      userId: regularUser.id,
    },
    {
      title: "Daraz seller sent wrong product",
      description:
        "Ordered a Samsung Galaxy S24 but received a cheap knockoff. Seller refused to accept return. Daraz support was unhelpful.",
      platform: "Daraz" as const,
      sellerName: "MobileHub Official",
      sellerUrl: "https://daraz.pk/sellers/mobilehub",
      status: "PENDING" as const,
      userId: regularUser.id,
    },
    {
      title: "Instagram scam - fake brand store",
      description:
        "Instagram page 'LuxuryBrandOutlet' selling fake designer bags. Payment via WhatsApp. Product never delivered.",
      platform: "Instagram" as const,
      sellerName: "LuxuryBrandOutlet",
      status: "UNDER_REVIEW" as const,
      userId: moderator.id,
    },
    {
      title: "WhatsApp fraud - job scam",
      description:
        "Received WhatsApp message about work from home job. Asked for registration fee of 5000 BDT. After payment, no response.",
      platform: "WhatsApp" as const,
      sellerName: "QuickCash Jobs",
      status: "REJECTED" as const,
      userId: regularUser.id,
    },
    {
      title: "Fake electronics website",
      description:
        "Website 'cheapElectronics.com' advertises wholesale prices. Took payment but never delivered. Website now down.",
      platform: "Website" as const,
      sellerName: "Cheap Electronics",
      sellerUrl: "https://cheapelectronics.com",
      status: "VERIFIED" as const,
      userId: admin.id,
    },
    {
      title: "Instagram seller delivered damaged goods",
      description:
        "Ordered sneakers from Instagram seller. Received damaged shoes with no return policy. Seller blocks complaints.",
      platform: "Instagram" as const,
      sellerName: "SneakerKing BD",
      status: "PENDING" as const,
      userId: regularUser.id,
    },
    {
      title: "Facebook marketplace furniture scam",
      description:
        "Paid advance for furniture on Facebook Marketplace. Seller asked for full payment before delivery. Never received items.",
      platform: "Facebook" as const,
      sellerName: "HomeFurnish Deals",
      status: "PENDING" as const,
      userId: moderator.id,
    },
    {
      title: "Other platform - Telegram group scam",
      description:
        "Telegram crypto investment group promised 300% returns in 24 hours. After investing 20000 BDT, group admin disappeared.",
      platform: "Other" as const,
      sellerName: "CryptoGains Official",
      status: "UNDER_REVIEW" as const,
      userId: regularUser.id,
    },
  ];

  const createdReports = await db.insert(reports).values(reportData).returning();
  console.log(`Created ${createdReports.length} reports`);

  // Create evidence
  const evidenceData = [
    { reportId: createdReports[0].id, url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", type: "SCREENSHOT" as const },
    { reportId: createdReports[0].id, url: "https://res.cloudinary.com/demo/image/upload/sample2.jpg", type: "CHAT_PROOF" as const },
    { reportId: createdReports[1].id, url: "https://res.cloudinary.com/demo/image/upload/sample3.jpg", type: "INVOICE" as const },
    { reportId: createdReports[2].id, url: "https://res.cloudinary.com/demo/image/upload/sample4.jpg", type: "SCREENSHOT" as const },
    { reportId: createdReports[4].id, url: "https://res.cloudinary.com/demo/image/upload/sample5.jpg", type: "SCREENSHOT" as const },
  ];

  await db.insert(evidence).values(evidenceData);
  console.log(`Created ${evidenceData.length} evidence records`);

  // Create comments
  const commentData = [
    { reportId: createdReports[0].id, userId: moderator.id, content: "This seller has multiple complaints. Verified." },
    { reportId: createdReports[0].id, userId: admin.id, content: "Report verified. Seller has been reported to authorities." },
    { reportId: createdReports[1].id, userId: regularUser.id, content: "Same thing happened to me with this seller!" },
    { reportId: createdReports[2].id, userId: regularUser.id, content: "I almost fell for this. Thanks for posting." },
    { reportId: createdReports[4].id, userId: moderator.id, content: "Website confirmed down. Scam verified." },
  ];

  await db.insert(comments).values(commentData);
  console.log(`Created ${commentData.length} comments`);

  // Create votes
  const voteData = [
    { reportId: createdReports[0].id, userId: moderator.id, voteType: "CONFIRM" as const },
    { reportId: createdReports[0].id, userId: admin.id, voteType: "CONFIRM" as const },
    { reportId: createdReports[1].id, userId: regularUser.id, voteType: "CONFIRM" as const },
    { reportId: createdReports[4].id, userId: regularUser.id, voteType: "CONFIRM" as const },
  ];

  await db.insert(votes).values(voteData);
  console.log(`Created ${voteData.length} votes`);

  console.log("Seed complete!");
}

seed().catch(console.error);
