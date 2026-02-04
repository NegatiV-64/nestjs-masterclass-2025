import { DataSource } from "typeorm";
import { faker } from "@faker-js/faker";

export class DbClient {
  public readonly connection = new DataSource({
    type: "sqlite",
    database: "./database/data.db",
    logging: false,
  });

  public async init() {
    await this.connection.initialize();
  }

  public async execute<T, K = unknown>(
    query: string,
    params?: K[]
  ): Promise<T[]> {
    const queryRunner = this.connection.createQueryRunner();

    try {
      const result = await queryRunner.query(query, params);

      return result;
    } finally {
      await queryRunner.release();
    }
  }
}

export const db = new DbClient();

export async function seed() {
  const mockData = Array.from({ length: 5 }).map(() => ({
    event_id: faker.string.uuid(),
    event_name: `${faker.word.adjective()} ${faker.word.noun()}`,
    event_description: faker.lorem.paragraph(3),
    event_location: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()} ${faker.location.zipCode()}`,
    event_date: faker.date
      .future()
      .toISOString()
      .replace("T", " ")
      .replace("Z", ""),
  }));

  await db.execute("BEGIN TRANSACTION;");

  for (const event of mockData) {
    await db.execute(
      `INSERT INTO events (event_id, event_name, event_description, event_location, event_date) VALUES (?, ?, ?, ?, ?);`,
      [
        event.event_id,
        event.event_name,
        event.event_description,
        event.event_location,
        event.event_date,
      ]
    );
  }

  await db.execute("COMMIT;");
}
