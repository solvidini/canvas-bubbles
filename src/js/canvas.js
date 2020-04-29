import {
  randomIntFromRange,
  randomColor,
  distance,
  resolveCollision,
} from "./utils.js";

console.log("works");

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2,
};

const numberOfParticles = 50;
const friction = 0.95;
const colors = ["#f98593", "#da86f9", "#fcace0", "#9fcbf9"];

// Event Listeners
addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

addEventListener("contextmenu", (event) => {
  event.preventDefault();
  for (let i = 0; i < particles.length; i++) {
    if (
      distance(mouse.x, mouse.y, particles[i].x, particles[i].y) <=
      particles[i].radius
    ) {
      particles[i].velocity.x = (particles[i].x - mouse.x) * 0.7;
      particles[i].velocity.y = (particles[i].y - mouse.y) * 0.7;
    }
  }
});

addEventListener("mousedown", (event) => {
  for (let i = 0; i < particles.length; i++) {
    if (
      distance(mouse.x, mouse.y, particles[i].x, particles[i].y) <=
      particles[i].radius
    ) {
      particles[i].velocity.x = 0;
      particles[i].velocity.y = 0;
      particles[i].holdX = particles[i].x - mouse.x;
      particles[i].holdY = particles[i].y - mouse.y;
      particles[i].hold = true;
    }
  }
});

addEventListener("mouseup", (event) => {
  for (let i = 0; i < particles.length; i++) {
    if (
      distance(mouse.x, mouse.y, particles[i].x, particles[i].y) <=
      particles[i].radius
    ) {
      particles[i].hold = false;
    }
  }
});

// Objects
class Particle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8,
    };
    this.radius = radius;
    this.color = color;
    this.baseColor = color;
    this.mass = 1;
    this.opacity = 0;
    this.hold = false;
    this.holdX;
    this.holdY;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.globalAlpha = this.opacity; // !
    c.fillStyle = this.color;
    c.fill();
    c.globalAlpha = 1;
    c.strokeStyle = this.color;
    c.stroke();
    c.closePath();
  }

  update(particles) {
    this.draw();
    // particles collision detection
    for (let i = 0; i < particles.length; i++) {
      if (this === particles[i]) continue;
      if (
        distance(this.x, this.y, particles[i].x, particles[i].y) <
        this.radius * 2
      ) {
        if (this.hold) {
          particles[i].velocity.x = 0;
          particles[i].velocity.y = 0;
        }
        this.velocity.x = this.velocity.x * friction;
        this.velocity.y = this.velocity.y * friction;
        resolveCollision(this, particles[i]);
      }
    }

    // walls collision detection
    if (
      this.x - this.radius + this.velocity.x < 0 ||
      this.x + this.radius + this.velocity.x > innerWidth
    ) {
      this.hold = false;
      this.velocity.x = -this.velocity.x;
      this.velocity.x = this.velocity.x * friction;
      this.velocity.y = this.velocity.y * friction;
    }
    if (
      this.y - this.radius + this.velocity.y < 0 ||
      this.y + this.radius + this.velocity.y > innerHeight
    ) {
      this.hold = false;
      this.velocity.y = -this.velocity.y;
      this.velocity.x = this.velocity.x * friction;
      this.velocity.y = this.velocity.y * friction;
    }

    // mouse near particles
    if (
      distance(mouse.x, mouse.y, this.x, this.y) < 200 &&
      this.opacity < 0.8
    ) {
      this.opacity += 0.02;
    } else if (this.opacity > 0) {
      this.opacity -= 0.02;
      this.opacity = Math.max(0, this.opacity);
    }

    // is on hold
    if (this.hold) {
      this.x = this.holdX + mouse.x;
      this.y = this.holdY + mouse.y;
    }

    // check if stagnancy
    if (this.velocity.x === 0 && this.velocity.y === 0) {
      this.color = 'red';
    } else {
      this.color = this.baseColor
    }

    // change coordinates by velocity
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

// Implementation
let particles;

function init() {
  particles = [];

  for (let i = 0; i < numberOfParticles; i++) {
    const radius = Math.random() * 20 + 40;
    let x = randomIntFromRange(radius, canvas.width - radius);
    let y = randomIntFromRange(radius, canvas.height - radius);
    const color = randomColor(colors);

    if (i !== 0) {
      for (let j = 0; j < particles.length; j++) {
        if (distance(x, y, particles[j].x, particles[j].y) < radius * 2) {
          x = randomIntFromRange(radius, canvas.width - radius);
          y = randomIntFromRange(radius, canvas.height - radius);

          j = -1;
        }
      }
    }

    particles.push(new Particle(x, y, radius, color));
  }
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    particle.update(particles);
  });
}

init();
animate();
