import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { EventsService } from "./events.service";
import { AuthTokenGuard } from "#/shared/guards/auth-token.guard";
import { RoleGuard, Roles } from "#/shared/guards/role.guard";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles("admin")
  @UseGuards(AuthTokenGuard, RoleGuard)
  createEvent() {
    return {
      message: "Event created successfully",
    };
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  async searchEvents() {
    const events = await this.eventsService.listEvents();

    return {
      message: "successfully retrieved events",
      data: events,
    };
  }
}
