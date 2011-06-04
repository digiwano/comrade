
```javascript
var Comrade = require('./lib/comrade').Comrade;

comrade = new Comrade({prompt: "Example> "});

var services = ['svc1', 'svc2'];
var serviceCommands = ['start', 'stop', 'restart'];
comrade.addCommand("service serviceName serviceCommand serviceArgs...", {
  completers: {
    serviceName:    function(){ return services;        },
    serviceCommand: function(){ return serviceCommands; },
    serviceArgs:    function(state){ return state.serviceCommand == 'start' ? ['graceful'] : null; }
  },
  run: function(state){
    switch (state.serviceCommand) {
    case 'start':
      console.log("starting " + state.serviceName + (state.restArray[0] == 'graceful' ? " gracefully." : "."));
      break;
    case 'stop':
      console.log("stopping " + state.serviceName);
      break;
    default:
      console.log("wtf", state);
    }
  }
});
comrade.addCommand("status", {
  run: function(state){ console.log("status is: not so good!") }
});

var accounts = ['one', 'two', 'three'];

comrade.addCommand("post account message", {
  completers: { account: accounts },
  run: function(state) {
    console.log("posting "+ state.message + " to account "+ state.account);
  }
});

comrade.start();
```