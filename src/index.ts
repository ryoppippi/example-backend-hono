import { Hono } from "hono";
import { onRequestPost } from "./agent";

const app = new Hono();

app.post("/agent", ...onRequestPost);

export default app;
