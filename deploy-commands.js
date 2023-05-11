const fs = require('fs');

const { 
    REST, 
    Routes 
} = require('discord.js');

require("dotenv").config();
const Token = process.env.TOKEN;

const {
    clientId
} = require('./config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({
    version: '10'
}).setToken(Token);

rest.put(Routes.applicationCommands(clientId), {
        body: commands
    })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
