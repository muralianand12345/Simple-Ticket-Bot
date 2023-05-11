const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
    .setName('ticketmsg')
    .setDescription('Sends Ticket Message')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addStringOption(option => option
        .setName('text')
        .setDescription('Ticket Content')
        .setRequired(false)
    ),
    async execute(interaction, client) {

        const text = await interaction.options.getString("text") || "Click to open a ticket!";

        const embed = new EmbedBuilder()
        .setColor('Blue')
        .setDescription(text)

        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('open-ticket')
            .setLabel('Ticket')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Primary),
        );

        const TicketId = client.config.TicketChan;
        client.channels.cache.get(TicketId).send({ embeds: [embed], components: [button] });
        interaction.reply({ content: 'Sent!', ephemeral: true });
    }
}