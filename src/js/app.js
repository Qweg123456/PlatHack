startingConsoleString = "";
var hackerTabContents = [];
var hackerTabs = [];
var previousCommands = JSON.parse(localStorage.getItem('previousCommands')) || [];
var hoveredCommand = 0;
currentGravity = 9;

window.onload = function() {

  function setGravity(args) {
    var gravityAmount = currentGravity;
    gravityAmount = Number(args[0]);
    if (isNaN(gravityAmount)) {
      return false;
    }
    gameEngine.setGravity(gravityAmount);
    if (Math.sign(currentGravity) !== Math.sign(gravityAmount)) {
      player.flip();
    }
    currentGravity = gravityAmount;
    return true;
  }

  function setPlayerSize(args) {
    try {
      player.setSize(args[0]);
    } catch(e) {
      console.log(e);
    }
    return true;
  }

  function runCommand(command) {
    var commandArray = command.split(' ');
    var commandArgs = command.split(' ');
    var currentCommand = commands;
    var ranCommand = false;
    var tried = false;
    commandArray.forEach(function(value) {
      if (tried) {
        return;
      }
      if (isFunction(currentCommand)) {
        ranCommand = currentCommand(commandArgs);
        tried = true;
      }
      currentCommand = currentCommand[value];
      commandArgs.shift();
    });
    return ranCommand;
  }

  commands = {};
  commands.set = {};
  commands.set.gravity = setGravity;
  commands.set.player = {};
  commands.set.player.size = setPlayerSize;

  (function init() {
    gameEngine = PhaserEngine();

    gameEngine.ready(function(){

      player = gameEngine.getPlayer();
      gameEngine.setGravity(currentGravity);

      var $hackerWrapper = $('<div>').appendTo('body');
      $hackerWrapper.css({
        height: $(window).height() / 2 + 'px'
      });

      var $hackerTabs = $('<div>').appendTo($hackerWrapper);
      $hackerTabs.css({
        height: '40px'
      });

      var $hackerContentPane = $('<div>').appendTo($hackerWrapper);
      $hackerContentPane.css({
        position: 'relative',
        height: $(window).height() / 2 - 40 + 'px'
      });

      var $notificationsPane = $('<div>');
      $notificationsPane.css ({
        width: '100%',
        height: '100%',
        background: '#eee'
      });
      addTab('Notifications', $notificationsPane);

      $notificationsPane.html('Hiiiiiiiii!');

      var $consoleWrapper = $('<div>');
      $consoleWrapper.attr('id', 'consoleWrapper');

      var $consoleInput = $('<input>').appendTo($consoleWrapper);
      $consoleInput.addClass('consoleInput');
      $consoleInput.on('keypress', function(event) {
        if( event.keyCode === 13 ) {
          commandCommitted();
        }
      });
      $consoleInput.on('keydown', function(event) {
        if( event.keyCode === 38 ) {
          if (hoveredCommand <= previousCommands.length) {
            hoveredCommand++;
            $consoleInput.val(previousCommands[previousCommands.length - hoveredCommand]);
          }
          return false;
        } else if( event.keyCode === 40 ) {
          if (hoveredCommand > 1) {
            hoveredCommand--;
            $consoleInput.val(previousCommands[previousCommands.length - hoveredCommand]);
          } else {
            hoveredCommand = 0;
            $consoleInput.val('');
          }
        }
      });

      var $consolePrefix = $('<div>').appendTo($consoleWrapper);
      $consolePrefix.html('>');
      $consolePrefix.addClass('consolePrefix');

      var $consoleCommitButton = $('<div>').appendTo($consoleWrapper);
      $consoleCommitButton.css({
        position: 'absolute',
        bottom: 0,
        right: 0,
        padding: '10px',
        color: 'green',
        border: '2px solid green',
        borderRadius: '5px 5px 0 0',
        cursor: 'pointer',
        background: '#040404'
      });
      $consoleCommitButton.html('Commit');
      $consoleCommitButton.on('click', function() {
        commandCommitted();
      });

      function commandCommitted() {
        var command = $consoleInput.val().toLowerCase();
        emitConsoleCommand($consoleInput.val());
        previousCommands.push($consoleInput.val());
        localStorage.setItem('previousCommands', JSON.stringify(previousCommands));
        var commandSucceeded = true;
        try {
          commandSucceeded = runCommand(command);
        } catch (e) {
          commandSucceeded = false;
        }
        if (!commandSucceeded) {
          emitConsoleError($consoleInput.val() + " is not a recognized command");
        }
        hoveredCommand = 0;
        $consoleInput.val('');
      }

      $consoleLog = $('<div>').appendTo($consoleWrapper);
      $consoleLog.addClass('consoleLog');
      $consoleLog.css({
        height: $hackerContentPane.height() + 'px'
      });

      $consoleLogPadding = $('<div>').appendTo($consoleLog);
      $consoleLogPadding.addClass('consoleLogPadding');

      addTab('Hacker Console', $consoleWrapper);

      function emitConsoleCommand(text) {
        var $logLine = $('<div>').appendTo($consoleLog);
        $logLine.addClass('consoleLogLine');
        $logLine.html('> ' + text);
        $consoleLogPadding.appendTo($consoleLog);
        $consoleLog.scrollTop(9999999);
      }

      function emitConsoleLog(text) {
        var $logLine = $('<div>').appendTo($consoleLog);
        $logLine.addClass('consoleLogLine');
        $logLine.html(text);
        $consoleLogPadding.appendTo($consoleLog);
        $consoleLog.scrollTop(9999999);
      }

      function emitConsoleError(text) {
        var $logLine = $('<div>').appendTo($consoleLog);
        $logLine.addClass('consoleErrorLine');
        $logLine.html(text);
        $consoleLogPadding.appendTo($consoleLog);
        $consoleLog.scrollTop(9999999);
      }

      function addTab(title, $content) {
        $content.css({
          top: 0,
          width: '100%',
          position: 'absolute'
        });
        $hackerContentPane.append($content);
        var $tab = $('<div>').appendTo($hackerTabs);
        $tab.html(title);
        $tab.addClass('hackerTab');

        hackerTabs.push($tab);
        hackerTabContents.push($content);
        $tab.on('click', function() {
          hackerTabs.forEach(function($e, i) {
            $e.removeClass('active');
          });
          hackerTabContents.forEach(function($e, i) {
            $e.fadeOut();
          });
          $tab.addClass('active');
          $content.fadeIn();
        });

        if (hackerTabs.length !== 2) {
          $content.hide();
        } else {
          $tab.addClass('active');
        }
      }

      setInterval(function() {
        $consoleInput.focus();
      }, 200);
      $consoleInput.focus();
      $consoleInput.val(startingConsoleString);

      emitConsoleLog("Time to hack");
    });
  })();

};

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
