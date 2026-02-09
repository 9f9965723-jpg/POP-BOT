import { SlashCommandBuilder } from 'discord.js';

import { getGlobalSettings } from '../services/settingsService.js';

const WORDS = ['ocean', 'coffee', 'puzzle', 'rocket', 'canvas', 'winter', 'nebula', 'galaxy'];

export default {
  data: new SlashCommandBuilder()
    .setName('guess')
    .setDescription('Word guessing game: type the word first to win'),

  async execute(interaction) {
    const settings = await getGlobalSettings();
    if (!settings.guessEnabled) {
      await interaction.reply({ content: 'The Guess command is currently disabled.', ephemeral: true });
      return;
    }

    const word = WORDS[Math.floor(Math.random() * WORDS.length)];

    await interaction.reply({
      content: `Word Guessing Game started! Type this word to win: **${word}**\nYou have 30 seconds.`
    });

    const channel = interaction.channel;
    if (!channel || !channel.isTextBased()) return;

    const collector = channel.createMessageCollector({
      time: 30_000
    });

    collector.on('collect', async (msg) => {
      if (msg.author.bot) return;
      if (msg.content.trim().toLowerCase() !== word.toLowerCase()) return;

      collector.stop('winner');
      await channel.send(`Winner: <@${msg.author.id}> guessed the word!`);
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'winner') return;
      await channel.send(`No one guessed it in time. The word was **${word}**.`);
    });
  }
};
