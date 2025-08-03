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
let lastZoneIndex = -1;

const ZONE_HEIGHT = 3000;

const zones = [
  {
    name: "Atmosphere",
    color: "#d0e2f2",
    evaporators: [{ x: 400, y: 300 }, { x: 500, y: 600 }],
    windGusts: [{ x: 300, y: 100, force: 200 }],
    heatWalls: [],
    vents: [],
    mistZones: [],
    roots: [],
    seedY: null
  },
  {
    name: "Industrial Layer",
    color: "#cfcfcf",
    gears: [{ x: 250, y: 900 }, { x: 550, y: 1000 }],
    pollutionZones: [{ x: 350, y: 800 }],
    heatWalls: [{ x: 200, y: 950 }],
    vents: [],
    mistZones: [],
    roots: [{ x: 200, y: 1300 }],
    seedY: null
  },
  {
    name: "Fertile Earth",
    color: "#dbe6c6",
    movingRoots: [{ x: 600, y: 1800 }],
    heatWalls: [],
    vents: [{ x: 600, y: 1900 }],
    mistZones: [],
    roots: [],
    seedY: null
  },
  {
    name: "Spiritual Depth",
    color: "#e0ccff",
    pollutionZones: [{ x: 400, y: 2300 }],
    reflectPools: [{ x: 400, y: 2500 }],
    mistZones: [{ x: 400, y: 2400 }],
    roots: [],
    seedY: null
  },
  {
    name: "Seed Chamber",
    color: "#ffffff",
    roots: [{ x: 400, y: 2700 }],
    seedY: 2800
  }
];

function preload() {
  // Optional: load assets here
}

function create() {
  const totalHeight = ZONE_HEIGHT * zones.length;
  this.cameras.main.setBounds(0, 0, 800, totalHeight);
  this.physics.world.setBounds(0, 0, 800, totalHeight);

  drop = this.add.circle(400, 100, 20, 0x1976d2);
  this.physics.add.existing(drop);
  drop.body.setBounce(0.3);
  drop.body.setCollideWorldBounds(true);
  this.cameras.main.startFollow(drop);

  messageText = this.add.text(20, 20, "💧 You are One Drop. Reach the seed.", {
    font: "18px Arial",
    fill: "#333"
  }).setScrollFactor(0);

  timerText = this.add.text(650, 20, "Time: 0.0", {
    font: "18px Arial",
    fill: "#333"
  }).setScrollFactor(0);

  startTime = this.time.now;
  zones.forEach((zone, index) => {
    const offsetY = index * ZONE_HEIGHT;

    // Background
    this.add.rectangle(400, offsetY + ZONE_HEIGHT / 2, 800, ZONE_HEIGHT, Phaser.Display.Color.HexStringToColor(zone.color).color).setDepth(-1);

    // ☀️ Evaporators
    zone.evaporators?.forEach(pos => {
      const evap = this.add.rectangle(pos.x, offsetY + pos.y, 140, 20, 0xffff66);
      this.physics.add.existing(evap);
      evap.body.setAllowGravity(false);
      evap.body.setImmovable(true);
      this.physics.add.collider(drop, evap, () => {
        if (!gameOver) {
          messageText.setText("☀️ Evaporated in " + zone.name);
          endGame(this);
        }
      });
    });

    // 💨 Wind Gusts
    zone.windGusts?.forEach(gust => {
      const gustArea = this.add.rectangle(gust.x, offsetY + gust.y, 120, 40, 0x87ceeb, 0.3);
      this.physics.add.existing(gustArea);
      gustArea.body.setAllowGravity(false);
      gustArea.body.setImmovable(true);
      this.physics.add.overlap(drop, gustArea, () => {
        drop.body.setVelocityX(gust.force);
        messageText.setText("💨 Wind pushes you in " + zone.name);
      });
    });

    // ⚙️ Gears
    zone.gears?.forEach(pos => {
      const gear = this.add.rectangle(pos.x, offsetY + pos.y, 60, 60, 0x888888);
      this.physics.add.existing(gear);
      gear.body.setAllowGravity(false);
      gear.body.setImmovable(true);
      this.physics.add.collider(drop, gear, () => {
        messageText.setText("⚙️ Crushed by gear in " + zone.name);
        endGame(this);
      });
    });

    // 🌿 Moving Roots
    zone.movingRoots?.forEach(pos => {
      const root = this.add.rectangle(pos.x, offsetY + pos.y, 180, 20, 0x6d4c41);
      this.physics.add.existing(root);
      root.body.setAllowGravity(false);
      root.body.setImmovable(true);
      this.tweens.add({
        targets: root,
        y: offsetY + pos.y - 50,
        duration: 1200,
        yoyo: true,
        repeat: -1
      });
      this.physics.add.collider(drop, root, () => {
        messageText.setText("🌿 Grabbed by moving root in " + zone.name);
        endGame(this);
      });
    });

    // 🟣 Pollution Zones
    zone.pollutionZones?.forEach(pos => {
      const blob = this.add.circle(pos.x, offsetY + pos.y, 30, 0x4e4e4e);
      this.physics.add.existing(blob);
      blob.body.setAllowGravity(false);
      blob.body.setImmovable(true);
      this.physics.add.overlap(drop, blob, () => {
        drop.body.setVelocityY(drop.body.velocity.y * 0.6);
        messageText.setText("🟣 Pollution weakens you in " + zone.name);
      });
    });

    // 🔁 Reflect Pools
    zone.reflectPools?.forEach(pos => {
      const pool = this.add.circle(pos.x, offsetY + pos.y, 40, 0x8e44ad, 0.6);
      this.physics.add.existing(pool);
      pool.body.setAllowGravity(false);
      pool.body.setImmovable(true);
      this.physics.add.overlap(drop, pool, () => {
        drop.setPosition(400, offsetY + 100);
        drop.body.setVelocityY(-100);
        messageText.setText("🔮 Reflection resets your path in " + zone.name);
      });
    });

    // 🔥 Heat Walls
    zone.heatWalls?.forEach(pos => {
      const wall = this.add.rectangle(pos.x, offsetY + pos.y, 120, 20, 0xff5722);
      this.physics.add.existing(wall);
      wall.body.setAllowGravity(false);
      wall.body.setImmovable(true);
      this.physics.add.collider(drop, wall, () => {
        drop.body.setVelocityY(-250);
        messageText.setText("🔥 Heat lifts you in " + zone.name);
      });
    });

    // 🌬️ Vents
    zone.vents?.forEach(pos => {
      const vent = this.add.rectangle(pos.x, offsetY + pos.y, 120, 20, 0x90caf9);
      this.physics.add.existing(vent);
      vent.body.setAllowGravity(false);
      vent.body.setImmovable(true);
      this.physics.add.overlap(drop, vent, () => {
        drop.angle += 15;
        messageText.setText("🌬️ Turbulent vent in " + zone.name);
      });
    });

    // 🌫️ Mist Zones
    zone.mistZones?.forEach(pos => {
      const mist = this.add.rectangle(pos.x, offsetY + pos.y, 200, 60, 0xbbdefb, 0.5);
      this.physics.add.existing(mist);
      mist.body.setAllowGravity(false);
      mist.body.setImmovable(true);
      this.physics.add.overlap(drop, mist, () => {
        this.cameras.main.shake(150, 0.005);
        messageText.setText("🌫️ Mist clouds your vision in " + zone.name);
      });
    });

    // 🌿 Static Roots
    zone.roots?.forEach(pos => {
      const root = this.add.rectangle(pos.x, offsetY + pos.y, 180, 20, 0x6d4c41);
      this.physics.add.existing(root);
      root.body.setAllowGravity(false);
      root.body.setImmovable(true);
      this.physics.add.collider(drop, root, () => {
        messageText.setText("🌿 Absorbed by root in " + zone.name);
        endGame(this);
      });
    });

    // 🌱 Seed
    if (zone.seedY) {
      seed = this.add.circle(400, offsetY + zone.seedY, 14, 0x4caf50);
      this.physics.add.existing(seed);
      seed.body.setAllowGravity(false);
      seed.body.setImmovable(true);
      this.physics.add.collider(drop, seed, () => {
        if (!gameOver) {
          messageText.setText("🌱 Success! One Drop sparked life.");
          endGame(this);
        }
      });
    }
  });

  // Controls
  this.input.keyboard.on("keydown-LEFT", () => {
    if (!gameOver) drop.body.setVelocityX(-200);
  });
  this.input.keyboard.on("keydown-RIGHT", () => {
    if (!gameOver) drop.body.setVelocityX(200);
  });
  this.input.keyboard.on("keydown-SPACE", () => {
    if (gameOver) resetDrop(this);
  });
}
function update() {
  if (gameOver) return;

  // ⏱️ Update timer
  const elapsed = (this.time.now - startTime) / 1000;
  timerText.setText("Time: " + elapsed.toFixed(1));

  // 🗺️ Zone tracking
  const currentZoneIndex = Math.floor(drop.y / ZONE_HEIGHT);

  if (currentZoneIndex !== lastZoneIndex && zones[currentZoneIndex]) {
    messageText.setText("💧 One Drop in: " + zones[currentZoneIndex].name);
    lastZoneIndex = currentZoneIndex;

    
  }
}

function endGame(scene) {
  gameOver = true;
  drop.body.setVelocity(0, 0);
  scene.time.delayedCall(1200, () => {
    messageText.setText("Press SPACE to restart");
  });
}

function resetDrop(scene) {
  drop.setPosition(400, 100);
  drop.body.setVelocity(0, 0);
  drop.angle = 0;
  gameOver = false;
  lastZoneIndex = -1;
  scene.cameras.main.setZoom(1);
  messageText.setText("💧 You are One Drop. Reach the seed.");
  startTime = scene.time.now;
}