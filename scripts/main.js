const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#d0e2f2",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 250 },
      debug: false
    }
  },
  scene: { preload, create, update }
};
const game = new Phaser.Game(config);

let drop, seed, messageText, timerText, cursors, spaceKey;
let gameOver = false, startTime;
const originalScale = 0.15;
let growthStage = 0, growthSprite;

function preload() {
  const assets = [
    ['dropSprite','assets/watercolor drop.png'],
    ['cloudSprite','assets/watercolor cloud.png'],
    ['sunbeamSprite','assets/watercolor sunbeam.png'],
    ['seedSprite','assets/watercolor seed.png'],
    ['pollutionSprite','assets/watercolor pollution.png'],
    ['heatwallSprite','assets/watercolor heatwall.png'],
    ['steamventSprite','assets/watercolor steamvent.png'],
    ['gearsSprite','assets/watercolor gears.png'],
    ['padSprite','assets/watercolor pad.png'],
    ['introPadSprite','assets/watercolor intropad.png'],
    ['flowerSprite','assets/watercolor flower.png'],
    ['vinesSprite','assets/watercolor vines.png'],
    ['rootSprite','assets/watercolor root.png'],
    ['airventSprite','assets/watercolor airvent.png'],
    ['seedling','assets/seedling.png'],
    ['sprouting','assets/sprouting.png'],
    ['plant','assets/plant.png']
  ];
  assets.forEach(a => this.load.image(a[0], a[1]));
}

function create() {
  const scene = this;
  scene.cameras.main.setBounds(0,0,800,3000);
  scene.physics.world.setBounds(0,0,800,3000);

  // Achtergrondlagen
  scene.add.rectangle(400,300,800,600,0xd0e2f2).setDepth(-1);
  scene.add.rectangle(400,1300,800,600,0xcfcfcf).setDepth(-1);
  scene.add.rectangle(400,1950,800,700,0xdbe6c6).setDepth(-1);
  scene.add.rectangle(400,2450,800,900,0xdbe6c6).setDepth(-1);

  // drop
  drop = scene.physics.add.sprite(400,100,'dropSprite').setScale(originalScale).setCircle(100);
  drop.body.setBounce(0.3); drop.body.setCollideWorldBounds(true);
  scene.cameras.main.startFollow(drop);

  messageText = scene.add.text(20,20,"💧 You are One Drop. Reach the seed.",{font:"18px Arial",fill:"#333"}).setScrollFactor(0);
  timerText = scene.add.text(650,20,"Time: 0.0",{font:"18px Arial",fill:"#333"}).setScrollFactor(0);
  scene.add.text(10,580,"Press SPACE to reset",{font:"16px Arial",fill:"#666"}).setScrollFactor(0).setOrigin(0,1);

  startTime = scene.time.now;

  // seed + growth sprite
  seed = scene.physics.add.sprite(400,2950,'seedSprite').setScale(0.1);
  seed.body.setAllowGravity(false); seed.body.setImmovable(true);

  growthSprite = scene.add.sprite(seed.x, seed.y - 60, 'seedling')
    .setScale(0.8)
    .setVisible(false);

  scene.physics.add.collider(drop, seed, () => {
    if (!gameOver && growthStage === 0) {
      messageText.setText("🌱 Success! One drop sparked life.");
      seed.setVisible(false);
      seed.disableBody(true, true);
      growthSprite.setVisible(true);
      growthStage = 1;
      scene.time.delayedCall(1000, () => {
        if (growthStage === 1) { growthSprite.setTexture('sprouting'); growthStage = 2; }
      });
      scene.time.delayedCall(2000, () => {
        if (growthStage === 2) {
          growthSprite.setTexture('plant');
          growthStage = 3;
          messageText.setText("🌳 Life flourishes! You win!");
        
          endGame(scene);
        }
      });
    }
  });

  // Sunbeams
  [
    {x:400,y:300,scale:0.4},
    {x:500,y:500,scale:0.3}
  ].forEach((cfg,i) => {
    const beam = scene.physics.add.sprite(cfg.x,cfg.y,'sunbeamSprite').setScale(cfg.scale);
    beam.body.setAllowGravity(false); beam.body.setImmovable(true);
    scene.tweens.add({ targets: beam, x:{from:beam.x-80,to:beam.x+80}, duration:2500+i*500, yoyo:true, repeat:-1 });
    scene.physics.add.overlap(drop, beam, () => {
      if (!gameOver) {
        drop.setScale(Math.max(drop.scaleX-0.01,0.05));
        if (drop.scaleX <= 0.05) {
          drop.setVisible(false);
          scene.cameras.main.stopFollow();
          messageText.setText("☀️ Evaporated by sunlight...");
          endGame(scene);
        } else messageText.setText("☀️ Sunlight shrinks you...");
      }
    });
  });

  // Clouds
  [
    {x:300,y:200},{x:500,y:220}
  ].forEach((cfg,i) => {
    const c = scene.physics.add.sprite(cfg.x,cfg.y,'cloudSprite').setScale(0.4);
    c.body.setAllowGravity(false); c.body.setImmovable(true);
    scene.tweens.add({ targets: c, x:{from:c.x-150,to:c.x+150}, duration:4000+i*700, yoyo:true, repeat:-1 });
    scene.physics.add.overlap(drop, c, () => {
      if (!gameOver) {
        drop.setScale(Math.min(drop.scaleX+0.01,0.3));
        drop.setVisible(true);
        messageText.setText("☁️ Nourished by cloud...");
      }
    });
  });

  // Pollution
  [1200].forEach(y => {
    const p = scene.physics.add.sprite(Phaser.Math.Between(200,600), y, 'pollutionSprite').setScale(0.2);
    p.body.setAllowGravity(false); p.body.setImmovable(true);
    scene.physics.add.overlap(drop, p, () => {
      drop.body.setVelocityY(drop.body.velocity.y*0.6);
      messageText.setText("🟣 Pollution weakens you...");
    });
  });

  // Gears
  for (let i=0;i<2;i++) {
    const gear = scene.physics.add.sprite(
      Phaser.Math.Between(100,700),
      Phaser.Math.Between(1100,1500),
      'gearsSprite'
    ).setScale(0.15);
    gear.body.setAllowGravity(false); gear.body.setImmovable(true);
    scene.physics.add.collider(drop, gear, () => {
      scene.cameras.main.stopFollow();
      messageText.setText("⚙️ Crushed by gear...");
      endGame(scene);
    });
  }

  // Heat Wall
  const heat = scene.physics.add.sprite(Phaser.Math.Between(100,700),1350,'heatwallSprite').setScale(0.3);
  heat.body.setAllowGravity(false); heat.body.setImmovable(true);
  scene.physics.add.overlap(drop, heat, () => {
    drop.setScale(Math.max(drop.scaleX-0.02,0.05));
    if (drop.scaleX <= 0.05) {
      drop.setVisible(false);
      scene.cameras.main.stopFollow();
      messageText.setText("🔥 Vaporized by industrial heat...");
      endGame(scene);
    } else messageText.setText("🔥 Heat shrinks you...");
  });

  // 💨 Steam Vent
  const vent = scene.physics.add.sprite(Phaser.Math.Between(100, 700), 1250, 'steamventSprite').setScale(0.2);
  vent.body.setAllowGravity(false);
  vent.body.setImmovable(true);
  scene.physics.add.collider(drop, vent, () => {
    drop.body.setVelocityY(-220);
    messageText.setText("💨 Steam jet pushes you upward...");
  });

  // Fertile layer
  const seedY = 2950;
  const fertileMinX = 50;
  const fertileMaxX = 750;
  const fertileMinY = 1950;
  const fertileMaxY = seedY - 200; // 2750

  // 🌸 Intro Pad
  const introPadX = Phaser.Math.Between(fertileMinX, fertileMaxX);
  const introPadY = Phaser.Math.Between(fertileMinY, fertileMaxY);
  const introPad = scene.physics.add.sprite(introPadX, introPadY, 'introPadSprite').setScale(0.2);
  introPad.body.setAllowGravity(false);
  introPad.body.setImmovable(true);
  scene.physics.add.overlap(drop, introPad, () => {
    drop.setScale(Math.min(drop.scaleX + 0.01, 0.35));
    messageText.setText("🌸 You enter life-rich soil...");
  });

  // 🌾 Fertile Pad
  const padX = Phaser.Math.Between(fertileMinX, fertileMaxX);
  const padY = Phaser.Math.Between(fertileMinY, fertileMaxY);
  const pad = scene.physics.add.sprite(padX, padY, 'padSprite').setScale(0.2);
  pad.body.setAllowGravity(false);
  pad.body.setImmovable(true);
  scene.physics.add.overlap(drop, pad, () => {
    drop.setScale(Math.min(drop.scaleX + 0.03, 0.4));
    messageText.setText("🌾 You are nourished by fertile ground...");
  });

  // 🌬️ Air Vent
  const airVentX = Phaser.Math.Between(fertileMinX, fertileMaxX);
  const airVentY = Phaser.Math.Between(fertileMinY, fertileMaxY);
  const airVent = scene.physics.add.sprite(airVentX, airVentY, 'airventSprite').setScale(0.2);
  airVent.body.setAllowGravity(false);
  airVent.body.setImmovable(true);
  scene.physics.add.collider(drop, airVent, () => {
    drop.body.setVelocityY(-220);
    messageText.setText("🌬️ Fertile vent lifts you...");
  });

  // 🌿 Moving Root
  const rootX = Phaser.Math.Between(fertileMinX, fertileMaxX);
  const rootY = Phaser.Math.Between(fertileMinY, fertileMaxY);
  const root = scene.physics.add.sprite(rootX, rootY, 'rootSprite').setScale(0.25);  // groter
  root.body.setAllowGravity(false);
  root.body.setImmovable(true);
  scene.tweens.add({
    targets: root,
    x: { from: rootX - 100, to: rootX + 100 },
    duration: 4000,
    yoyo: true,
    repeat: -1
  });
  scene.physics.add.collider(drop, root, () => {
    scene.cameras.main.stopFollow();
    messageText.setText("🌿 Caught by root, stuck...");
    endGame(scene);
  });

  // 🍃 Vines
  const vineCount = 6;
  for (let i = 0; i < vineCount; i++) {
    const x = Phaser.Math.Between(fertileMinX, fertileMaxX);
    const y = Phaser.Math.Between(fertileMinY, fertileMaxY);
    const vine = scene.physics.add.sprite(x, y, 'vinesSprite').setScale(0.15);
    vine.body.setAllowGravity(false);
    vine.body.setImmovable(true);
    scene.physics.add.collider(drop, vine, () => {
      drop.body.setVelocityY(drop.body.velocity.y * 0.7);
      messageText.setText("🍃 Tangled in vines, slowed down...");
    });
  }

  // 🌼 Flower (decoratie)
  const flowerCount = 6;
  for (let i = 0; i < flowerCount; i++) {
    const fx = Phaser.Math.Between(fertileMinX, fertileMaxX);
    const fy = Phaser.Math.Between(fertileMinY, fertileMaxY);
    scene.add.image(fx, fy, 'flowerSprite').setScale(0.15);
  }

  // 🎮 Besturing (met cursors)
  cursors = scene.input.keyboard.createCursorKeys();

  // Spatie-toets om te resetten
  spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update() {
  if (gameOver) {
    if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
      this.scene.restart();
      gameOver = false;
      growthStage = 0;
    }
    return;
  }
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    this.scene.restart();
    gameOver = false;
    growthStage = 0;
    return;
  }
  const elapsed = (this.time.now - startTime)/1000;
  timerText.setText(`Time: ${elapsed.toFixed(1)}`);
  if (cursors.left.isDown) drop.setVelocityX(-200);
  else if (cursors.right.isDown) drop.setVelocityX(200);
  else drop.setVelocityX(0);
  if (Phaser.Input.Keyboard.JustDown(cursors.up) && (drop.body.blocked.down || drop.body.touching.down)) {
    drop.setVelocityY(-350);
    messageText.setText("⬆️ Jump!");
  }
}

function endGame(scene) {
  gameOver = true;
 // scene.cameras.main.fadeOut(2000, 255, 255, 255); // wit fade

  drop.body.setVelocity(0,0);
  drop.body.moves = false;
}