const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');
const pads = document.querySelectorAll('.pad');

const colorMap = {
    'red': '231, 76, 60',
    'blue': '52, 152, 219',
    'green': '46, 204, 113',
    'yellow': '241, 196, 15',
    'purple': '155, 89, 186',
    'orange': '230, 126, 34',
    'pink': '255, 102, 178',
    'cyan': '26, 188, 156',
    'lime': '164, 222, 2',
    'gray': '149, 165, 166'
};

let ripples = []; 
let particles = [];
let tempBackgroundColor = null;


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


class Ripple {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = 0;
        this.maxRadius = 150;
        this.opacity = 1;
        this.speed = 4;
    }

    update() {
        this.radius += this.speed;
        this.opacity = 1 - (this.radius / this.maxRadius); 
        return this.radius > this.maxRadius || this.opacity < 0.01; 
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.strokeStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.lineWidth = 5;
        ctx.stroke();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 3 + 1;
        this.velocity = {
            x: (Math.random() - 0.5) * (Math.random() * 6),
            y: (Math.random() - 0.5) * (Math.random() * 6)
        };
        this.alpha = 1;
        this.friction = 0.99;
    }

    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.02;

        return this.alpha <= 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(${this.color}, 1)`;
        ctx.fill();
        ctx.restore();
    }
}


function animate() {
    if (tempBackgroundColor && tempBackgroundColor.alpha > 0) {
        ctx.fillStyle = `rgba(${tempBackgroundColor.color}, ${tempBackgroundColor.alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        tempBackgroundColor.alpha -= 0.05;
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
    }
    
    ripples = ripples.filter(ripple => {
        ripple.draw();
        return !ripple.update();
    });

    particles = particles.filter(particle => {
        particle.draw();
        return !particle.update();
    });

    requestAnimationFrame(animate);
}
animate();

pads.forEach(pad => {
    pad.addEventListener('click', (event) => {
        
        pad.classList.add('active');
        setTimeout(() => pad.classList.remove('active'), 200);

        const padClass = Array.from(pad.classList).find(c => colorMap[c]);
        const rgbColor = colorMap[padClass] || '255, 255, 255'; 

        const rect = pad.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        ripples.push(new Ripple(centerX, centerY, rgbColor));
        tempBackgroundColor = { color: rgbColor, alpha: 0.3 };

        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(centerX, centerY, rgbColor));
        }
    });
});