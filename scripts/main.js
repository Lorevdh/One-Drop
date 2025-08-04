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

let drop, seed, messageText, timerText;
let gameOver = false;
let startTime;
let dropRadius = 20;
const originalColor = 0x1976d2;
let lastZone = "";

function preload() {
  // Assets kunnen later geladen worden
}

function create() {
  const scene = this;
  scene.cameras.main.setBounds(0, 0, 800, 3000);
  scene.physics.world.setBounds(0, 0, 800, 3000);

  drop = scene.add.circle(400, 100, dropRadius, originalColor);
  scene.physics.add.existing(drop);
  drop.body.setBounce(0.3);
  drop.body.setCollideWorldBounds(true);
  scene.cameras.main.startFollow(drop);

  messageText = scene.add.text(20, 20, "💧 You are One Drop. Reach the seed.", {
    font: "18px Arial", fill: "#333"
  }).setScrollFactor(0);

  timerText = scene.add.text(650, 20, "Time: 0.0", {
    font: "18px Arial", fill: "#333"
  }).setScrollFactor(0);

  startTime = scene.time.now;

  seed = scene.add.circle(400, 2950, 14, 0x4caf50);
  scene.physics.add.existing(seed);
  seed.body.setAllowGravity(false);
  seed.body.setImmovable(true);
  scene.physics.add.collider(drop, seed, () => {
    if (!gameOver) {
      messageText.setText("🌱 Success! One drop sparked life.");
      endGame(scene);
    }
  });

  // 🌤️ Atmosphere Layer
  scene.add.rectangle(400, 300, 800, 600, 0xd0e2f2).setDepth(-1);

  const sunbeams = [
    scene.add.rectangle(400, 300, 140, 20, 0xffff66),
    scene.add.rectangle(500, 500, 100, 20, 0xffff99)
  ];
  sunbeams.forEach((beam, i) => {
    scene.physics.add.existing(beam);
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
        dropRadius = Math.max(dropRadius - 2, 6);
        drop.setRadius(dropRadius);
        if (dropRadius <= 6) {
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

  const clouds = [
    scene.add.ellipse(300, 200, 120, 60, 0xbbdefb, 0.6),
    scene.add.ellipse(500, 220, 120, 60, 0xbbdefb, 0.6)
  ];
  clouds.forEach((cloud, i) => {
    scene.physics.add.existing(cloud);
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
        dropRadius = Math.min(dropRadius + 2, 34);
        drop.setRadius(dropRadius);
        drop.setVisible(true);
        messageText.setText("☁️ Nourished by cloud...");
      }
    });
  });

  const pollutionZones = [
    scene.add.circle(Phaser.Math.Between(200, 600), 1200, 30, 0x4e4e4e),
    scene.add.circle(Phaser.Math.Between(200, 600), 2200, 30, 0x4e4e4e)
  ];
  pollutionZones.forEach(blob => {
    scene.physics.add.existing(blob);
    blob.body.setAllowGravity(false);
    blob.body.setImmovable(true);
    scene.physics.add.overlap(drop, blob, () => {
      drop.body.setVelocityY(drop.body.velocity.y * 0.6);
      messageText.setText("🟣 Pollution weakens you...");
    });
  });

  // 🏭 Industrial Layer
  const offsetY2 = 1000;
  scene.add.rectangle(400, offsetY2 + 300, 800, 600, 0xcfcfcf).setDepth(-1);

  // ⚙️ Random Gears
  for (let i = 0; i < 2; i++) {
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(offsetY2 + 100, offsetY2 + 500);
    const gear = scene.add.rectangle(x, y, 60, 60, 0x888888);
    scene.physics.add.existing(gear);
    gear.body.setAllowGravity(false);
    gear.body.setImmovable(true);
    scene.physics.add.collider(drop, gear, () => {
      scene.cameras.main.stopFollow();
      messageText.setText("⚙️ Crushed by gear...");
      endGame(scene);
    });
  }

  // 🔥 Random Heat Wall
  const heatWall = scene.add.rectangle(
    Phaser.Math.Between(100, 700),
    Phaser.Math.Between(offsetY2 + 150, offsetY2 + 500),
    120, 20, 0xff5722
  );
  scene.physics.add.existing(heatWall);
  heatWall.body.setAllowGravity(false);
  heatWall.body.setImmovable(true);
  scene.physics.add.overlap(drop, heatWall, () => {
    if (!gameOver) {
      dropRadius = Math.max(dropRadius - 3, 6);
      drop.setRadius(dropRadius);
      if (dropRadius <= 6) {
        drop.setVisible(false);
        scene.cameras.main.stopFollow();
        messageText.setText("🔥 Vaporized by industrial heat...");
        endGame(scene);
      } else {
        messageText.setText("🔥 Heat shrinks you...");
      }
    }
  });

  // 💨 Random Steam Vent
  const steamVent = scene.add.rectangle(
    Phaser.Math.Between(100, 700),
    Phaser.Math.Between(offsetY2 + 100, offsetY2 + 400),
    120, 20, 0x90caf9
  );
  scene.physics.add.existing(steamVent);
  steamVent.body.setAllowGravity(false);
  steamVent.body.setImmovable(true);
  scene.physics.add.collider(drop, steamVent, () => {
    drop.body.setVelocityY(-220);
    messageText.setText("💨 Steam jet pushes you upward...");
  });

  // 🟣 Random Pollution Blob
  const pollutionBlob = scene.add.circle(
    Phaser.Math.Between(150, 650),
    Phaser.Math.Between(offsetY2 + 100, offsetY2 + 500),
    30, 0x4e4e4e
  );
  scene.physics.add.existing(pollutionBlob);
  pollutionBlob.body.setAllowGravity(false);
  pollutionBlob.body.setImmovable(true);
  scene.physics.add.overlap(drop, pollutionBlob, () => {
    drop.body.setVelocityY(drop.body.velocity.y * 0.5);
    messageText.setText("🟣 Heavy pollution...");
  });
// 🪵 Visuele overgang tussen Industrial en Fertile Earth
scene.add.rectangle(400, 1950, 800, 700, 0xdbe6c6).setDepth(-1); // Loopt van y=1600 → 2300

// 🌱 Fertile Earth: volledig visueel van y=2000 → y=2900 (zaadhoogte)
const offsetY3 = 2000;
scene.add.rectangle(400, offsetY3 + 450, 800, 900, 0xdbe6c6).setDepth(-1); // y=2450, hoogte=900 → bedekt 2000–2900

// 🌸 Intro Bloempad — vult direct begin
const introPad = scene.add.rectangle(400, offsetY3 + 30, 200, 20, 0xffc1e3);
scene.physics.add.existing(introPad);
introPad.body.setAllowGravity(false);
introPad.body.setImmovable(true);
scene.physics.add.overlap(drop, introPad, () => {
  dropRadius = Math.min(dropRadius + 1, 34);
  messageText.setText("🌸 You enter life-rich soil...");
});

// 🌾 Nutrient Pad — vergroot je
const pad = scene.add.rectangle(400, offsetY3 + 150, 120, 20, 0x8bc34a);
scene.physics.add.existing(pad);
pad.body.setAllowGravity(false);
pad.body.setImmovable(true);
scene.physics.add.overlap(drop, pad, () => {
  dropRadius = Math.min(dropRadius + 4, 40);
  drop.setRadius(dropRadius);
  messageText.setText("🌾 You are nourished by fertile ground...");
});

// 🌬️ Vent — tilt je omhoog
const vent = scene.add.rectangle(600, offsetY3 + 200, 120, 20, 0x90caf9);
scene.physics.add.existing(vent);
vent.body.setAllowGravity(false);
vent.body.setImmovable(true);
scene.physics.add.collider(drop, vent, () => {
  drop.body.setVelocityY(-220);
  messageText.setText("🌬️ Fertile vent lifts you...");
});

// 🌿 Moving Root — vermijden
const movingRoot = scene.add.rectangle(300, offsetY3 + 400, 180, 20, 0x6d4c41);
scene.physics.add.existing(movingRoot);
movingRoot.body.setAllowGravity(false);
movingRoot.body.setImmovable(true);
scene.tweens.add({
  targets: movingRoot,
  x: { from: 200, to: 600 },
  duration: 2000,
  yoyo: true,
  repeat: -1
});
scene.physics.add.collider(drop, movingRoot, () => {
  scene.cameras.main.stopFollow();
  messageText.setText("🌿 Trapped by root in fertile earth...");
  endGame(scene);
});

// 🍄 Extra random elementen in Fertile Earth — y ≤ 2850
for (let i = 0; i < 3; i++) {
  const flowerY = Phaser.Math.Between(offsetY3 + 250, 2800);
  const flowerPad = scene.add.rectangle(
    Phaser.Math.Between(100, 700),
    flowerY,
    80, 20,
    0xffc1e3
  );
  scene.physics.add.existing(flowerPad);
  flowerPad.body.setAllowGravity(false);
  flowerPad.body.setImmovable(true);
  scene.physics.add.overlap(drop, flowerPad, () => {
    dropRadius = Math.min(dropRadius + 2, 44);
    drop.setRadius(dropRadius);
    messageText.setText("🌸 A flower helps you bloom...");
  });
}

// 🌿 Vines — visueel en dynamisch binnen bereik
for (let i = 0; i < 2; i++) {
  const vineY = Phaser.Math.Between(offsetY3 + 300, 2800);
  const vine = scene.add.rectangle(
    Phaser.Math.Between(120, 680),
    vineY,
    16, 120,
    0x388e3c
  );
  scene.physics.add.existing(vine);
  vine.body.setAllowGravity(false);
  vine.body.setImmovable(true);
  scene.tweens.add({
    targets: vine,
    x: { from: vine.x - 40, to: vine.x + 40 },
    duration: 1600,
    yoyo: true,
    repeat: -1
  });
  scene.physics.add.collider(drop, vine, () => {
    messageText.setText("🌿 Entangled in spreading vine...");
  });
}

//End zone 
  // 🌬️ Bodemvent – voorkomt dat je onderaan vastzit
  const bottomVent = scene.add.rectangle(400, 2980, 800, 20, 0x90caf9, 0.4);
  scene.physics.add.existing(bottomVent);
  bottomVent.body.setAllowGravity(false);
  bottomVent.body.setImmovable(true);
  scene.physics.add.collider(drop, bottomVent, () => {
    drop.body.setVelocityY(-180);
    messageText.setText("🌬️ Lifted from root hollow...");
  });

  // 🎮 Controls
  const resetHint = scene.add.text(20, scene.scale.height - 40, 'SPACE to reset', {
  font: '18px Arial',
  fill: '#333'
});
resetHint.setScrollFactor(0); // Zorg dat het mee blijft bewegen met de camera

  scene.input.keyboard.on("keydown-LEFT", () => {
    if (!gameOver) drop.body.setVelocityX(-120);
  });

  scene.input.keyboard.on("keydown-RIGHT", () => {
    if (!gameOver) drop.body.setVelocityX(120);
  });

scene.input.keyboard.on("keydown-SPACE", () => {
  resetDrop(scene);
});
}

function update() {
  if (gameOver) return;
  const elapsed = (this.time.now - startTime) / 1000;
  timerText.setText("Time: " + elapsed.toFixed(1));

  const y = drop.y;
  let zoneName = "";

  if (y < 1000) zoneName = "Atmosphere";
  else if (y >= 1000 && y < 2000) zoneName = "Industrial Layer";
  else if (y >= 2000 && y < 3000) zoneName = "Fertile Earth";

  if (zoneName !== lastZone && !gameOver) {
    messageText.setText(`💧 One Drop in: ${zoneName}`);
    lastZone = zoneName;
  }
}

function endGame(scene) {
  gameOver = true;
  drop.body.setVelocity(0, 0);
  scene.time.delayedCall(1000, () => {
    messageText.setText("Press SPACE to try again");
  });
}

function resetDrop(scene) {
  drop.setPosition(400, 100);
  drop.body.setVelocity(0, 0);
  dropRadius = 20;
  drop.setRadius(dropRadius);
  drop.setVisible(true);
  scene.cameras.main.startFollow(drop);
  gameOver = false;
  lastZone = "";
  messageText.setText("💧 You are One Drop. Reach the seed.");
  startTime = scene.time.now;
}