

var Comrade = require('../lib/comrade').Comrade;

comrade = new Comrade({prompt: "Example> "});

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

comrade.addCommand("command_name argument_one argument_two message_text...", {
	run: function(args) { console.log(args); }
});

comrade.start();

