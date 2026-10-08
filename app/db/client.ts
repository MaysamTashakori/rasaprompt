// بدون DATABASE_URL: PGlite لوکال (بدون Docker). با DATABASE_URL: Postgres واقعی.
import path from "node:path"
import * as schema from "./schema"

export async function getDb() {
  const url = process.env.DATABASE_URL
  const migrationsFolder = path.join(process.cwd(), "db/migrations")
  if (url) {
    const { drizzle } = await import("drizzle-orm/node-postgres")
    const { migrate } = await import("drizzle-orm/node-postgres/migrator")
    const db = drizzle(url, { schema })
    await migrate(db, { migrationsFolder })
    return db as unknown as Awaited<ReturnType<typeof getPglite>>
  }
  return getPglite(migrationsFolder)
}

async function getPglite(migrationsFolder = path.join(process.cwd(), "db/migrations")) {
  const { PGlite } = await import("@electric-sql/pglite")
  const { vector } = await import("@electric-sql/pglite-pgvector")
  const { drizzle } = await import("drizzle-orm/pglite")
  const { migrate } = await import("drizzle-orm/pglite/migrator")
  const client = new PGlite(process.env.PGLITE_DIR ?? "memory://", { extensions: { vector } })
  const db = drizzle(client, { schema })
  await migrate(db, { migrationsFolder })
  return db
}
