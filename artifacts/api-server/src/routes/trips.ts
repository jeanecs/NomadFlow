import { Router, type IRouter } from "express";
import { db, tripsTable, activitiesTable, insertTripSchema, insertActivitySchema } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/trips", async (_req, res) => {
  try {
    const trips = await db.select().from(tripsTable).orderBy(tripsTable.startDate);
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

router.post("/trips", async (req, res) => {
  try {
    const body = insertTripSchema.parse(req.body);
    const [trip] = await db.insert(tripsTable).values(body).returning();
    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid trip data" });
  }
});

router.get("/trips/:tripId", async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, tripId));
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const activities = await db
      .select()
      .from(activitiesTable)
      .where(eq(activitiesTable.tripId, tripId))
      .orderBy(activitiesTable.dayIndex, activitiesTable.startTime);

    res.json({ ...trip, activities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});

router.delete("/trips/:tripId", async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, tripId));
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    await db.delete(tripsTable).where(eq(tripsTable.id, tripId));
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

router.get("/trips/:tripId/activities", async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const dayIndex = req.query.dayIndex !== undefined ? parseInt(req.query.dayIndex as string, 10) : undefined;

    const conditions = dayIndex !== undefined
      ? and(eq(activitiesTable.tripId, tripId), eq(activitiesTable.dayIndex, dayIndex))
      : eq(activitiesTable.tripId, tripId);

    const activities = await db
      .select()
      .from(activitiesTable)
      .where(conditions)
      .orderBy(activitiesTable.startTime);

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

router.post("/trips/:tripId/activities", async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const body = insertActivitySchema.parse({ ...req.body, tripId });
    const [activity] = await db.insert(activitiesTable).values(body).returning();
    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid activity data" });
  }
});

router.put("/trips/:tripId/activities/:activityId", async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    const tripId = parseInt(req.params.tripId, 10);
    const { title, category, startTime, endTime, location, notes } = req.body;
    const body = { title, category, startTime, endTime, location, notes };

    const [activity] = await db
      .update(activitiesTable)
      .set(body)
      .where(and(eq(activitiesTable.id, activityId), eq(activitiesTable.tripId, tripId)))
      .returning();

    if (!activity) return res.status(404).json({ error: "Activity not found" });
    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid activity data" });
  }
});

router.delete("/trips/:tripId/activities/:activityId", async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    const tripId = parseInt(req.params.tripId, 10);

    const [activity] = await db
      .select()
      .from(activitiesTable)
      .where(and(eq(activitiesTable.id, activityId), eq(activitiesTable.tripId, tripId)));

    if (!activity) return res.status(404).json({ error: "Activity not found" });

    await db.delete(activitiesTable).where(eq(activitiesTable.id, activityId));
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

export default router;
