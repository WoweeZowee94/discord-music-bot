const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("skips the current track"),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);

    if (!queue)
      return await interaction.editReply("There are no songs in the queue");

    let currentSong = queue.current;

    queue.skip();
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`${currentSong} has been skipped`)
          .setThumbnail(currentSong.thumbnail),
      ],
    });
  },
};
