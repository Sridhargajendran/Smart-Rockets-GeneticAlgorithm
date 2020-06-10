var population;
var lifespan = 400;
var count = 0;
var lifep;
var target;
var maxforce = 0.2;
var rx = 200;
var ry = 150;
var rw = 200;
var rh = 10;

function setup() {
  createCanvas(600, 400);

  target = createVector(width / 2, 40);
  population = new Population();
  lifep = createP();
}

function draw() {
  background(0);

  population.run();

  count++;

  if (count == lifespan) {
    count = 0;
    //population = new Population();

    population.evaluate();
    population.selection();
  }

  fill(255);
  ellipse(target.x, target.y, 16, 16);
  rect(rx, ry, rw, rh);

  lifep.html(count);
}

function Population() {
  this.rockets = [];
  this.popsize = 40;
  this.matingpool = [];

  for (var i = 0; i < this.popsize; i++) {
    this.rockets[i] = new Rocket();
  }

  this.evaluate = function () {
    var maxfit = 0;
    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].calcFitness();

      if (this.rockets[i].fitness > maxfit) {
        maxfit = this.rockets[i].fitness;
      }
    }

    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].fitness /= maxfit;
    }

    this.matingpool = [];
    for (var i = 0; i < this.popsize; i++) {
      var n = this.rockets[i].fitness * 100;

      for (var j = 0; j < n; j++) {
        this.matingpool.push(this.rockets[i]);
      }
    }
  };

  this.selection = function () {
    var newrockets = [];

    for (var i = 0; i < this.rockets.length; i++) {
      var parentA = random(this.matingpool).dna;
      var parentB = random(this.matingpool).dna;
      var child = parentA.crossOver(parentB);
      child.mutation();
      newrockets[i] = new Rocket(child);
    }

    this.rockets = newrockets;
  };

  this.run = function () {
    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].update();
      this.rockets[i].show();
    }
  };
}

function DNA(genes) {
  if (genes) {
    this.genes = genes;
  } else {
    this.genes = [];

    for (var i = 0; i < lifespan; i++) {
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(maxforce);
    }
  }

  this.crossOver = function (partner) {
    var newgenes = [];
    var mid = floor(random(this.genes.length));

    for (var i = 0; i < this.genes.length; i++) {
      if (i > mid) {
        newgenes[i] = this.genes[i];
      } else {
        newgenes[i] = partner.genes[i];
      }
    }

    return new DNA(newgenes);
  };

  this.mutation = function () {
    for (var i = 0; i < this.genes.length; i++) {
      if (random(1) < 0.01) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(maxforce);
      }
    }
  };
}

function Rocket(dna) {
  this.pos = createVector(width / 2, height);
  this.vel = createVector();
  this.acc = createVector();
  if (dna) {
    this.dna = dna;
  } else {
    this.dna = new DNA();
  }
  this.completed = false;
  this.crashed = false;

  this.fitness = 0;

  this.calcFitness = function () {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    //this.fitness = map(d, 0, width, width, 0);
    //Better fitness function than the above
    this.fitness = 1 / pow(d, 8);
    //this.fitness = 1 / (pow(d, 8) - 1);

    if (this.completed) {
      this.fitness *= 10;
    }
    if (this.crashed) {
      this.fitness /= 10;
    }
  };

  this.applyForce = function (force) {
    this.acc.add(force);
  };

  this.update = function () {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if (d < 10) {
      this.completed = true;
      this.pos = target.copy();
    }

    if (
      this.pos.x > rx &&
      this.pos.x < rx + rw &&
      this.pos.y > ry &&
      this.pos.y < ry + rh
    ) {
      this.crashed = true;
    }

    if (this.pos.x > width || this.pos.x < 0) {
      this.crashed = true;
    }
    if (this.pos.y > height || this.pos.y < 0) {
      this.crashed = true;
    }
    this.applyForce(this.dna.genes[count]);

    if (!this.completed && !this.crashed) {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.vel.limit(4);
    }
  };

  this.show = function () {
    push();
    noStroke();
    fill(255, 150);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0, 0, 25, 5);
    pop();
  };
}
