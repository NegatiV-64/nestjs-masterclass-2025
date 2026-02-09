import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class EventsService {
  constructor(private readonly databaseService: DatabaseService) {}

  listEvents() {
    return this.databaseService.db.query.eventsTable.findMany();
  }
}
