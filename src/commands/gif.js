import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

import { getGlobalSettings } from '../services/settingsService.js';

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

function randomId() {
  return crypto.randomBytes(8).toString('hex');
}

async function downloadToFile(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outPath, buf);
}

export default {
  data: new SlashCommandBuilder()
    .setName('gif')
    .setDescription('Convert an image/video attachment to a GIF')
    .addAttachmentOption((opt) =>
      opt.setName('file').setDescription('Image or video attachment').setRequired(true)
    ),

  async execute(interaction) {
    const settings = await getGlobalSettings();
    if (!settings.gifEnabled) {
      await interaction.reply({ content: 'The GIF command is currently disabled.', ephemeral: true });
      return;
    }

    const attachment = interaction.options.getAttachment('file', true);

    await interaction.deferReply();

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gif-'));
    const inputPath = path.join(tmpDir, `input-${randomId()}`);
    const outputPath = path.join(tmpDir, `output-${randomId()}.gif`);

    try {
      await downloadToFile(attachment.url, inputPath);

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            '-vf',
            'fps=12,scale=480:-1:flags=lanczos',
            '-loop',
            '0'
          ])
          .toFormat('gif')
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });

      const file = new AttachmentBuilder(outputPath, { name: 'converted.gif' });
      await interaction.editReply({ files: [file] });
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
};
