import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

// Demo accounts for evaluating the app. Public registration always creates
// a "customer" — worker/admin accounts are provisioned here on purpose, so a
// regular signup can never grant itself elevated ticket-handling access
// without the invite code. One worker per category so the "matching workers"
// list on the New Ticket form always has someone to show.
const demoUsers = [
  { name: "Bilal (Billing)", email: "billing@relay.test", password: "worker1234", role: "worker", specialization: "Billing" },
  { name: "Ayesha (Technical)", email: "technical@relay.test", password: "worker1234", role: "worker", specialization: "Technical" },
  { name: "Hamza (Account)", email: "account@relay.test", password: "worker1234", role: "worker", specialization: "Account" },
  { name: "Sara (General)", email: "general@relay.test", password: "worker1234", role: "worker", specialization: "General" },
  { name: "RelaySupport Admin", email: "admin@relaysupport.test", password: "admin1234", role: "admin" },
];

const run = async () => {
  await connectDB();

  for (const demo of demoUsers) {
    const existing = await User.findOne({ email: demo.email });
    if (existing) {
      console.log(`↷ Skipped (already exists): ${demo.email}`);
      continue;
    }
    await User.create(demo);
    console.log(`✅ Created ${demo.role}: ${demo.email} / ${demo.password}`);
  }

  process.exit(0);
};

run().catch((error) => {
  console.error("❌ Seeding failed:", error.message);
  process.exit(1);
});
