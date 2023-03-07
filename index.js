const Discord = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { Player } = require("discord-player");
const { GatewayIntentBits } = require("discord.js");

const TOKEN = process.env.TOKEN;

const LOAD_SLASH = process.argv[2] == "load";

const CLIENT_ID = "1077005173521657955";
const GUILD_ID = "1015424294626541638";

const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.slashcommands = new Discord.Collection();
client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});

let commands = [];

const slashFiles = fs
  .readdirSync("./slash")
  .filter((file) => file.endsWith(".js"));
for (const file of slashFiles) {
  const slashcmd = require(`./slash/${file}`);
  client.slashcommands.set(slashcmd.data.name, slashcmd);
  if (LOAD_SLASH) {
    commands.push(slashcmd.data.toJSON());
  }
}

if (LOAD_SLASH) {
  const rest = new REST({ version: "9" }).setToken(TOKEN);
  console.log("deploying slash commands");
  rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    })
    .then(() => {
      console.log("Successfully loaded");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else {
  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  client.interactionCreate = async (interaction) => {
    async function handleCommand() {
      if (!interaction.isCommand()) return;
      const slashcmd = client.slashcommands.get(interaction.commandName);
      if (!slashcmd) interaction.reply("invalid");

      await interaction.deferReply();
      await slashcmd.run({ client, interaction });
    }
    handleCommand();
  };
  client.login(TOKEN);
}
