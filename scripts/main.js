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

let drop, seed, sunbeam, messageText, timerText;
let gameOver = false;
let startTime;

function preload() {
  // Later kunnen ambient geluiden en visuals geladen worden
}

function create() {
  // 🌍 Vergroot de spelwereld
  this.cameras.main.setBounds(0, 0, 800, 3000);
  this.physics.world.setBounds(0, 0, 800, 3000);

  // 💧 De waterdruppel
  drop = this.add.circle(400, 100, 20, 0x1976d2);
  this.physics.add.existing(drop);
  drop.body.setBounce(0.3);
  drop.body.setCollideWorldBounds(true);
  this.cameras.main.startFollow(drop);

  // 🌱 Het dorstige zaadje diep in de aarde
  seed = this.add.circle(400, 2900, 14, 0x4caf50);
  this.physics.add.existing(seed);
  seed.body.setAllowGravity(false);
  seed.body.setImmovable(true);

  // 🌤️ Zonnestralen (verdamping) hoog in de lucht
  const evaporators = [
    this.add.rectangle(400, 300, 140, 20, 0xffff66),
    this.add.rectangle(500, 500, 100, 20, 0xffff99)
  ];
  evaporators.forEach(evap => {
    this.physics.add.existing(evap);
    evap.body.setAllowGravity(false);
    evap.body.setImmovable(true);
    this.physics.add.collider(drop, evap, () => {
      if (!gameOver) {
        messageText.setText("☀️ Evaporated by sunlight...");
        endGame(this);
      }
    });
  });

  // 🌿 Wortelstructuren (absorptie)
  const rootTraps = [
    this.add.rectangle(200, 900, 180, 20, 0x6d4c41),
    this.add.rectangle(600, 1600, 180, 20, 0x6d4c41)
  ];
  rootTraps.forEach(root => {
    this.physics.add.existing(root);
    root.body.setAllowGravity(false);
    root.body.setImmovable(true);
    this.physics.add.collider(drop, root, () => {
      messageText.setText("🌿 Absorbed by thirsty root...");
      endGame(this);
    });
  });

  // 🟣 Vervuilingszones (langzame afbraak)
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

  // 💧 Collide with seed = success
  this.physics.add.collider(drop, seed, () => {
    if (!gameOver) {
      messageText.setText("🌱 Success! One drop sparked life.");
      endGame(this);
    }
  });

  // 🎮 Besturing
  this.input.keyboard.on("keydown-LEFT", () => {
    if (!gameOver) drop.body.setVelocityX(-120);
  });
  this.input.keyboard.on("keydown-RIGHT", () => {
    if (!gameOver) drop.body.setVelocityX(120);
  });

  // 🔄 Reset via spatie
  this.input.keyboard.on("keydown-SPACE", () => {
    if (gameOver) resetDrop(this);
  });

  // 📜 Verhaaltekst — vast op scherm
  messageText = this.add.text(20, 20, "You are One Drop. Reach the seed.", {
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
  gameOver = false;
  messageText.setText("You are One Drop. Reach the seed.");
  startTime = scene.time.now;
}