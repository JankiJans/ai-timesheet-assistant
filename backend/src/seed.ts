// backend/src/seed.ts
import { prisma } from './prisma.js';

async function main() {
  console.log("Rozpoczynam wgrywanie projektów do bazy MySQL...");

  // Funkcja createMany dodaje wiele rekordów naraz
  await prisma.job.createMany({
    data: [
      { jobNumber: "JOB-001", title: "Brand X", status: "active" },
      { jobNumber: "JOB-002", title: "System logowania", status: "active" },
      { jobNumber: "JOB-003", title: "Strona WWW", status: "closed" },
      { jobNumber: "JOB-004", title: "Słoń", status: "active" },
      { jobNumber: "JOB-005", title: "Aplikacja mobilna", status: "active" }
    ],
    // Jeśli skrypt odpalimy dwa razy, nie wywali błędu o duplikatach
    skipDuplicates: true 
  });

  console.log("✅ Gotowe! Projekty są w bazie danych.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Na koniec zamykamy połączenie
    await prisma.$disconnect();
  });