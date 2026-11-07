import { importHandler } from '#lib/server/handlers/import.js';

export const POST = importHandler((event) => event.params.source);
