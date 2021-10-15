const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const clientId = "898341649233621073";
const token = "";

const commands = [
  new SlashCommandBuilder().setName("join").setDescription("Joins your channel"),
  new SlashCommandBuilder()
    .setName("testing")
    .setDescription("This is fake")
    .addStringOption(option => option.setName("song").setDescription("Song name")),
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play song")
    .addStringOption(option => option.setName("song").setDescription("Song name"))
    .addStringOption(option => option.setName("url").setDescription("Youtube URL")),
  new SlashCommandBuilder().setName("skip").setDescription("Skips the current song"),
  new SlashCommandBuilder().setName("disconnect").setDescription("Stops playing and leaves channel"),
  new SlashCommandBuilder().setName("queue").setDescription("Lists off current queue"),
  new SlashCommandBuilder().setName("nowplaying").setDescription("Displays current song")
].map(command => command.toJSON());

const fakecmds = [];

const rest = new REST({ version: "9" }).setToken(token);

rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
