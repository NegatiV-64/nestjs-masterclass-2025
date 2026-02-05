import { Inject, Injectable } from "@nestjs/common";
import {
  type DatabaseClient,
  DatabaseService,
} from "../database/database.service";
import { eventsTable } from "../database/schema";

@Injectable()
export class EventsService {
  constructor(
    @Inject(DatabaseService) private readonly databaseService: DatabaseClient,
  ) {}

  listEvents() {
    return this.databaseService.select().from(eventsTable).all();
  }
}
