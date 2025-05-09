import { Hono } from 'hono';
import { onRequestPost as onRequestPostAgent } from './agent';
import { onRequestPost as onRequestPostAuthorize } from './authorize';
import { cors } from 'hono/cors'

const app = new Hono();

app.post('/agent', onRequestPostAgent);

app.use('/authorize', cors())
app.post('/authorize', onRequestPostAuthorize);


export default app;
