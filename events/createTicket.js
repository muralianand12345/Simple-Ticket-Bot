const {
    Events,
    PermissionFlagsBits,
    ChannelType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {

        if (!interaction.isButton()) return;
        if (interaction.customId == "open-ticket") {

            if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
                interaction.reply({
                    content: 'You have already created a ticket!',
                    ephemeral: true
                }).catch(err => console.log(err));
                return;
            };

            await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                parent: client.config.Ticket.Category,
                topic: interaction.user.id,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: client.config.Ticket.SupportId,
                        allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                ],
                type: ChannelType.GuildText
            }).then(async (chan) => {
                await interaction.reply({
                    content: `Ticket has been created! <#${chan.id}>`,
                    ephemeral: true
                }).catch(err => console.error(err));

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`Ticket has been opened by <@${interaction.user.id}>`)
                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close-ticket')
                            .setLabel('Close ticket')
                            .setStyle(ButtonStyle.Danger),
                    )

                await chan.send({
                    embeds: [embed],
                    components: [button]
                }).catch(err => console.error(err));
            });
        }

        if (interaction.customId == "close-ticket") {

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm-close')
                        .setLabel('Close ticket')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('confirm-no')
                        .setLabel('Cancel closure')
                        .setStyle(ButtonStyle.Secondary)
                )

            verify = await interaction.reply({
                content: 'Are you sure you want to close the ticket?',
                components: [button]
            });

            const collector = verify.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 15000,
                //max: "1",
            });

            collector.on('collect', async (i) => {
                if (interaction.user.id === i.user.id) {

                    if (i.customId == 'confirm-close') {
                        await i.update({
                            content: `Ticket has been closed!`,
                            components: []
                        });

                        interaction.channel.edit({
                            name: 'ticket-closed',
                            parent: client.config.Ticket.Closed,
                            permissionOverwrites: [
                                {
                                    id: interaction.user.id,
                                    deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]
                                },
                                {
                                    id: client.config.Ticket.SupportId,
                                    allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]
                                },
                                {
                                    id: interaction.guild.roles.everyone,
                                    deny: [PermissionFlagsBits.ViewChannel]
                                },
                            ],
                        }).then(async () => {
                            const embed = new EmbedBuilder()
                                .setDescription('Verify Ticket and Close!')
                            const button = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('delete-ticket')
                                        .setLabel('Delete Ticket')
                                        .setEmoji('🗑️')
                                        .setStyle(ButtonStyle.Danger),
                                )

                            await interaction.channel.send({
                                embeds: [embed],
                                components: [button]
                            });
                        });
                        collector.stop();
                    }

                    if (i.customId == 'confirm-no') {
                        await i.update({
                            content: 'Ticket closure cancelled!',
                            components: []
                        });
                        collector.stop();
                    }
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size <= 0) {
                    await interaction.editReply({
                        content: 'Closing of the ticket canceled',
                        components: []
                    });
                }
            });
        }

        if (interaction.customId == 'delete-ticket') {
            const guild = client.guilds.cache.get(interaction.guildId);
            const chan = guild.channels.cache.get(interaction.channelId);
            interaction.reply("Deleting Channel!");
            setTimeout(async () => await chan.delete(), 5000);
        }
    }
}