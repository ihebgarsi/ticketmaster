import "dotenv/config";
import { createApp } from "./app";
import { initializeDb } from "./shared/db";
import { initializeRedis } from "./shared/redis";
import { initializeRedlock } from "./shared/lock";
import { startReservationSweeper } from "./shared/reservationSweeper";
import { getQueueAdmissionLimit } from "./modules/queue/queue.service";

const port = process.env.PORT ?? "4000";

async function bootstrap() {
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
