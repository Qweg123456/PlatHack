function PhaserEngine() {

  var phaserEngine = {
    readyListeners: [],
    init: function() {
      phaserEngine.game = new Phaser.Game($(window).width(),
                             $(window).height() / 2,
                             Phaser.AUTO,
                             '',
                             {
                               preload: phaserEngine.preload,
                               create: phaserEngine.create,
                               update: phaserEngine.update,
                               render: phaserEngine.render
                             }
      );
    },
    preload: function() {
      phaserEngine.game.load.spritesheet('person', 'person_sprite.png', 145, 389, 20);
    },
    create: function() {

      phaserEngine.game.physics.startSystem(Phaser.Physics.P2JS);
      phaserEngine.game.physics.p2.restitution = 0.1;

      // cursors = phaserEngine.game.input.keyboard.createCursorKeys();
      facingLeft = false;
      walking = false;
      jumping = false;
      maxVelX = 400;

      phaserEngine.game.input.gamepad.start();

      pad1 = phaserEngine.game.input.gamepad.pad1;

      phaserEngine.player = phaserEngine.createPlayer();

      phaserEngine.readyListeners.forEach(function(listener) {
        listener();
      });

    },
    update: function() {

          nowWalking = false;
          nowFacingLeft = false;
          // person.body.applyDamping(.1);

          if (pad1.connected) {
            leftStickX = pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X);
            leftStickY = pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y);

            if (leftStickX) {
              person.body.velocity.x += leftStickX * 200;
              maxVelX = leftStickX * 500;
              nowWalking = true;
              nowFacingLeft = leftStickX < 0;
            }

          }

          if ((pad1.justPressed(Phaser.Gamepad.XBOX360_A)) && !jumping && !Math.round(person.body.velocity.y)) {
            jumping = true;
            person.body.velocity.y = -1500 * Math.sign(person.scale.y);
          }

          if (!Math.round(person.body.velocity.y)) {
            jumping = false;
          }

          if (maxVelX > 0 ) {
            person.body.velocity.x = Math.min(person.body.velocity.x, maxVelX);
          } else {
            person.body.velocity.x = Math.max(person.body.velocity.x, maxVelX);
          }

          if (walking) {
            if (!nowWalking) {
              walking = false;
            } else {
              if (!facingLeft && nowFacingLeft) {
                person.scale.x *= -1;
                facingLeft = nowFacingLeft;
              } else if (facingLeft && !nowFacingLeft) {
                person.scale.x *= -1;
                facingLeft = nowFacingLeft;
              }
            }
          } else {
            //person.animations.frame = 0;
            person.animations.paused = false;
          }
          walking = nowWalking;
    },
    render: function() {

    },
    ready: function(listener) {
      phaserEngine.readyListeners.push(listener);
    },
    createPlayer: function() {
      var player = {
        init: function() {
          person = phaserEngine.game.add.sprite(phaserEngine.game.world.centerX, phaserEngine.game.world.centerY, 'person');
          person.anchor.setTo(0.5, 0.5);
          phaserEngine.game.physics.p2.enable(person);
          player.setSize(1);
          walk = person.animations.add('walk');
          person.animations.play('walk', 30, true);
          person.body.fixedRotation = true;
        },
        flip: function() {
          person.scale.y *= -1;
        },
        setSize(value) {
          var flipped = Math.sign(person.scale.y);
          person.scale.x = value * 0.3;
          person.scale.y = value * 0.3;
          person.body.setRectangle(person.width, person.height);
          person.scale.y *= flipped;
        }
      }
      player.init();
      return player;
    },
    getPlayer: function() {
      return phaserEngine.player;
    },
    setGravity: function(value) {
      phaserEngine.game.physics.p2.gravity.y = value * 1000;
    }

  }

  phaserEngine.init();

  return phaserEngine;
}
