import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Events
} from 'discord.js';

import { registerCommands } from './registerCommands.js';
import { loadCommands } from './loadCommands.js';

let client;

export function getClient() {
  return client;
}

export async function startBot() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    throw new Error('Missing DISCORD_TOKEN');
  }

  console.log('Starting Discord bot...');

  client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel]
  });

  client.commands = new Collection();

  client.on('warn', (m) => console.warn('[discord warn]', m));
  client.on('error', (e) => console.error('[discord error]', e));
  client.on('shardError', (e) => console.error('[discord shardError]', e));

  const commands = await loadCommands();
  for (const cmd of commands) {
    client.commands.set(cmd.data.name, cmd);
  }

  client.once(Events.ClientReady, async (c) => {
    console.log(`Logged in as ${c.user.tag}`);
    await registerCommands(commands);
  });

  client.on(Events.Invalidated, () => {
    console.error('Discord client invalidated (token revoked or session invalid).');
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      const content = 'Something went wrong while executing that command.';
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content, ephemeral: true }).catch(() => {});
      } else {
        await interaction.reply({ content, ephemeral: true }).catch(() => {});
      }
    }
  });

  try {
    await client.login(token);
    console.log('Discord login() resolved. Waiting for READY...');
  } catch (err) {
    console.error('Discord login failed. Check DISCORD_TOKEN.', err);
    throw err;
  }
}
