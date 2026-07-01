import "dotenv/config";
import { createApp } from "./app";
import { initializeDb } from "./shared/db";
import { initializeRedis } from "./shared/redis";
import { initializeRedlock } from "./shared/lock";
import { startReservationSweeper } from "./shared/reservationSweeper";
import { getQueueAdmissionLimit } from "./modules/queue/queue.service";

const port = process.env.PORT ?? "4000";

const assertProductionConfig = () => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev_secret") {
    console.error("JWT_SECRET must be set to a strong value in production.");
    process.exit(1);
  }

  if (!process.env.CLIENT_ORIGIN) {
    console.error("CLIENT_ORIGIN must be set in production.");
    process.exit(1);
  }
};

async function bootstrap() {
  assertProductionConfig();
  await initializeDb();
  await initializeRedis();
  initializeRedlock();
  startReservationSweeper();

  const app = createApp();
  app.listen(Number(port), () => {
    console.log(`Backend listening on http://localhost:${port}`);
    console.log(`Queue admission limit: ${getQueueAdmissionLimit()}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server", error);
  process.exit(1);
});
