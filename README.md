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

```javascript
comrade.addCommand("sample", {
  run: function(state){ console.log(state); }
});
```

This 

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