readline = require 'readline'
colors   = require 'colors'
cli      = require 'cli'
{inspect} = require 'util'
{ EventEmitter } = require 'events'

_emptyCompleter = -> []
_defaultPrompt = (mode) -> "#{mode} >>> "

# Fix readline interface
Interface = require('readline').Interface
Interface::setPrompt = ((parent) ->
  (args...) ->
    if (! args[1])
      args[1] = args[0].replace(/\x1b.*?m/g, '').length
    parent.apply(this, args);
)( Interface::setPrompt )

class Comrade extends EventEmitter
  constructor: (opts = {}) ->
    @modes       = {}
    @completers  = {}
    @currentMode = 'main'
    @inStream    = opts.inStream  ? process.stdin
    @outStream   = opts.outStream ? process.stdout
    @mightExit   = null
    @setPrompt opts.prompt ? _defaultPrompt

  setPrompt: (mk_prompt) ->
    @renderPrompt =
      if typeof mk_prompt is 'string'
        (mode) -> mk_prompt
      else if typeof mk_prompt is 'function'
        mk_prompt
      else
        (mode) -> "#{mode} > ".bold

  addCompleter: (name, fn) ->
    @completers[name] = fn

  addCommand: (a...) ->
    [mode, spec, opts] = switch a.length
      when 2 then ['main', a...]
      when 3 then a
      else
        throw new Error("waaaaaaaaaaaaah")

    words                = spec.split ' '
    cmdObject            = {}
    cmdObject.run        = opts.run
    cmdObject.completers = opts.completers ? {}
    cmdObject.cmd        = words.shift()
    [st, sp]             = @parseCommandSpec words
    cmdObject.structure  = st
    cmdObject.rest      = sp
    
    for own name of cmdObject.completers 
      thing = cmdObject.completers[name]
      do (name, thing) ->
        if thing instanceof Array
          cmdObject.completers[name] = -> thing

    if ! @modes[ mode ] then @modes[ mode ] = {}

    @modes[ mode ][ cmdObject.cmd ] = cmdObject

  parseCommandSpec: (s) ->
    structure = []

    rest = 'rest'
    for arg in s
      _arg = {}
      _arg.rest = false
      if arg.indexOf('...') == arg.length - 3
        arg = arg.substring(0, arg.length - 3)
        _arg.rest = true

      _arg.name = arg
      structure.push _arg

    if structure.length == 0 || structure[ structure.length - 1 ].rest is false
      structure.push { name: rest, rest: true }

    [structure, rest]

  start: ->
    @rli = readline.createInterface @inStream, @outStream, (line) => @complete line
    @rli.on 'line',  (args...) => @processLine args...
    @rli.on 'SIGINT',       () => @processSigint()
    @rli.on 'attemptClose', () => @processAttemptClose()
    @prompt()

  safeOutput: (doOutput) ->
    @rli.output.clearLine( )
    @rli.output.cursorTo 0
    doOutput()
    @rli._refreshLine( )

  processSigint: ->
    if @mightExit == 'sigint'
      @safeOutput -> console.log "[ Exiting! ]".yellow
      @rli.close()
      process.exit()
    else
      @safeOutput -> console.log "[ press ctrl-c again to exit ]".yellow
      @mightExit = 'sigint'

  processAttemptClose: ->
    if @mightExit == 'ctrl-d'
      @safeOutput -> console.log "[ Exiting! ]".yellow
      @rli.close()
      process.exit()
    else
      @safeOutput -> console.log "[ press ctrl-d again to exit ]".yellow
      @mightExit = 'ctrl-d'

  processLine: (line) ->
    @mightExit = null
    @runCommand line
    @prompt()

  prompt: ->
    @rli.setPrompt @renderPrompt( @currentMode )
    @rli.prompt()

  # complete() and runCommand() are totally un-DRY for now. i apologize. i'll fix later.
  complete: (cmdstr) ->
    words = cmdstr.split ' '
    
    if words.length == 1
      first_arg = words[0]
      completions = (x+" " for own x of @modes[@currentMode] when x.toLowerCase().indexOf( first_arg.toLowerCase() ) == 0)
      return [ completions, first_arg ]
    
    _cmd = words.shift()
    cmd = @modes[@currentMode][_cmd]
    
    len = words.length 
    n = 0
    state = {}
    rets = []
    retn = words[len]
    
    while n < len
      argDef = cmd.structure[n]
      arg    = words[n]
      state[ argDef.name ] = arg
      rest = words.slice n
      n += 1
      if argDef.rest
        state.args           = rest unless argDef.name == 'args'
        state[ argDef.name ] = state.args.join ' '
        state[ cmd.rest    ] = state.args.join ' '
        n = len
      if n == len
        cplt = ( cmd.completers[ argDef.name ] ? @completers[ argDef.name ] ? _emptyCompleter )
        rets = (x + " " for x in cplt( state, words[n-1] ) when x.toLowerCase().indexOf( words[n-1].toLowerCase() ) == 0)
        retn = words[n-1]
    
    [ rets, retn ]


  runCommand: (cmdstr) ->
    words = cmdstr.split ' '
    
    if words.length == 1
      first_arg = words[0]
      completions = (x+" " for own x of @modes[@currentMode] when x.toLowerCase().indexOf( first_arg.toLowerCase() ) == 0)
      return [ completions, first_arg ]
    
    _cmd = words.shift()
    cmd = @modes[@currentMode][_cmd]
    
    len = words.length 
    n = 0
    state = {}
    rets = []
    retn = words[len]
    
    while n < len
      argDef = cmd.structure[n]
      arg    = words[n]
      state[ argDef.name ] = arg
      rest = words.slice n
      n += 1
      if argDef.rest
        state.restArray      = rest unless argDef.name == 'args'
        state[ argDef.name ] = state.restArray.join ' '
        state[ cmd.rest    ] = state.restArray.join ' '
        n = len
      if n == len
        if cmd
          cmd.run.call state, state
        else
          @safeOutput -> console.log "NO SUCH COMMAND!!!!!!!!"

  ok:    (a...) -> @safeOutput -> cli.ok      a...
  error: (a...) -> @safeOutput -> cli.error   a...
  info:  (a...) -> @safeOutput -> cli.info    a...
  log:   (a...) -> @safeOutput -> console.log a...

module.exports.Comrade = Comrade
