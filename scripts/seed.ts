import "dotenv/config";
import { connectDB, getDbName } from "../src/lib/db";
import { SiteSettings } from "../src/models/SiteSettings";
import { Banner } from "../src/models/Banner";
import { Page } from "../src/models/Page";
import { seedSettings, seedBanners, seedPages } from "../src/content/seed";

async function seed() {
  await connectDB();
  console.log(`Seeding database: ${getDbName()}`);

  const existingSettings = await SiteSettings.findOne();
  if (!existingSettings) {
    await SiteSettings.create(seedSettings);
    console.log("Created SiteSettings");
  } else {
    console.log("SiteSettings already exists — skipped");
  }

  const bannerCount = await Banner.countDocuments();
  if (bannerCount === 0) {
    await Banner.insertMany(seedBanners);
    console.log(`Created ${seedBanners.length} banners`);
  } else {
    console.log("Banners already exist — skipped");
  }

  for (const page of seedPages) {
    await Page.findOneAndUpdate({ slug: page.slug }, page, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
  console.log(`Upserted ${seedPages.length} pages`);

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
