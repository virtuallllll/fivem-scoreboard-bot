const config = require('./configuration.json'); 
const FIVEM_API = require('discord-fivem-api');
const Discord = require('discord.js');
const client = new Discord.Client({"partials": ["MESSAGE", "USER", "REACTION"]});

client.on('ready', () => {
    setInterval(async() => {
        FIVEM_API.getServerInfo(config.fullIP).then(server => {
            let scoreboard = [];


            let i = 1;
            for(let p of server.players){
                let dID = [];
                for(let identifer of p.identifiers){
                    if(identifer.startsWith("discord:")){
                        dID.push(identifer.replace("discord:", ""));
                    }
                }

                scoreboard.push(` \`NAME: ${p.name}\`\ **|** \`\ID: ${p.id} \`\ **|** DISCORD: <@${dID}> **|** \`\`PING: ${p.ping}\`\` `);
            }

            const statusEmbed = new Discord.MessageEmbed()
                .setTitle(`Players (${server.players.length}/${server.infos.vars.sv_maxClients})`)
                .setColor("GREEN")
                .setDescription(`${server.players.length > 0 ? scoreboard.sort((a, b) => Number(a.split("ID:")[1].trim().split(" ")[0]) - Number(b.split("ID:")[1].trim().split(" ")[0])).join("\n") : "No players online."}`)
                .setFooter('Made By Nitay 🤖')
            if(client.channels.cache.get(config.statusChannel)) client.channels.cache.get(config.statusChannel).messages.fetch(config.messageID).then(
                msg => msg.edit(statusEmbed)
            )
        }).catch(e => {
            const statusEmbed = new Discord.MessageEmbed()
                .setTitle(`Server Is Offline.`)
                .setColor("RED")
                .setFooter('Made By Nitay 🤖')
            if(client.channels.cache.get(config.statusChannel)) client.channels.cache.get(config.statusChannel).messages.fetch(config.messageID).then(
                msg => msg.edit(statusEmbed)
            )
        })
    }, 1500)
})

client.on('message', async (message) => {
    if(message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();


    // empty embed command
    if(command == 'em'){
        if(!message.member.hasPermission("ADMINISTRATOR")) return;
        const a = await message.channel.send(new Discord.MessageEmbed().setDescription("..."));
    }

    if(command == 'ip'){
        FIVEM_API.getServerInfo(config.fullIP).then(server => {
            const e = new Discord.MessageEmbed()
                .setTitle("Ip Command: ")
                .addFields(
                    {
                        name: 'FiveM:', value: `**${config.fullIP}**`
                    },
                    {
                        name: 'Teamspeak:', value: `**${config.teamspeakIP}**`
                    },
                    {
                        name: 'Players:', value: `(${server.players.length}/${server.infos.vars.sv_maxClients})` ? server.players.length > 0 : "No Players Online."
                    }
                )
            message.channel.send(e);
        }).catch(error => error.message);
    }
})

client.login(config.token);