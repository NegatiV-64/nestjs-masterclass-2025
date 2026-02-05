import { Controller, Get } from "@nestjs/common";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async searchEvents() {
    const events = await this.eventsService.listEvents();

    return {
      message: "successfully retrieved events",
      data: events,
    };
  }
}
