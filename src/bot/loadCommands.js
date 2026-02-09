import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands() {
  const commandsDir = path.resolve(__dirname, '../commands');
  const files = await fs.readdir(commandsDir);

  const commandFiles = files.filter((f) => f.endsWith('.js'));

  const commands = [];
  for (const file of commandFiles) {
    const modUrl = pathToFileURL(path.join(commandsDir, file)).href;
    const command = (await import(modUrl)).default;
    commands.push(command);
  }

  return commands;
}
