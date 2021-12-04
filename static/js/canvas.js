import {
  randomIntFromRange,
  randomColor,
  distance,
  resolveCollision,
} from "./utils.js";

const options = document.querySelector("#options");

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const position = {
  x: innerWidth / 2,
  y: innerHeight / 2,
};

let amountOfParticles = 40;
let friction = 0.99;
let maxRadius = 50;
let minRadius = 35;
const colors = ["#f3c33e", "#e5d681", "#daac2f", "#ffdf85"];

// Event Listeners
options.addEventListener("submit", (event) => {
  event.preventDefault();
  let particlesValue = options.elements.particlesAmount.value;
  let frictionValue = options.elements.friction.value;
  let maxRadiusValue = options.elements.maxRadius.value;
  let minRadiusValue = options.elements.minRadius.value;

  try {
    if (particlesValue.trim() === "") {
      amountOfParticles = 40;
    } else if (!isNaN(particlesValue.trim())) {
      if (particlesValue > 0) {
        amountOfParticles = particlesValue.trim();
      } else {
        throw new Error("Amount of particles must be a positive value!");
      }
    } else {
      throw new Error("Wrong amount of particles!");
    }

    if (frictionValue.trim() === "") {
      friction = 0.99;
    } else if (!isNaN(frictionValue.trim())) {
      if (frictionValue >= 0 && frictionValue <= 1) {
        friction = frictionValue.trim();
      } else {
        throw new Error("Friction value must be between 0 and 1");
      }
    } else {
      throw new Error("Wrong friction number!");
    }

    if (maxRadiusValue.trim() === "") {
      maxRadius = 50;
    } else if (!isNaN(maxRadiusValue)) {
      if (maxRadiusValue > 160) {
        throw new Error("Max radius value cannot be higher than 160!");
      } else if (maxRadiusValue < 20) {
        throw new Error("Max radius value cannot be lower than 20!");
      } else {
        maxRadius = parseInt(maxRadiusValue);
      }
    } else {
      throw new Error("Wrong max radius number!");
    }

    if (minRadiusValue.trim() === "") {
      minRadius = 35;
    } else if (!isNaN(minRadiusValue)) {
      if (minRadiusValue < 15) {
        throw new Error("Min radius value cannot be lower than 15!");
      } else if (minRadiusValue > 150) {
        throw new Error("Min radius value cannot be higher than 150!");
      } else {
        minRadius = parseInt(minRadiusValue);
      }
    } else {
      throw new Error("Wrong min radius number!");
    }

    maxRadiusValue = maxRadiusValue ? maxRadiusValue : 50;
    minRadiusValue = minRadiusValue ? minRadiusValue : 35;

    if (parseInt(minRadiusValue) > parseInt(maxRadiusValue)) {
      maxRadius = 50;
      minRadius = 35;
      throw new Error("Max radius must be higher than min radius!");
    }
  } catch (error) {
    alert(error);
  }

  init();
});

const touchMove = (event) => {
  const touch = event?.touches?.[0];
  if (touch) {
    position.x = touch.clientX;
    position.y = touch.clientY;
  }
  position.x = event.clientX;
  position.y = event.clientY;
};

canvas.addEventListener("mousemove", touchMove);
canvas.addEventListener("touchmove", touchMove);

canvas.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  for (let i = 0; i < particles.length; i++) {
    if (
      distance(position.x, position.y, particles[i].x, particles[i].y) <=
      particles[i].radius
    ) {
      particles[i].velocity.x = (particles[i].x - position.x) * 0.7;
      particles[i].velocity.y = (particles[i].y - position.y) * 0.7;
    }
  }
});

const touchStart = () => {
  for (let i = 0; i < particles.length; i++) {
    if (
      distance(position.x, position.y, particles[i].x, particles[i].y) <=
      particles[i].radius
    ) {
      particles[i].velocity.x = 0;
      particles[i].velocity.y = 0;
      particles[i].holdX = particles[i].x - position.x;
      particles[i].holdY = particles[i].y - position.y;
      particles[i].hold = true;
    }
  }
};

canvas.addEventListener("mousedown", touchStart);
canvas.addEventListener("touchstart", touchStart);

const touchEnd = () => {
  for (let i = 0; i < particles.length; i++) {
    if (
      distance(position.x, position.y, particles[i].x, particles[i].y) <=
      particles[i].radius
    ) {
      particles[i].hold = false;
    }
  }
};

canvas.addEventListener("mouseup", touchEnd);
canvas.addEventListener("touchend", touchEnd);

// Objects
class Particle {
  constructor(x, y, radius, color, mass) {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8,
    };
    this.radius = radius;
    this.color = color;
    this.baseColor = color;
    this.mass = mass;
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
        this.radius + particles[i].radius
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

    // position near particles
    if (
      distance(position.x, position.y, this.x, this.y) < 500 &&
      this.opacity < 0.8
    ) {
      this.opacity += 0.02;
    } else if (this.opacity > 0) {
      this.opacity -= 0.02;
      this.opacity = Math.max(0, this.opacity);
    }

    // is on hold
    if (this.hold) {
      this.x = this.holdX + position.x;
      this.y = this.holdY + position.y;
    }

    // check stagnancy
    if (this.velocity.x === 0 && this.velocity.y === 0) {
      this.color = "#ee3462";
    } else {
      this.color = this.baseColor;
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

  for (let i = 0; i < amountOfParticles; i++) {
    let infiniteLoopDetector = 0;
    const radius = randomIntFromRange(minRadius, maxRadius);
    let x = randomIntFromRange(radius, canvas.width - radius);
    let y = randomIntFromRange(radius, canvas.height - radius);
    const color = randomColor(colors);
    // const mass = radius;
    const mass = 1;

    if (i !== 0) {
      for (let j = 0; j < particles.length; j++) {
        if (
          distance(x, y, particles[j].x, particles[j].y) <
          radius + particles[j].radius
        ) {
          x = randomIntFromRange(radius, canvas.width - radius);
          y = randomIntFromRange(radius, canvas.height - radius);

          j = -1;
          infiniteLoopDetector++;

          if (infiniteLoopDetector > 100000) {
            amountOfParticles = 2;
            infiniteLoopDetector = 0;
            alert(
              "Too many particles for current screen size! Decrease the amount!"
            );
            init();
          }
        }
      }
    }

    particles.push(new Particle(x, y, radius, color, mass));
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
