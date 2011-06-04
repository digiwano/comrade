# Comrade - a repl-like generic readline shell interface

Comrade is a tool to help you build a quick readline shell interface,
similar to node's built-in repl.js, except that rather than evaluating
javascript, it parses commands you define, simplifies tab completion
for arguments, provides helpers to send output without disturbing the
prompt, and fires a callback when a command is completed.

Perhaps a better way to put it is to call it a RWPL, where "W" stands
for "Whatever you feel like". Or just an easy wrapper around readline.

# Usage

## The very basics

```javascript
var Comrade = require('comrade').Comrade;
var comrade = new Comrade();
comrade.start()
```

This will get you a basic readline interface that does absolutely nothing. 
Ctrl-C and Ctrl-D will magically work for you, but there won't be any
working commands:

```
~/work/js/Comrade % node test.js
main >>> 
[ press ctrl-c again to exit ]
main >>> 
~/work/js/Comrade %
```

## Adding a new command

Add this to the code above:

```javascript
comrade.addCommand("sample", {
  run: function(state){ console.log(state); }
});
```

Running again, we get this:

```
main >>> sample one two three
{ rest: 'one two three', restArray: [ 'one', 'two', 'three' ] }
main >>> 
```

## Sending output

Inside your command's run() function, there's no reason you shouldn't use
console.log. However, if you were to console.log() a message while the user
has a partially typed command on their prompt, you'd mess up their prompt.

Comrade has two methods to get around this. First, it provides a safeOutput()
method, which clears out the current prompt line, runs your function, and
re-displays the prompt.

```javascript
comrade.safeOutput(function(){
  console.log("HEY DUMMY!");
});
```

In addition, comrade provides wrappers around cli.js's .ok/.info/.error functions,
as well as the more vanilla console.log:

```javascript
comrade.ok("Everything's Hoopy!");
comrade.info("something happened");
comrade.error("noooooooooOOOOOOOOOOOOOOOO!!!!!!!!!!!!!!");
comrade.log("no special output formatting here");
```

It is recommended you use these helpers for displaying output to the user. All further
examples will use this.

## Command arguments

```javascript
comrade.addCommand("post account message...", {
  run: function(state) {
    comrade.ok("Posting a new message as "+ state.account +":");
    comrade.info("message: " + state.message );
    comrade.log(state);
  }
});
```

Running again, we get this:

```
main >>> post digiwano beautiful day - going for a drive
OK: Posting a new message as digiwano:
INFO: message: beautiful day - going for a drive
{ account: 'digiwano', message: 'beautiful day - going for a drive', restArray: [ 'beautiful', 'day', '-', 'going', 'for', 'a', 'drive' ], rest: 'beautiful day - going for a drive' }
main >>> 
```


## TODO: the rest of tihs section

it really is a beautiful day and if i dont go for a drive like right now i'm going to regret it.

# A simple example

copied from examples/basic.js:

```javascript
var Comrade = require('comrade').Comrade;

var comrade = new Comrade({prompt: "Example> "});
```

var services = ['svc1', 'svc2'];
var serviceCommands = ['start', 'stop', 'restart'];
comrade.addCommand("service serviceName serviceCommand serviceArgs...", {
  completers: {
    serviceName:    services,
    serviceCommand: serviceCommands,
    serviceArgs:    function(state){ comrade.log('state'); return state.serviceCommand == 'start' ? ['graceful'] : null; }
  },
  run: function(state){
    switch (state.serviceCommand) {
    case 'start':
      comrade.ok("starting " + state.serviceName + (state.restArray[0] == 'graceful' ? " gracefully." : "."));
      break;
    case 'stop':
      comrade.ok("stopping " + state.serviceName);
      break;
    default:
      comrade.ok("wtf", state);
    }
  }
});
comrade.addCommand("status", {
  run: function(state){ comrade.ok("status is: not so good!") }
});

var accounts = ['one', 'two', 'three'];

comrade.addCommand("post account message...", {
  completers: { account: accounts },
  run: function(state) {
    comrade.ok( "posting \""+ state.message + "\" to account "+ state.account );
  }
});

comrade.start();
```

# A slightly more complex example

todo: an example that shows off the 'mode' functionality.

# And who are you, Comrade Questions?
