// ========== EXTRACT REQUIRED CLASSES/LIBRARIES ==========
// for reading files:
const fs = require('fs');
// https://discord.js.org/#/docs/main/stable/general/welcome
const { Client, RichEmbed } = require('discord.js');
// https://www.npmjs.com/package/roll
const Roll = require('roll'), roll = new Roll();
// http://unirest.io/nodejs
const unirest = require('unirest');

// RAPID API KEY
// using https://www.wordsapi.com/
const rapidKey = "<token here>";

// DISCORD STUFF
const token = "<token here>";
const client = new Client();

// ========== COMMANDS ==========

const rollCmd = '!roll';
const defCmd = '!define';
const synCmd = '!synonyms';
const mag8Cmd = '!magic8';
const antCmd = '!antonyms';
const exmCmd = '!examples';
const lennyCmd = '!lenny';

// ========== FUNCTIONS ==========

function GetDefinitions(result) {
  var defStr = "";
  for (let i = 0; i < result.body.definitions.length; i++) {
    defStr += "**" + (i+1) + "**\n*" + result.body.definitions[i].partOfSpeech + ".* " + result.body.definitions[i].definition + ".\n";
  }
  return defStr;
}

function GetSynonyms(result) {
  var synStr = "";
  for (let i = 0; i < result.body.synonyms.length; i++) {
    synStr += result.body.synonyms[i];
    if (i != result.body.synonyms.length - 1) {
      synStr += ", ";
    }
  }
  if (synStr.length == 0) {
    synStr = "No synonyms found!";
  }
  return synStr;
}

function GetAntonyms(result) {
  var antStr = "";
  for (let i = 0; i < result.body.antonyms.length; i++) {
    antStr += result.body.antonyms[i];
    if (i != result.body.antonyms.length - 1) {
      antStr += ", ";
    }
  }
  if (antStr.length == 0) {
    antStr = "No antonyms found!";
  }
  return antStr;
}

function GetExamples(result) {
  var exmStr = "";
  for (let i = 0; i < result.body.examples.length; i++) {
    exmStr += result.body.examples[i];
    if (i != result.body.examples.length - 1) {
      exmStr += "\n";
    }
  }
  if (exmStr.length == 0) {
    exmStr = "No examples found!";
  }
  return exmStr;
}

function GetAnswer() {
  var data = fs.readFileSync('config/magic8.txt', 'utf8');
  var answers = data.toString().split("\n");
  return answers[Math.floor(Math.random() * answers.length)];
}

function HelpMessage() {
  var helpEmbed = new RichEmbed()
  .setTitle("Command List:")
  .addField("!define <word>", "Defines a word")
  .addField("!synonyms <word>", "Provides synonyms for a word")
  .addField("!antonyms <word>", "Provides antonyms for a given word")
  .addField("!examples <word>", "Provides examples for a given word")
  .addField("!magic8 <question>", "Provides yes/no/maybe answers")
  .addField("!roll <roll>", "Rolls dice, default d20");
  return helpEmbed;
}

// ========== START BOT ==========

// READY EVENT - DO NOT REMOVE
client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  // LENNY
  if (message.content.startsWith(lennyCmd)) {
    message.channel.send('( ͡° ͜ʖ ͡°)');
  }

  // ROLL DICE
  if (message.content.startsWith(rollCmd)) {
    var str = message.content.substr(rollCmd.length + 1);
    str = str.replace(/ /g, "");
    if (str === "") {
      str = "d20";
    }
    valid = roll.validate(str);
    if (valid) {
      var newRoll = roll.roll(str);

      const embed2 = new RichEmbed()
        .setTitle('Dice Roll')
        .setColor(0xA561CB)
        .setDescription(str)
        .addField('Rolls', newRoll.rolled, true);
      
      if (str.includes('b')) {
        embed2.addField('Best', newRoll.calculations[1], true);
      }
        embed2.addField('Total', newRoll.result, true);
      
      message.channel.send(embed2);  
    }
    else {
      message.channel.send('Not a valid dice roll!');
    }
  }
  
  // YES/NO ANSWERS
  if (message.content.startsWith(mag8Cmd)) {
    try {  
      message.channel.send(GetAnswer());
    } catch(e) {
      console.log('Error:', e.stack);
      message.channel.send('Something went wrong. Try again later?');
    }
  }

  // DEFINE A GIVEN WORD
  if (message.content.startsWith(defCmd)) {
    var str = message.content.substr(defCmd.length + 1);
    unirest.get("https://wordsapiv1.p.mashape.com/words/" + str + "/definitions")
    .header("X-Mashape-Key", rapidKey)
    .header("Accept", "application/json")
    .end(function (result) {
      try {
        let embedWord = new RichEmbed()
        .setColor(0x49A550)
        .setFooter('Results for "' + result.body.word + '"')
        .addField("Definitions", GetDefinitions(result));
        message.channel.send(embedWord);
      }
      catch(err) {
        message.channel.send("Error: " + result.body.message);
      }
    });
  }

  // SYNONYMS FOR A GIVEN WORD
  if (message.content.startsWith(synCmd)) {
    var str = message.content.substr(synCmd.length + 1);
    unirest.get("https://wordsapiv1.p.mashape.com/words/" + str + "/synonyms")
    .header("X-Mashape-Key", rapidKey)
    .header("Accept", "application/json")
    .end(function (result) {
      try {
        let embedWord = new RichEmbed()
        .setColor(0x4890DD)
        .setFooter('Results for "' + result.body.word + '"')
        .addField("Synonyms", GetSynonyms(result));
        message.channel.send(embedWord);
      }
      catch(err) {
        message.channel.send("Error: " + result.body.message);
      }

    });
  }

  // ANTONYMS FOR A GIVEN WORD
  if (message.content.startsWith(antCmd)) {
    var str = message.content.substr(antCmd.length + 1);
    unirest.get("https://wordsapiv1.p.mashape.com/words/" + str + "/antonyms")
    .header("X-Mashape-Key", rapidKey)
    .header("Accept", "application/json")
    .end(function (result) {
      try {
        let embedWord = new RichEmbed()
        .setColor(0xE46464)
        .setFooter('Results for "' + result.body.word + '"')
        .addField("Antonyms", GetAntonyms(result));
        message.channel.send(embedWord);
      }
      catch(err) {
        message.channel.send("Error: " + result.body.message);
      }

    });
  }

  // EXAMPLES FOR A GIVEN WORD
  if (message.content.startsWith(exmCmd)) {
    var str = message.content.substr(exmCmd.length + 1);
    unirest.get("https://wordsapiv1.p.mashape.com/words/" + str + "/examples")
    .header("X-Mashape-Key", rapidKey)
    .header("Accept", "application/json")
    .end(function (result) {
      try {
        let embedWord = new RichEmbed()
        .setColor(0x895BB6)
        .setFooter('Results for "' + result.body.word + '"')
        .addField("Examples", GetExamples(result));
        message.channel.send(embedWord);
      }
      catch(err) {
        message.channel.send("Error: " + result.body.message);
      }

    });
  }

  if (message.content.startsWith('!help')) {
    message.channel.send(HelpMessage());
  }

});

client.login(token);