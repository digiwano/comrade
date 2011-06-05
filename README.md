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
  run: function(args){ console.log(args); }
});
```

Running again, we get this:

```
main >>> sample one two three
{ rest: 'one two three', restArray: [ 'one', 'two', 'three' ] }
main >>> 
```

Comrade allows for your shell to have multiple "modes", each mode defining
its own set of commands. There's an optional first parameter to addCommand
which allows you to define the named section your program is in. See below
for details on that but be aware that the following two are equivalent:


```javascript
comrade.addCommand("sample", {
  run: function(args){ console.log(args); }
});
```

```javascript
comrade.addCommand("main", "sample", {
  run: function(args){ console.log(args); }
});
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

## Named command arguments

Comrade allows you to provide named arguments to your command using the
command spec argument. In previous examples this argument has only contained
the command's name, but this parameter can also be used to specify the arguments
it takes as well. Named arguments also allow tab completion, explained further
on.

A command spec string takes a form like one of the following:

    "command_name"

    "command_name argument_one"

    "command_name argument_one argument_two"

    "command_name argument_one argument_two message_text..."

The args object that gets passed in to your run callback contains one key for each named
argument you passed in, as well as the standard keys 'rest', and 'restArray', containing
all non-named arguments to your command as both a string and an array.

If the last argument in the spec has ... at the end of its name, it will concatenate all
further arguments as a string. The argument 'rest' is always an implicit 'rest...' at the
end of the commandstring, and is always returned.

Re-using this example:
    "command_name argument_one argument_two message_text..."

If a user had typed:
    >>> command_name alpha beta one two three

The object returned would be:

    {
      argument_one: 'alpha', 
      argument_two: 'beta', 
      message_text: 'one two three', 
      restArray: [ 'one', 'two', 'three' ], 
      rest: 'one two three' 
    }

A complete

```javascript
comrade.addCommand("post account message...", {
  run: function(args) {
    comrade.ok("Posting a new message as "+ args.account + ":");
    comrade.info("message: " + args.message );
    comrade.log(args);
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

var services = ['svc1', 'svc2'];
var serviceCommands = ['start', 'stop', 'restart'];
comrade.addCommand("service serviceName serviceCommand serviceArgs...", {
  completers: {
    serviceName:    services,
    serviceCommand: serviceCommands,
    serviceArgs:    function(args){ return args.serviceCommand == 'start' ? ['graceful'] : null; }
  },
  run: function(args){
    switch (args.serviceCommand) {
    case 'start':
      comrade.ok("starting " + args.serviceName + (args.restArray[0] == 'graceful' ? " gracefully." : "."));
      break;
    case 'stop':
      comrade.ok("stopping " + args.serviceName);
      break;
    default:
      comrade.ok("wtf", args);
    }
  }
});
comrade.addCommand("status", {
  run: function(args){ comrade.ok("status is: not so good!") }
});

var accounts = ['one', 'two', 'three'];

comrade.addCommand("post account message...", {
  completers: { account: accounts },
  run: function(args) {
    comrade.ok( "posting \""+ args.message + "\" to account "+ args.account );
  }
});

comrade.start();
```

# A slightly more complex example

todo: an example that shows off the 'mode' functionality.

# And who are you, Comrade Questions?
