import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './lib/prisma.js';

const port = Number(process.env.PORT ?? 3001);
const server = app.listen(port, () => console.log(`Node API listening on http://localhost:${port}`));
async function shutdown() { server.close(); await prisma.$disconnect(); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

