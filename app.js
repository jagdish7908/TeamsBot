var restify = require('restify');
var builder = require('botbuilder');

var CONSTANTS = {
    INTRO_MSG: "Hi, I'm Jarvis 🙂. I'll help in automating some routine tasks such as checking project score, dashboard, etc. I'm still under development. I'll meet you soon in your teams channel ✌️! Try sending @update or @intro",
    BOT_NAME: "Jarvis"
};

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Bot Storage: Here we register the state storage for your bot. 
// Default store: volatile in-memory store - Only for prototyping!
// We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
// For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
var inMemoryStorage = new builder.MemoryBotStorage();


// Setup bot and default message handler
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session){
    // session.send("Hmm..");
}).set('storage', inMemoryStorage); // Register in memory storage

// send greetings when bot isadded/removed
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded && message.membersAdded.length > 0) {
        // Say hello
        var isGroup = message.address.conversation.isGroup;
        var txt = isGroup ? "Hello everyone!" : "Hello...";
        var reply = new builder.Message()
            .address(message.address)
            .text(txt);
        bot.send(reply);
    } else if (message.membersRemoved) {
        // See if bot was removed
        var botId = message.address.bot.id;
        for (var i = 0; i < message.membersRemoved.length; i++) {
            if (message.membersRemoved[i].id === botId) {
                // Say goodbye
                var reply = new builder.Message()
                    .address(message.address)
                    .text("Fairfarren");
                bot.send(reply);
                break;
            }
        }
    }
});


bot.dialog('adhocDialog', function (session, args) {
    // var savedAddress = session.message.address;
    // console.log(savedAddress);
    // (Save this information somewhere that it can be accessed later, such as in a database, or session.userData)
    // session.userData.savedAddress = savedAddress;

    // var message = 'Hello user, good to meet you! I now know your address and can send you notifications in the future.';
    // session.send(message);

    var msg = new builder.Message(session).attachments([{
        contentType: "image/jpeg",
        contentUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg"
    }]);
    // var msg = new builder.Message();
    msg.text('Here is your update');
    msg.textLocale('en-US');
    bot.send(msg);
    session.endDialog();
}).triggerAction({
    matches: /^@update$/i
});

bot.dialog('introduction', function (session, args) {
    session.send(CONSTANTS.INTRO_MSG);
    session.endDialog();
}).triggerAction({
    matches: /^@intro$/i
});