var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});


/*
// Listen for messages from users 
server.post('/api/messages', connector.listen());
// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    session.send("You said: %s", session.message.text);
});
*/

var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector)
    .set('storage', inMemoryStorage); // Register in-memory storage 

// listen for messages
server.post('/api/messages', connector.listen());

/*
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
                        .text("Goodbye");
                bot.send(reply);
                break;
            }
        }
    }
});
*/

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
    console.log('updated conversation');
    bot.beginDialog(message.address, '/');
    /*
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            console.log("MemberIdentity : "+identity);
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/');
            }
        });
    }
    */
});


// send simple notification    
function sendProactiveMessage(session) {
    var msg = new builder.Message(session).attachments([{
        contentType: "image/jpeg",
        contentUrl: "https://image.slidesharecdn.com/talkingbots-170330185224/95/ai-bots-nlp-slack-and-alexa-12-638.jpg?cb=1490900015"
    }]);
    // var msg = new builder.Message();
    msg.text('Hello, this is a notification');
    msg.textLocale('en-US');
    bot.send(msg);
}


bot.dialog('adhocDialog', function (session, args) {
    // var savedAddress = session.message.address;
    // console.log(savedAddress);
    // (Save this information somewhere that it can be accessed later, such as in a database, or session.userData)
    // session.userData.savedAddress = savedAddress;

    // var message = 'Hello user, good to meet you! I now know your address and can send you notifications in the future.';
    // session.send(message);

    setTimeout(function () {
        sendProactiveMessage(session);
       }, 2000);
    session.endDialog('Fairfarren!');
}).triggerAction({
    matches: /^@update$/i
});

bot.dialog('/', function (session, args) {
    session.send('Hmm..');
});
