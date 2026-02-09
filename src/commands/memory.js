import { SlashCommandBuilder } from 'discord.js';

import { getGlobalSettings } from '../services/settingsService.js';
import { recordMemoryWin } from '../services/memoryService.js';

function randomDigits(len) {
  let out = '';
  for (let i = 0; i < len; i += 1) {
    out += Math.floor(Math.random() * 10);
  }
  return out;
}

export default {
  data: new SlashCommandBuilder()
    .setName('memory')
    .setDescription('Number memory game: memorize the number, then type it after it disappears')
    .addIntegerOption((opt) =>
      opt
        .setName('digits')
        .setDescription('How many digits (default 6, max 12)')
        .setMinValue(3)
        .setMaxValue(12)
        .setRequired(false)
    ),

  async execute(interaction) {
    const settings = await getGlobalSettings();
    if (!settings.memoryEnabled) {
      await interaction.reply({ content: 'The Memory command is currently disabled.', ephemeral: true });
      return;
    }

    const digits = interaction.options.getInteger('digits') ?? 6;
    const secret = randomDigits(digits);

    await interaction.reply({ content: `Memorize this number (deletes in 5 seconds): **${secret}**` });

    const channel = interaction.channel;
    if (!channel || !channel.isTextBased()) return;

    const botMsg = await interaction.fetchReply();

    setTimeout(() => {
      botMsg.delete().catch(() => {});
    }, 5000);

    const collector = channel.createMessageCollector({ time: 30_000 });

    collector.on('collect', async (msg) => {
      if (msg.author.bot) return;

      if (msg.content.trim() !== secret) return;

      collector.stop('winner');

      await recordMemoryWin({ userId: msg.author.id, digits });
      await channel.send(`Correct! <@${msg.author.id}> wins (+${digits} digits).`);
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'winner') return;
      await channel.send(`Time's up. The number was **${secret}**.`);
    });
  }
};
