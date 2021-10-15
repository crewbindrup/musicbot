const fs = require("fs");
const ytdl = require("ytdl-core");
const { Client, Intents } = require("discord.js");
const axios = require("axios");

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
const {
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  getVoiceConnection
} = require("@discordjs/voice");

const token = "";
const ytapikey = "";

var player = createAudioPlayer();
var queue = [];

player.on(AudioPlayerStatus.Idle, async () => await playNext());

client.once("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "join") {
    await join(interaction);
  } else if (interaction.commandName === "play") {
    await play(interaction);
  } else if (interaction.commandName === "skip") {
    await skip(interaction);
  } else if (interaction.commandName === "disconnect") {
    await disconnect(interaction);
  } else if (interaction.commandName === "queue") {
    interaction.reply({ content: "This is not complete", ephemeral: true });
  } else if (interaction.commandName === "nowplaying") {
    interaction.reply({ content: "This is not complete", ephemeral: true });
  } else if (interaction.commandName === "testing") {
    await testing(interaction);
  }
});

async function testing(interaction) {
  const song = interaction.options.getString("song");
  await interaction.deferReply({ ephemeral: true });
  await interaction.editReply({ content: "tried", ephemeral: true });
}

async function disconnect(interaction) {
  let connection = getVoiceConnection(interaction.guildId);
  if (!connection) {
    await interaction.reply({ content: "I am not in a voice channel!", ephemeral: true });
    return;
  }
  connection.destroy();
  queue = [];
  player.stop();
  await interaction.reply({ content: "Disconnected", ephemeral: true });
}

async function skip(interaction) {
  if (!interaction.guild) {
    interaction.reply("Please only use this in a server.");
    return;
  }
  interaction.reply({ content: "Song skipped", ephemeral: true });
  player.stop();
}

async function join(interaction) {
  if (!interaction.guild) {
    interaction.reply("Please only use this in a server.");
    return;
  }
  if (!interaction.member.voice.channel) {
    interaction.reply({ content: "Please join a voice channel!", ephemeral: true });
    return;
  }
  let connection = getVoiceConnection(interaction.guildId);
  if (connection) connection.destroy();
  connection = joinVoiceChannel({
    channelId: interaction.member.voice.channel.id,
    guildId: interaction.guildId,
    adapterCreator: interaction.guild.voiceAdapterCreator
  });
  connection.subscribe(player);
  interaction.reply({ content: "Joined", ephemeral: true });
}

async function playNext() {
  console.log("Next play requested");
  if (queue.length > 0) {
    playSong(queue.shift());
  }
  // console.log(player.state.status);
}

async function play(interaction) {
  const connection = getVoiceConnection(interaction.guildId);
  if (!connection) {
    interaction.reply({ content: "I need to be in a voice channel!", ephemeral: true });
    return;
  }

  const song = interaction.options.getString("song");
  const url = interaction.options.getString("url");
  let songurl;
  //TODO make song do a yt search, pull url, pull id
  //TODO make the bot respond with "Now playing (song) or Added (song) to queue"
  if (url) {
    songurl = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (!songurl) {
      interaction.reply({ content: "Please use a valid youtube video url", ephemeral: true });
    }
  }

  if (player.state.status === "playing") {
    if (url) {
      queue.push(songurl[1]);
      await interaction.reply({ content: "Added to queue", ephemeral: true });
    } else if (song) {
      const { title, videoId } = await searchSong(song);
      queue.push(videoId);
      await interaction.reply({ content: `Added ${title} to queue`, ephemeral: true });
    }
  } else {
    if (url) {
      playSong(songurl[1]);
      await interaction.reply({ content: "Now playing", ephemeral: true });
    } else if (song) {
      const { title, videoId } = await searchSong(song);
      playSong(videoId);
      await interaction.reply({ content: `Now playing ${title}`, ephemeral: true });
    }
  }
}

async function playSong(videoid) {
  const stream = ytdl(`http://www.youtube.com/watch?v=${videoid}`, { filter: "audioonly" });
  const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
  player.play(resource);
}

async function searchSong(song) {
  const { data } = await axios.get(`https://youtube.googleapis.com/youtube/v3/search`, {
    params: {
      part: "snippet",
      maxResults: 1,
      q: song,
      key: ytapikey
    }
  });
  return { title: data.items[0].snippet.title, videoId: data.items[0].id.videoId };
  // console.log(data.items[0].snippet.title);
}

client.login(token);

// ytdl("http://www.youtube.com/watch?v=NK7WWbXlkj4", { filter: "audioonly" }).pipe(
//   fs.createWriteStream("audio.mp3"),
//   "mp3"
// );

// const connection = joinVoiceChannel({
// 	channelId: voiceChannel.id,
// 	guildId: guild.id,
// 	adapterCreator: guild.voiceAdapterCreator,
// });

// const stream = ytdl('youtube link', { filter: 'audioonly' });
// const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
// const player = createAudioPlayer();

// player.play(resource);
// connection.subscribe(player);

// player.on(AudioPlayerStatus.Idle, () => connection.destroy());
