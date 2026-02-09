import { REST, Routes } from 'discord.js';

export async function registerCommands(commands) {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token) throw new Error('Missing DISCORD_TOKEN');
  if (!clientId) throw new Error('Missing CLIENT_ID');

  const rest = new REST({ version: '10' }).setToken(token);

  const body = commands.map((c) => c.data.toJSON());

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
    console.log(`Registered ${body.length} guild commands`);
    return;
  }

  await rest.put(Routes.applicationCommands(clientId), { body });
  console.log(`Registered ${body.length} global commands`);
}
