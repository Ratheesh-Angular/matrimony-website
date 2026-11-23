/**
 * Grant lifetime premium to a member by phone (for testing without Razorpay).
 * Usage: npm run grant-premium -- 9789878987
 */
import "dotenv/config";
import { connectDB, getDbName } from "../src/lib/db";
import { normalizePhone } from "../src/lib/member-auth";
import { Member } from "../src/models/Member";

async function main() {
  const raw = process.argv[2];
  if (!raw) {
    console.error("Usage: npm run grant-premium -- <10-digit phone>");
    process.exit(1);
  }

  const phone = normalizePhone(raw);
  if (!phone) {
    console.error(`Invalid phone: ${raw}`);
    process.exit(1);
  }

  await connectDB();
  console.log(`Database: ${getDbName()}`);

  const member = await Member.findOneAndUpdate(
    { phone },
    {
      $set: {
        isPremium: true,
        premiumPaidAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  if (!member) {
    console.error(
      `No member with phone ${phone}. Register at /register first, then run again.`,
    );
    process.exit(1);
  }

  console.log(`Premium granted: phone=${phone}, id=${member._id}, isPremium=true`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});