var Discord = require("discord.js");
var config = require("../config.json");

module.exports.run = async (bot, message, args) => {

    //query user searched for
    var search = args.join(' ').toLowerCase()

    //list of potential matches
    var matches = [];


    //list of matches where name is raw
    var secondaryMatches = [];

    //character with exact match
    var bestGuess;

    ///Checks through all characters till a direct match is found
    characters.some(char => {
        var parsedName = char.name.toLowerCase();
        var rawName = char.rawName.toLowerCase().replace(",", "");
        if (parsedName == search || rawName == search || char.nativeName == search) { //direct match found
            bestGuess = char;
            return true;
        } else if (parsedName.startsWith(search) || char.nativeName.startsWith(search)) matches.push(char);
        else if (rawName.startsWith(search)) secondaryMatches.push(char);
    })


    if (typeof bestGuess != "undefined") sendChar(message, bestGuess);
    else if (matches.length == 1) sendChar(message, matches[0]);
    else if (matches.length == 0 && secondaryMatches.length > 0) sendChar(message, secondaryMatches[0]);
    else if (matches.length == 0) message.channel.send(`${message.author.toString()}, no character found.`)
    else {
        var text = `Matches for **${search}**:\n\n`;
        for (var i = 0; i < matches.length; i++) {
            text += `**${matches[i].name}** - ${matches[i].source}\n`;
            if (i == 25) {
                text += `\nAnd __${matches.length-25}__ more...`
                break;
            }
        }
        message.channel.send(text);
    }
}

function sendChar(message, character) {
    var characterEmbed = new Discord.MessageEmbed()
        .setColor("#a7eec9")
        .setTitle(character.name)
        .setDescription(`${character.source}\nLike Rank: #${character.likeRank}`)
        .setURL(character.characterPage)
        .setImage(character.image)

    message.channel.send(characterEmbed)
}
module.exports.help = {
    name: ["infomarry", "im"]
}