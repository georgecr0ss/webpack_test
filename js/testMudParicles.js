(function () {

    //Canvas Flames
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var W = 300, H = 250;
    canvas.width = W;
    canvas.height = H;
    //var background = new Image();
    //background.src = 'img/fireball.jpg';
    //ctx.drawImage(background,10,10,canvas.width, canvas.height);
    //ctx.fillStyle = "rgba(100, 150, 100, 0.6)";
    var particles = [];
    var mouse = {};
    //Lets create some particles now
    var particle_count = 30;
    for (var i = 0; i < particle_count; i++) {
        particles.push(new particle());
    }

    function particle() {
        //speed, life, location, life, colors
        //speed.x range = -2.5 to 2.5
        //speed.y range = -15 to -5 to make it move upwards
        //lets change the Y speed to make it look like a flame
        this.speed = {x: -20 + Math.random() * 30, y: -20 + Math.random() * 10};
        //location = mouse coordinates
        this.location = {x: W / 2.5, y: H / 1.1};
        //radius range = 10-30
        this.radius = 13 + Math.random() * 1;
        //life range = 20-30
        this.life = 30 + Math.random() * 5000;
        this.remaining_life = this.life;
        //colors
        var minR = 76;
        var maxR = 80;
        var minG = 63;
        var maxG = 67;
        var minB = 30;
        var maxB = 33;
        //(111,94,47)
        //(66,56,28)
        //200,169,84
        //80,67,33
        this.r = Math.round(Math.random() * (maxR - minR + 1)) + minR;
        this.g = Math.round(Math.random() * (maxG - minG + 1)) + minG;
        this.b = Math.round(Math.random() * (maxB - minB + 1)) + minB;
    }

    function draw() {
        //Painting the canvas black
        //Time for lighting magic
        //particles are painted with "lighter"
        //In the next frame the background is painted normally without blending to the
        //previous frame
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(0, 0, 0,0)";
        ctx.background="transparent";
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "color";

        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            ctx.beginPath();
            //changing opacity according to the life.
            //opacity goes to 0 at the end of life of a particle
            p.opacity = Math.round(p.remaining_life / p.life * 1000) / 100
            //a gradient instead of white fill
            var gradient = ctx.createRadialGradient(p.location.x, p.location.y, 0, p.location.x, p.location.y, p.radius);
            gradient.addColorStop(0, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")");
            gradient.addColorStop(0.5, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")");
            gradient.addColorStop(1, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", 0)");
            ctx.fillStyle = gradient;
            ctx.arc(p.location.x, p.location.y, p.radius, Math.PI * 2, false);
            ctx.fill();

            //lets move the particles
            p.remaining_life--;
            p.radius--;
            p.location.x += p.speed.x;
            p.location.y += p.speed.y;

            //regenerate particles
            if (p.remaining_life < 0 || p.radius < 0) {
                //a brand new particle replacing the dead one
                particles[i] = new particle();
            }
        }
    }

    //draw();
    setInterval(draw, 50);
    setInterval(clearCanvas, 2000);

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }


})();
