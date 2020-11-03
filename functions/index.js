'use strict';

const {
    dialogflow,
    Suggestions,
} = require('actions-on-google');

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const app = dialogflow({debug: true});

function randomInt(low, high) {
    var arr = [];
    const diff = parseInt((high-low)/4)
    for(var i=0;i<4; i++) {
        high = low + diff
        arr.push(parseInt(Math.random() * (high - low) + low))
        low = high
    }
    return arr
}

function ifLeap(number) {
    if(number%400 === 0)
        return true
    else if(number%100 === 0)
        return false
    else if(number%4 === 0)
        return true
    return false
}

const ask = 'Please tell me the year in number';

app.middleware((conv) => {
    if (!conv.data.fallbackCount || !(conv.intent === 'Fallback')) {
      conv.data.fallbackCount = 0;
    }
});

app.intent('Welcome', (conv) => {
    const welcomeMessage = 'Welcome to Leap Year Finder where ' +
        'you can get to know whether a specific year is a Leap year or not.' +
        ' You can tell me the year in number.';
    conv.ask(welcomeMessage);
    if (conv.screen)
        conv.ask(new Suggestions(randomInt(1,2050)));
});

app.intent('Leap year', (conv,{number}) => {
    if(number<0)
        conv.ask(`Year cannot be Negative.`)
    else if(ifLeap(number))
        conv.ask(`${number} is leap year`)
    else
        conv.ask(`${number} is not a leap year`)
    console.log(number)
    conv.ask('Do you want to tell me another year?')
    if (conv.screen)
        conv.ask(new Suggestions('Yes','No'));
});

app.intent('Leap year - yes', (conv) => {
    conv.ask(ask);
    if (conv.screen)
    conv.ask(new Suggestions(randomInt(1,2050)));
});

app.intent(['Quit', 'Leap year - no'], (conv) => {
    conv.close('Thanks for using Leap Year Finder. See you soon!!')
});

app.intent('No Input', (conv) => {
    const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
    var result
    if (repromptCount === 0)
        result = `Sorry, I can't hear you.`
    else if (repromptCount === 1)
        result = `I'm sorry, I still can't hear you.`;
    else if (conv.arguments.get('IS_FINAL_REPROMPT'))
        conv.close(`I'm sorry, I'm having trouble here. ` +
        'Maybe we should try this again later.');
    conv.ask(`${result} ${ask} or you can quit`);
});

app.intent('Fallback', (conv) => {
    conv.data.fallbackCount++;
    if (conv.data.fallbackCount === 1) {
      conv.ask('Sorry, what was that?');
    } else if (conv.data.fallbackCount === 2) {
      conv.ask(`I didn't quite get that. You can tell me the year in number.`);
    } else {
      conv.close(`Sorry, I'm still having trouble. ` +
        `So let's stop here for now. Bye.`);
    }
});

exports.fulfillment = functions.https.onRequest(app);
