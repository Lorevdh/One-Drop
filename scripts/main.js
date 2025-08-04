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
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let drop, seed, messageText, timerText, cursors, resetText, spaceKey;
let gameOver = false;
let startTime;
let dropRadius = 20;
const originalScale = 0.15;

function preload() {
  this.load.image('dropSprite', 'assets/watercolor drop.png');
  this.load.image('cloudSprite', 'assets/watercolor cloud.png');
  this.load.image('sunbeamSprite', 'assets/watercolor sunbeam.png');
  this.load.image('seedSprite', 'assets/watercolor seed.png');
  this.load.image('pollutionSprite', 'assets/watercolor pollution.png');
  this.load.image('heatwallSprite', 'assets/watercolor heatwall.png');
  this.load.image('steamventSprite', 'assets/watercolor steamvent.png');
  this.load.image('gearsSprite', 'assets/watercolor gears.png');
  this.load.image('padSprite', 'assets/watercolor pad.png');
  this.load.image('introPadSprite', 'assets/watercolor intropad.png');
  this.load.image('flowerSprite', 'assets/watercolor flower.png');
  this.load.image('vinesSprite', 'assets/watercolor vines.png');
  this.load.image('rootSprite', 'assets/watercolor root.png');
  this.load.image('airventSprite', 'assets/watercolor airvent.png');
}

function create() {
  const scene = this;
  scene.cameras.main.setBounds(0, 0, 800, 3000);
  scene.physics.world.setBounds(0, 0, 800, 3000);

  drop = scene.physics.add.sprite(400, 100, 'dropSprite').setScale(originalScale).setCircle(100);
  drop.body.setBounce(0.3);
  drop.body.setCollideWorldBounds(true);
  scene.cameras.main.startFollow(drop);

  messageText = scene.add.text(20, 20, "💧 You are One Drop. Reach the seed.", {
    font: "18px Arial", fill: "#333"
  }).setScrollFactor(0);

  timerText = scene.add.text(650, 20, "Time: 0.0", {
    font: "18px Arial", fill: "#333"
  }).setScrollFactor(0);

  // Reset instructie linksonder in beeld
  resetText = scene.add.text(10, 580, "Press SPACE to reset", {
    font: "16px Arial", fill: "#666"
  }).setScrollFactor(0).setOrigin(0, 1);

  startTime = scene.time.now;

  seed = scene.physics.add.sprite(400, 2950, 'seedSprite').setScale(0.1);
  seed.body.setAllowGravity(false);
  seed.body.setImmovable(true);
  scene.physics.add.collider(drop, seed, () => {
    if (!gameOver) {
      messageText.setText("🌱 Success! One drop sparked life.");
      endGame(scene);
    }
  });

  // ☀️ Sunbeams
  const sunbeams = [
    scene.physics.add.sprite(400, 300, 'sunbeamSprite').setScale(0.4),
    scene.physics.add.sprite(500, 500, 'sunbeamSprite').setScale(0.3)
  ];
  sunbeams.forEach((beam, i) => {
    beam.body.setAllowGravity(false);
    beam.body.setImmovable(true);
    scene.tweens.add({
      targets: beam,
      x: { from: beam.x - 80, to: beam.x + 80 },
      duration: 2500 + i * 500,
      yoyo: true,
      repeat: -1
    });
    scene.physics.add.overlap(drop, beam, () => {
      if (!gameOver) {
        drop.setScale(Math.max(drop.scaleX - 0.01, 0.05));
        if (drop.scaleX <= 0.05) {
          drop.setVisible(false);
          scene.cameras.main.stopFollow();
          messageText.setText("☀️ Evaporated by sunlight...");
          endGame(scene);
        } else {
          messageText.setText("☀️ Sunlight shrinks you...");
        }
      }
    });
  });

  // ☁️ Clouds
  const clouds = [
    scene.physics.add.sprite(300, 200, 'cloudSprite').setScale(0.4),
    scene.physics.add.sprite(500, 220, 'cloudSprite').setScale(0.4)
  ];
  clouds.forEach((cloud, i) => {
    cloud.body.setAllowGravity(false);
    cloud.body.setImmovable(true);
    scene.tweens.add({
      targets: cloud,
      x: { from: cloud.x - 150, to: cloud.x + 150 },
      duration: 4000 + i * 700,
      yoyo: true,
      repeat: -1
    });
    scene.physics.add.overlap(drop, cloud, () => {
      if (!gameOver) {
        drop.setScale(Math.min(drop.scaleX + 0.01, 0.3));
        drop.setVisible(true);
        messageText.setText("☁️ Nourished by cloud...");
      }
    });
  });

  // 🟣 Pollution Zones
  [1200, 2200].forEach(y => {
    const p = scene.physics.add.sprite(Phaser.Math.Between(200, 600), y, 'pollutionSprite').setScale(0.2);
    p.body.setAllowGravity(false);
    p.body.setImmovable(true);
    scene.physics.add.overlap(drop, p, () => {
      drop.body.setVelocityY(drop.body.velocity.y * 0.6);
      messageText.setText("🟣 Pollution weakens you...");
    });
  });

  // ⚙️ Industrial Gears
  for (let i = 0; i < 2; i++) {
    const gear = scene.physics.add.sprite(Phaser.Math.Between(100, 700), Phaser.Math.Between(1100, 1500), 'gearsSprite').setScale(0.15);
    gear.body.setAllowGravity(false);
    gear.body.setImmovable(true);
    scene.physics.add.collider(drop, gear, () => {
      scene.cameras.main.stopFollow();
      messageText.setText("⚙️ Crushed by gear...");
      endGame(scene);
    });
  }

  // 🔥 Heat Wall
  const heat = scene.physics.add.sprite(Phaser.Math.Between(100, 700), 1350, 'heatwallSprite').setScale(0.3);
  heat.body.setAllowGravity(false);
  heat.body.setImmovable(true);
  scene.physics.add.overlap(drop, heat, () => {
    drop.setScale(Math.max(drop.scaleX - 0.02, 0.05));
    if (drop.scaleX <= 0.05) {
      drop.setVisible(false);
      scene.cameras.main.stopFollow();
      messageText.setText("🔥 Vaporized by industrial heat...");
      endGame(scene);
    } else {
      messageText.setText("🔥 Heat shrinks you...");
    }
  });

  // 💨 Steam Vent
  const vent = scene.physics.add.sprite(Phaser.Math.Between(100, 700), 1250, 'steamventSprite').setScale(0.2);
  vent.body.setAllowGravity(false);
  vent.body.setImmovable(true);
  scene.physics.add.collider(drop, vent, () => {
    drop.body.setVelocityY(-220);
    messageText.setText("💨 Steam jet pushes you upward...");
  });

  // 🌸 Intro Pad
  const introPad = scene.physics.add.sprite(400, 2030, 'introPadSprite').setScale(0.2);
  introPad.body.setAllowGravity(false);
  introPad.body.setImmovable(true);
  scene.physics.add.overlap(drop, introPad, () => {
    drop.setScale(Math.min(drop.scaleX + 0.01, 0.35));
    messageText.setText("🌸 You enter life-rich soil...");
  });

  // 🌾 Fertile Pad
  const pad = scene.physics.add.sprite(400, 2150, 'padSprite').setScale(0.2);
  pad.body.setAllowGravity(false);
  pad.body.setImmovable(true);
  scene.physics.add.overlap(drop, pad, () => {
    drop.setScale(Math.min(drop.scaleX + 0.03, 0.4));
    messageText.setText("🌾 You are nourished by fertile ground...");
  });

  // 🌬️ Air Vent
  const airVent = scene.physics.add.sprite(600, 2200, 'airventSprite').setScale(0.2);
  airVent.body.setAllowGravity(false);
  airVent.body.setImmovable(true);
  scene.physics.add.collider(drop, airVent, () => {
    drop.body.setVelocityY(-220);
    messageText.setText("🌬️ Fertile vent lifts you...");
  });

  // 🌿 Moving Root
  const root = scene.physics.add.sprite(400, 2450, 'rootSprite').setScale(0.15);
  root.body.setAllowGravity(false);
  root.body.setImmovable(true);
  scene.tweens.add({
    targets: root,
    x: { from: 300, to: 500 },
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
  const vines = scene.physics.add.sprite(600, 2550, 'vinesSprite').setScale(0.15);
  vines.body.setAllowGravity(false);
  vines.body.setImmovable(true);
  scene.physics.add.collider(drop, vines, () => {
    drop.body.setVelocityY(drop.body.velocity.y * 0.7);
    messageText.setText("🍃 Tangled in vines, slowed down...");
  });

  // 🌼 Flower (decoratie)
  scene.add.image(400, 2900, 'flowerSprite').setScale(0.15);

  // 🎮 Besturing (met cursors)
  cursors = scene.input.keyboard.createCursorKeys();

  // Spatie-toets om te resetten
  spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update() {
  if (gameOver) {
    // Wacht gewoon op spatie om te resetten, ook als game over
    if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
      this.scene.restart();
      gameOver = false;
    }
    return;
  }

  // Op elk moment op spatie drukken om te resetten
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    this.scene.restart();
    gameOver = false;
    return;
  }

  const elapsed = (this.time.now - startTime) / 1000;
  timerText.setText(`Time: ${elapsed.toFixed(1)}`);

  // Automatisch een beetje krimpen over tijd
  if (drop.scaleX > 0.15) {
    drop.setScale(Math.max(drop.scaleX - 0.001, 0.15));
  }

  // Links/rechts bewegen
  if (cursors.left.isDown) {
    drop.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    drop.setVelocityX(200);
  } else {
    drop.setVelocityX(0);
  }

  // Springen
  if (Phaser.Input.Keyboard.JustDown(cursors.up) &&
      (drop.body.blocked.down || drop.body.touching.down)) {
    drop.setVelocityY(-350);
    messageText.setText("⬆️ Jump!");
  }
}

function endGame(scene) {
  gameOver = true;
  drop.body.setVelocity(0, 0);
  drop.body.moves = false;
  // Geen automatische restart meer, nu wacht op spatie
}
