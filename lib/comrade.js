(function() {
  var Comrade, EventEmitter, Interface, cli, colors, inspect, readline, _defaultPrompt, _emptyCompleter;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  readline = require('readline');
  colors = require('colors');
  cli = require('cli');
  inspect = require('util').inspect;
  EventEmitter = require('events').EventEmitter;
  _emptyCompleter = function() {
    return [];
  };
  _defaultPrompt = function(mode) {
    return "" + mode + " >>> ";
  };
  Interface = require('readline').Interface;
  Interface.prototype.setPrompt = (function(parent) {
    return function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!args[1]) {
        args[1] = args[0].replace(/\x1b.*?m/g, '').length;
      }
      return parent.apply(this, args);
    };
  })(Interface.prototype.setPrompt);
  Comrade = (function() {
    function Comrade(opts) {
      var _ref, _ref2, _ref3;
      if (opts == null) {
        opts = {};
      }
      this.modes = {};
      this.completers = {};
      this.currentMode = 'main';
      this.inStream = (_ref = opts.inStream) != null ? _ref : process.stdin;
      this.outStream = (_ref2 = opts.outStream) != null ? _ref2 : process.stdout;
      this.mightExit = null;
      this.setPrompt((_ref3 = opts.prompt) != null ? _ref3 : _defaultPrompt);
    }
    __extends(Comrade, EventEmitter);
    Comrade.prototype.setPrompt = function(mk_prompt) {
      return this.renderPrompt = typeof mk_prompt === 'string' ? function(mode) {
        return mk_prompt;
      } : typeof mk_prompt === 'function' ? mk_prompt : function(mode) {
        return ("" + mode + " > ").bold;
      };
    };
    Comrade.prototype.addCompleter = function(name, fn) {
      return this.completers[name] = fn;
    };
    Comrade.prototype.addCommand = function() {
      var a, cmdObject, mode, name, opts, sp, spec, st, thing, words, _fn, _ref, _ref2, _ref3, _ref4;
      a = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = (function() {
        switch (a.length) {
          case 2:
            return ['main'].concat(__slice.call(a));
          case 3:
            return a;
          default:
            throw new Error("waaaaaaaaaaaaah");
        }
      })(), mode = _ref[0], spec = _ref[1], opts = _ref[2];
      words = spec.split(' ');
      cmdObject = {};
      cmdObject.run = opts.run;
      cmdObject.completers = (_ref2 = opts.completers) != null ? _ref2 : {};
      cmdObject.cmd = words.shift();
      _ref3 = this.parseCommandSpec(words), st = _ref3[0], sp = _ref3[1];
      cmdObject.structure = st;
      cmdObject.rest = sp;
      _ref4 = cmdObject.completers;
      _fn = function(name, thing) {
        if (thing instanceof Array) {
          return cmdObject.completers[name] = function() {
            return thing;
          };
        }
      };
      for (name in _ref4) {
        if (!__hasProp.call(_ref4, name)) continue;
        thing = cmdObject.completers[name];
        _fn(name, thing);
      }
      if (!this.modes[mode]) {
        this.modes[mode] = {};
      }
      return this.modes[mode][cmdObject.cmd] = cmdObject;
    };
    Comrade.prototype.parseCommandSpec = function(s) {
      var arg, rest, structure, _arg, _i, _len;
      structure = [];
      rest = 'rest';
      for (_i = 0, _len = s.length; _i < _len; _i++) {
        arg = s[_i];
        _arg = {};
        _arg.rest = false;
        if (arg.indexOf('...') === arg.length - 3) {
          arg = arg.substring(0, arg.length - 3);
          _arg.rest = true;
        }
        _arg.name = arg;
        structure.push(_arg);
      }
      if (structure.length === 0 || structure[structure.length - 1].rest === false) {
        structure.push({
          name: rest,
          rest: true
        });
      }
      return [structure, rest];
    };
    Comrade.prototype.start = function() {
      this.rli = readline.createInterface(this.inStream, this.outStream, __bind(function(line) {
        return this.complete(line);
      }, this));
      this.rli.on('line', __bind(function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.processLine.apply(this, args);
      }, this));
      this.rli.on('SIGINT', __bind(function() {
        return this.processSigint();
      }, this));
      this.rli.on('attemptClose', __bind(function() {
        return this.processAttemptClose();
      }, this));
      return this.prompt();
    };
    Comrade.prototype.safeOutput = function(doOutput) {
      this.rli.output.clearLine();
      this.rli.output.cursorTo(0);
      doOutput();
      return this.rli._refreshLine();
    };
    Comrade.prototype.processSigint = function() {
      if (this.mightExit === 'sigint') {
        this.safeOutput(function() {
          return console.log("[ Exiting! ]".yellow);
        });
        this.rli.close();
        return process.exit();
      } else {
        this.safeOutput(function() {
          return console.log("[ press ctrl-c again to exit ]".yellow);
        });
        return this.mightExit = 'sigint';
      }
    };
    Comrade.prototype.processAttemptClose = function() {
      if (this.mightExit === 'ctrl-d') {
        this.safeOutput(function() {
          return console.log("[ Exiting! ]".yellow);
        });
        this.rli.close();
        return process.exit();
      } else {
        this.safeOutput(function() {
          return console.log("[ press ctrl-d again to exit ]".yellow);
        });
        return this.mightExit = 'ctrl-d';
      }
    };
    Comrade.prototype.processLine = function(line) {
      this.mightExit = null;
      this.runCommand(line);
      return this.prompt();
    };
    Comrade.prototype.prompt = function() {
      this.rli.setPrompt(this.renderPrompt(this.currentMode));
      return this.rli.prompt();
    };
    Comrade.prototype.complete = function(cmdstr) {
      var arg, argDef, cmd, completions, cplt, first_arg, len, n, rest, retn, rets, state, words, x, _cmd, _ref, _ref2;
      words = cmdstr.split(' ');
      if (words.length === 1) {
        first_arg = words[0];
        completions = (function() {
          var _ref, _results;
          _ref = this.modes[this.currentMode];
          _results = [];
          for (x in _ref) {
            if (!__hasProp.call(_ref, x)) continue;
            if (x.toLowerCase().indexOf(first_arg.toLowerCase()) === 0) {
              _results.push(x + " ");
            }
          }
          return _results;
        }).call(this);
        return [completions, first_arg];
      }
      _cmd = words.shift();
      cmd = this.modes[this.currentMode][_cmd];
      len = words.length;
      n = 0;
      state = {};
      rets = [];
      retn = words[len];
      while (n < len) {
        argDef = cmd.structure[n];
        arg = words[n];
        state[argDef.name] = arg;
        rest = words.slice(n);
        n += 1;
        if (argDef.rest) {
          if (argDef.name !== 'args') {
            state.args = rest;
          }
          state[argDef.name] = state.args.join(' ');
          state[cmd.rest] = state.args.join(' ');
          n = len;
        }
        if (n === len) {
          cplt = (_ref = (_ref2 = cmd.completers[argDef.name]) != null ? _ref2 : this.completers[argDef.name]) != null ? _ref : _emptyCompleter;
          rets = (function() {
            var _i, _len, _ref3, _results;
            _ref3 = cplt(state, words[n - 1]);
            _results = [];
            for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
              x = _ref3[_i];
              if (x.toLowerCase().indexOf(words[n - 1].toLowerCase()) === 0) {
                _results.push(x + " ");
              }
            }
            return _results;
          })();
          retn = words[n - 1];
        }
      }
      return [rets, retn];
    };
    Comrade.prototype.runCommand = function(cmdstr) {
      var arg, argDef, cmd, completions, first_arg, len, n, rest, retn, rets, state, words, x, _cmd, _results;
      words = cmdstr.split(' ');
      if (words.length === 1) {
        first_arg = words[0];
        completions = (function() {
          var _ref, _results;
          _ref = this.modes[this.currentMode];
          _results = [];
          for (x in _ref) {
            if (!__hasProp.call(_ref, x)) continue;
            if (x.toLowerCase().indexOf(first_arg.toLowerCase()) === 0) {
              _results.push(x + " ");
            }
          }
          return _results;
        }).call(this);
        return [completions, first_arg];
      }
      _cmd = words.shift();
      cmd = this.modes[this.currentMode][_cmd];
      len = words.length;
      n = 0;
      state = {};
      rets = [];
      retn = words[len];
      _results = [];
      while (n < len) {
        argDef = cmd.structure[n];
        arg = words[n];
        state[argDef.name] = arg;
        rest = words.slice(n);
        n += 1;
        if (argDef.rest) {
          if (argDef.name !== 'args') {
            state.restArray = rest;
          }
          state[argDef.name] = state.restArray.join(' ');
          state[cmd.rest] = state.restArray.join(' ');
          n = len;
        }
        _results.push(n === len ? cmd ? cmd.run.call(state, state) : this.safeOutput(function() {
          return console.log("NO SUCH COMMAND!!!!!!!!");
        }) : void 0);
      }
      return _results;
    };
    Comrade.prototype.ok = function() {
      var a;
      a = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.safeOutput(function() {
        return cli.ok.apply(cli, a);
      });
    };
    Comrade.prototype.error = function() {
      var a;
      a = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.safeOutput(function() {
        return cli.error.apply(cli, a);
      });
    };
    Comrade.prototype.info = function() {
      var a;
      a = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.safeOutput(function() {
        return cli.info.apply(cli, a);
      });
    };
    Comrade.prototype.log = function() {
      var a;
      a = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.safeOutput(function() {
        return console.log.apply(console, a);
      });
    };
    return Comrade;
  })();
  module.exports.Comrade = Comrade;
}).call(this);
