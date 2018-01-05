function PhaserEngine() {

  mapWidth = 100;
  mapHeight = 15;
  tileSize = 32;
  var phaserEngine = {
    readyListeners: [],
    init: function() {
      phaserEngine.game = new Phaser.Game($(window).width(),
                             mapHeight * tileSize,
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
      phaserEngine.game.load.image('tileset_1', 'src/tilesets/map_tileset_1.png');
    },
    create: function() {

      phaserEngine.map = phaserEngine.game.add.tilemap();
      phaserEngine.map.addTilesetImage('tileset_1');


      phaserEngine.layer2 = phaserEngine.map.create('layer2', mapWidth, mapHeight, 32, 32);
      for (i=0; i < mapWidth; i++) {
        for (j=0; j < mapHeight; j++) {
          phaserEngine.map.putTile(10, i, j, phaserEngine.layer2);
        }
      }

      phaserEngine.layer1 = phaserEngine.map.create('layer1', mapWidth, mapHeight, 32, 32);
      phaserEngine.layer1.resizeWorld();

      phaserEngine.map.setCollisionBetween(0, 9, true, phaserEngine.layer1, true);
      phaserEngine.map.setCollisionBetween(11, 20, true, phaserEngine.layer1, true);


      phaserEngine.game.physics.startSystem(Phaser.Physics.P2JS);
      phaserEngine.game.physics.p2.gravity.y = 350;
      phaserEngine.game.physics.p2.world.defaultContactMaterial.friction = 0.3;
      phaserEngine.game.physics.p2.world.setGlobalStiffness(1e5);

      phaserEngine.game.physics.p2.convertTilemap(phaserEngine.map, phaserEngine.layer1);


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
    loadTilemap: function(data) {
      data.tiles.forEach(function(tile) {
        phaserEngine.map.putTile(Number(tile.tileIndex), tile.x, tile.y, phaserEngine.layer1);
      });
      //phaserEngine.map.setCollisionBetween(0, 8, true, phaserEngine.layer1, true);
      phaserEngine.game.physics.p2.convertTilemap(phaserEngine.map, phaserEngine.layer1);

    },
    update: function() {

          nowWalking = false;
          nowFacingLeft = false;
          // person.body.applyDamping(.1);

          if (pad1.connected) {
            leftStickX = pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X);
            leftStickY = pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y);

            if (Math.abs(leftStickX) < 0.15) {
              leftStickX = false;
            }
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

          if (maxVelX > 0 && nowWalking) {
            person.body.velocity.x = Math.min(person.body.velocity.x, maxVelX);
          } else if (nowWalking) {
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
            console.log(person.body.velocity.x);
            person.body.velocity.x *= 0.9;
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
          person.body.damping = 0.5;
          person.body.x = 100;
          phaserEngine.game.camera.follow(person);
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
