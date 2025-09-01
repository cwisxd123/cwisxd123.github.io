import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('h1').forEach(h1 => {
    h1.innerHTML = h1.textContent.split('').map((char, i) => 
      char === ' ' ? ' ' : `<span style="--i:${i}">${char}</span>`
    ).join('');
  });
});

document.querySelectorAll('.grid-item img, .grid-item video').forEach(media => {
  media.addEventListener('mouseenter', function () {
    let popup;

    if (media.tagName.toLowerCase() === 'img') {
      popup = document.createElement('img');
      popup.src = media.src;
      popup.alt = media.alt;
    } else if (media.tagName.toLowerCase() === 'video') {
      popup = document.createElement('video');
      popup.src = media.currentSrc || media.querySelector('source')?.src;
      popup.autoplay = true;
      popup.loop = true;
      popup.muted = true;
      popup.playsInline = true;
    }

    popup.className = 'popup-img';
    document.body.appendChild(popup);

    setTimeout(() => popup.classList.add('active'), 10);

    media.style.opacity = '0';

    media.addEventListener('mouseleave', function removePopup() {
      popup.classList.remove('active');
      media.style.opacity = '1';
      setTimeout(() => popup.remove(), 300);
      media.removeEventListener('mouseleave', removePopup);
    });
  });
});


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.asset-viewer').forEach(viewer => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    const camera = new THREE.PerspectiveCamera(75, viewer.clientWidth / viewer.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    viewer.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.set(0, 2, 2);
    controls.update();

    let autoRotate = true;
    controls.addEventListener('start', () => autoRotate = false);
    controls.addEventListener('end', () => autoRotate = true);

    console.log('Loading model from:', viewer.dataset.model);
    const loader = new GLTFLoader();
    loader.load(
      viewer.dataset.model,
      function (gltf) {
        console.log('Model loaded successfully:', gltf);
        const object = gltf.scene;
        
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        object.scale.multiplyScalar(scale);
        object.position.sub(center.multiplyScalar(scale));

        scene.add(object);
        console.log('Model added to scene');

        function animate() {
          requestAnimationFrame(animate);
          if (autoRotate) {
            object.rotation.y += 0.01;
          }
          controls.update();
          renderer.render(scene, camera);
        }
        animate();
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  });
});