import { SlashCommandBuilder } from 'discord.js';

import { getTopMemoryLeaderboard } from '../services/memoryService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the Top 10 Number Memory leaderboard'),

  async execute(interaction) {
    const top = await getTopMemoryLeaderboard(10);

    if (!top.length) {
      await interaction.reply('No scores yet. Play `/memory` to get started!');
      return;
    }

    const lines = top.map((row, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
      return `${medal} <@${row.userId}> — best: **${row.bestDigits}** digits, wins: **${row.totalWins}**`;
    });

    await interaction.reply({
      content: `**Number Memory Top 10**\n${lines.join('\n')}`
    });
  }
};
