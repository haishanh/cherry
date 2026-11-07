import { importHandler } from '#lib/server/handlers/import.js';

// Retain the original Pocket endpoint for older clients.
export const POST = importHandler(() => 'pocket');
