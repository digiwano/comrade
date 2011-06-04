

var Comrade = require('../lib/comrade').Comrade;

comrade = new Comrade({prompt: "Example> "});

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