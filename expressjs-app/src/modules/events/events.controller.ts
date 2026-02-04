import {
  EventsSearchParamsDto,
  eventsSearchParamsDtoSchema,
} from "#/modules/events/dto/requests/events-search-params.dto";
import { EventsService } from "#/modules/events/events.service";
import { validateSearchParams } from "#/shared/validators/search-params.validator";
import { Router } from "express";

export const EventsController = Router();

EventsController.get(
  "/",
  validateSearchParams(eventsSearchParamsDtoSchema),
  async (req, res) => {
    const searchParams = req.query as unknown as EventsSearchParamsDto;

    const events = await EventsService.getEvents();

    return res.status(200).json({
      message: "Events retrieved successfully",
      data: events,
      searchParams,
    });
  }
);
