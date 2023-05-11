const { 
    Events, 
    ActivityType 
} = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    execute(client) {
        console.log(`${client.user.tag} Bot is Ready!`);
        client.user.setActivity('Blue Film', { type: ActivityType.Playing });
    }
}