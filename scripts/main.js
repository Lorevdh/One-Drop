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

function preload() {
  // Later kunnen ambient geluiden en visuals geladen worden
}

function create() {
  // 🌍 Vergroot de spelwereld
  this.cameras.main.setBounds(0, 0, 800, 3000);
  this.physics.world.setBounds(0, 0, 800, 3000);

  // 💧 Druppel
  drop = this.add.circle(400, 100, dropRadius, originalColor);
  this.physics.add.existing(drop);
  drop.body.setBounce(0.3);
  drop.body.setCollideWorldBounds(true);
  this.cameras.main.startFollow(drop);

  // 🌱 Zaadje
  seed = this.add.circle(400, 2900, 14, 0x4caf50);
  this.physics.add.existing(seed);
  seed.body.setAllowGravity(false);
  seed.body.setImmovable(true);
  this.physics.add.collider(drop, seed, () => {
    if (!gameOver) {
      messageText.setText("🌱 Success! One drop sparked life.");
      endGame(this);
    }
  });

  // ☀️ Zonnestralen
  const sunbeams = [
    this.add.rectangle(400, 300, 140, 20, 0xffff66),
    this.add.rectangle(500, 500, 100, 20, 0xffff99)
  ];
  sunbeams.forEach((beam, i) => {
    this.physics.add.existing(beam);
    beam.body.setAllowGravity(false);
    beam.body.setImmovable(true);
    this.tweens.add({
      targets: beam,
      x: { from: beam.x - 80, to: beam.x + 80 },
      duration: 2500 + i * 500,
      yoyo: true,
      repeat: -1
    });

    this.physics.add.overlap(drop, beam, () => {
      if (!gameOver) {
        dropRadius = Math.max(dropRadius - 2, 6);
        drop.setRadius(dropRadius);
        if (dropRadius <= 6) {
          drop.setVisible(false);            // 🫧 Verdampen — druppel verdwijnt
          this.cameras.main.stopFollow();    // 📷 Camera stopt met volgen
          messageText.setText("☀️ Evaporated by sunlight...");
          endGame(this);
        } else {
          messageText.setText("☀️ Sunlight shrinks you...");
        }
      }
    });
  });

  // ☁️ Wolken
  const clouds = [
    this.add.ellipse(300, 200, 120, 60, 0xbbdefb, 0.6),
    this.add.ellipse(500, 220, 120, 60, 0xbbdefb, 0.6)
  ];
  clouds.forEach((cloud, i) => {
    this.physics.add.existing(cloud);
    cloud.body.setAllowGravity(false);
    cloud.body.setImmovable(true);
    this.tweens.add({
      targets: cloud,
      x: { from: cloud.x - 150, to: cloud.x + 150 },
      duration: 4000 + i * 700,
      yoyo: true,
      repeat: -1
    });

    this.physics.add.overlap(drop, cloud, () => {
      if (!gameOver) {
        dropRadius = Math.min(dropRadius + 2, 34);
        drop.setRadius(dropRadius);
        drop.setVisible(true);              // 💫 Herboren als die eerder was verdampt
        messageText.setText("☁️ Nourished by cloud...");
      }
    });
  });

  // 🌿 Wortels
  const rootTraps = [
    this.add.rectangle(200, 900, 180, 20, 0x6d4c41),
    this.add.rectangle(600, 1600, 180, 20, 0x6d4c41)
  ];
  rootTraps.forEach(root => {
    this.physics.add.existing(root);
    root.body.setAllowGravity(false);
    root.body.setImmovable(true);
    this.physics.add.collider(drop, root, () => {
      this.cameras.main.stopFollow();       // 📷 Camera stopt bij absorptie
      messageText.setText("🌿 Absorbed by thirsty root...");
      endGame(this);
    });
  });

  // 🟣 Vervuiling
  const pollutionZones = [
    this.add.circle(350, 1200, 30, 0x4e4e4e),
    this.add.circle(450, 2200, 30, 0x4e4e4e)
  ];
  pollutionZones.forEach(blob => {
    this.physics.add.existing(blob);
    blob.body.setAllowGravity(false);
    blob.body.setImmovable(true);
    this.physics.add.overlap(drop, blob, () => {
      drop.body.setVelocityY(drop.body.velocity.y * 0.6);
      messageText.setText("🟣 Pollution weakens you...");
    });
  });

  // 🎮 Besturing
  this.input.keyboard.on("keydown-LEFT", () => {
    if (!gameOver) drop.body.setVelocityX(-120);
  });
  this.input.keyboard.on("keydown-RIGHT", () => {
    if (!gameOver) drop.body.setVelocityX(120);
  });

  // 🔄 Spatie = reset
  this.input.keyboard.on("keydown-SPACE", () => {
    if (gameOver) resetDrop(this);
  });

  // 📜 Tekst
  messageText = this.add.text(20, 20, "💧 You are One Drop. Reach the seed.", {
    font: "18px Arial",
    fill: "#333"
  }).setScrollFactor(0);

  timerText = this.add.text(650, 20, "Time: 0.0", {
    font: "18px Arial",
    fill: "#333"
  }).setScrollFactor(0);

  startTime = this.time.now;
}

function update() {
  if (gameOver) return;
  const elapsed = (this.time.now - startTime) / 1000;
  timerText.setText("Time: " + elapsed.toFixed(1));
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
  drop.setVisible(true);                    // ✨ Herstel zichtbaarheid
  scene.cameras.main.startFollow(drop);     // 🎥 Camera weer volgen
  gameOver = false;
  messageText.setText("💧 You are One Drop. Reach the seed.");
  startTime = scene.time.now;
}