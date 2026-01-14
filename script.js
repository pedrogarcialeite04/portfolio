// --- 1. NAVEGAÇÃO ---
function goHome() { switchTab('dashboard'); }
function openSection(id) { switchTab(id); }

function switchTab(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    setTimeout(initLiquidText, 100); 
}

// --- 2. MODAL CONTATO ---
const modal = document.getElementById('contact-modal');
function openModal() { modal.classList.add('open'); }
function closeModal() { modal.classList.remove('open'); }
function redirect() { 
    window.open('https://wa.me/5517996239598', '_blank'); 
    closeModal();
}

// --- 3. LÓGICA DE VÍDEO INTERATIVO (20 SEGUNDOS) ---
const videoStatus = {};

function checkVideoTime(video, overlayId) {
    if (video.currentTime >= 20 && !videoStatus[video.id]) {
        video.pause(); 
        videoStatus[video.id] = true; 
        document.getElementById(overlayId).classList.add('active'); 
    }
}

function continueVideo(videoId, overlayId) {
    const video = document.getElementById(videoId);
    document.getElementById(overlayId).classList.remove('active'); 
    video.play(); 
}

function stopVideo(videoId, overlayId) {
    const video = document.getElementById(videoId);
    document.getElementById(overlayId).classList.remove('active'); 
}

// --- 4. CARDS 3D (TILT) ---
const cards = document.querySelectorAll('.tilt-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xRot = -1 * ((y - rect.height / 2) / 10);
        const yRot = (x - rect.width / 2) / 10;
        card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
});

// --- 5. TEXTO LÍQUIDO ---
function initLiquidText() {
    const texts = document.querySelectorAll('.liquid-text');
    texts.forEach(text => {
        if(text.dataset.processed) return;
        const content = text.innerText;
        text.innerHTML = content.split('').map(char => char === ' ' ? '&nbsp;' : `<span class="liquid-char">${char}</span>`).join('');
        text.dataset.processed = "true";
        const chars = text.querySelectorAll('.liquid-char');
        text.addEventListener('mousemove', (e) => {
            chars.forEach(char => {
                const rect = char.getBoundingClientRect();
                const distX = e.clientX - (rect.left + rect.width / 2);
                const distY = e.clientY - (rect.top + rect.height / 2);
                const dist = Math.sqrt(distX*distX + distY*distY);
                if (dist < 80) {
                    const force = (80 - dist) / 80;
                    gsap.to(char, { x: -(distX * force * 0.8), y: -(distY * force * 0.8), color: '#00f3ff', duration: 0.2 });
                } else {
                    gsap.to(char, { x: 0, y: 0, color: 'inherit', duration: 0.5 });
                }
            });
        });
        text.addEventListener('mouseleave', () => {
            chars.forEach(char => gsap.to(char, { x: 0, y: 0, color: 'inherit', duration: 0.6, ease: "elastic.out(1, 0.3)" }));
        });
    });
}
initLiquidText();

// --- 6. COBRA ROBÓTICA "CYBER-SPINE" ---
const container = document.getElementById('snake-canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 8; 

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const headLight = new THREE.PointLight(0x00f3ff, 2, 10);
scene.add(headLight);

const segments = [];
const numSegments = 16; 

for (let i = 0; i < numSegments; i++) {
    const group = new THREE.Group();
    const size = 0.5 - (i * 0.02);

    const geometry = new THREE.TetrahedronGeometry(size, 0);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x111111, emissive: 0x00f3ff, emissiveIntensity: 0.2,
        roughness: 0.4, metalness: 0.8, flatShading: true
    });
    const body = new THREE.Mesh(geometry, material);
    
    const wireGeo = new THREE.TetrahedronGeometry(size * 1.2, 0);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.3 });
    const wire = new THREE.Mesh(wireGeo, wireMat);

    group.add(body);
    group.add(wire);
    group.userData = { body: body, wire: wire };
    group.position.x = i * 0.5;
    scene.add(group);
    segments.push(group);
}

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    mouseX = x * 3.5; 
    mouseY = y * 2; 
});

function animateSnake() {
    requestAnimationFrame(animateSnake);
    segments[0].position.x += (mouseX - segments[0].position.x) * 0.08;
    segments[0].position.y += (mouseY - segments[0].position.y) * 0.08;
    headLight.position.copy(segments[0].position);
    headLight.position.z += 2;
    segments[0].lookAt(mouseX * 2, mouseY * 2, 10); 
    segments[0].rotation.z += 0.02;

    for (let i = 1; i < segments.length; i++) {
        const leader = segments[i - 1];
        const follower = segments[i];
        follower.position.x += (leader.position.x - follower.position.x) * 0.25;
        follower.position.y += (leader.position.y - follower.position.y) * 0.25;
        follower.userData.wire.rotation.z += 0.05;
        follower.userData.body.rotation.x -= 0.02;
        follower.quaternion.slerp(leader.quaternion, 0.2);
    }
    renderer.render(scene, camera);
}
animateSnake();

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});