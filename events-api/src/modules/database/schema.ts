import { sql } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";

import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const eventsTable = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  date: timestamp("date", {
    withTimezone: true,
  }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .default(sql`(NOW())`),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .default(sql`(NOW())`),
});

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .default(sql`(NOW())`),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .default(sql`(NOW())`),
});
