import 'dotenv/config';
import { env } from './config/env';
import { connectDB } from './config/db';
import { Location } from './models/Location';
import { LOCATION_DEFAULTS } from './config/constants';
import app from './app';

async function seedLocations() {
  for (const loc of LOCATION_DEFAULTS) {
    await Location.findOneAndUpdate(
      { code: loc.code },
      { $setOnInsert: { ...loc, isActive: true } },
      { upsert: true }
    );
  }
  console.log('Locations seeded');
}

async function main() {
  await connectDB();
  await seedLocations();
  app.listen(Number(env.PORT), () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
  });
}

main().catch(console.error);
