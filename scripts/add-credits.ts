import { db } from '../lib/db/drizzle';
import { userCredits, users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function addCredits() {
  console.log('Adding 100 credits to all users...');

  // Get all users
  const allUsers = await db.select({ id: users.id, email: users.email }).from(users);

  console.log(`Found ${allUsers.length} users`);

  for (const user of allUsers) {
    // Check if user has credits record
    const [existing] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, user.id));

    if (existing) {
      // Update existing
      await db
        .update(userCredits)
        .set({ credits: 100, updatedAt: new Date() })
        .where(eq(userCredits.userId, user.id));
      console.log(`✓ Updated credits for ${user.email}: 100 credits`);
    } else {
      // Create new
      await db.insert(userCredits).values({
        userId: user.id,
        credits: 100,
      });
      console.log(`✓ Created credits for ${user.email}: 100 credits`);
    }
  }

  console.log('\nDone! All users have 100 credits.');
  process.exit(0);
}

addCredits().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
