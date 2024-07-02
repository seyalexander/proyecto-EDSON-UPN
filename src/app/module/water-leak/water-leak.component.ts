import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';


@Component({
  selector: 'app-water-leak',
  standalone: true,
  imports: [ ],
  templateUrl: './water-leak.component.html',
  styleUrl: './water-leak.component.css'
})
export class WaterLeakComponent {
  private container!: HTMLDivElement;
private scene!: THREE.Scene;
private camera!: THREE.OrthographicCamera;
private renderer!: THREE.WebGLRenderer;
private pipes: THREE.Mesh[] = [];
private elbows: THREE.Mesh[] = [];
private unions: THREE.Mesh[] = [];
private waterTank!: THREE.Mesh;
private leak!: THREE.Mesh;
private waterDrops: THREE.Mesh[] = [];
private animationId!: number;
private waterTexture!: THREE.Texture;
private sinkTexture!: THREE.Texture;
private tankTexture!: THREE.Texture;

ngOnInit(): void {
    this.container = document.getElementById('container') as HTMLDivElement;
    this.initScene();
    this.animate();
}

ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResize.bind(this));
}

private initScene(): void {
    this.container = document.getElementById('container') as HTMLDivElement;

    // Escena
    this.scene = new THREE.Scene();

    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('assets/textures/fondo_2.jpg');
    this.scene.background = backgroundTexture;

    // Cámara ortográfica para 2D
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(-aspect * 10, aspect * 10, 10, -10, 0.1, 1000);
    this.camera.position.z = 10;

    // Renderizador
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0xfffffff);
    this.scene.add(ambientLight);

    // Cargar texturas
    const pipeTexture = textureLoader.load('assets/textures/pipe_texture.jpg');
    this.waterTexture = textureLoader.load('assets/textures/water_texture.jpg');
    this.sinkTexture = textureLoader.load('assets/textures/sink_texture.jpg'); // Textura del lavamanos
    this.tankTexture = textureLoader.load('assets/textures/tank_texture.png'); // Textura del tanque de agua

    // Crear sistema de tuberías
    this.createPipeSystem(pipeTexture);

    // Crear lavamanos
    this.createSink(new THREE.Vector3(-15, 5, 0), this.sinkTexture);

    // Fuga de agua
    const leakGeometry = new THREE.CircleGeometry(0.1, 32);
    const leakMaterial = new THREE.MeshPhysicalMaterial({
      map: this.waterTexture,
      color: 0x000dff,
      roughness: 0.3,
      metalness: 0.3,
      clearcoat: 2.0,
      clearcoatRoughness: 0.1
    });
    this.leak = new THREE.Mesh(leakGeometry, leakMaterial);
    this.leak.position.set(0, -0.5, 0);
    this.leak.castShadow = true;
    this.leak.receiveShadow = true;
    this.scene.add(this.leak);

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
}

private createPipeSystem(texture: THREE.Texture): void {
    // Crear tuberías
    this.createPipe(new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 0), texture);
    this.createElbow(new THREE.Vector3(5, 0, 0), texture, Math.PI / 2, new THREE.Vector3(0, 0, 1));
    this.createPipe(new THREE.Vector3(5, 0, 0), new THREE.Vector3(5, 5, 0), texture);
    this.createElbow(new THREE.Vector3(5, 5, 0), texture, Math.PI / 2, new THREE.Vector3(1, 0, 0));
    this.createPipe(new THREE.Vector3(5, 5, 0), new THREE.Vector3(10, 5, 0), texture);
    this.createElbow(new THREE.Vector3(10, 5, 0), texture, Math.PI / 2, new THREE.Vector3(0, 0, 1));
    this.createPipe(new THREE.Vector3(10, 5, 0), new THREE.Vector3(10, 5, 5), texture);

    // Nuevas tuberías a la izquierda
    this.createPipe(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-5, 0, 0), texture);
    this.createElbow(new THREE.Vector3(-5, 0, 0), texture, Math.PI / 2, new THREE.Vector3(0, 0, 1));
    this.createPipe(new THREE.Vector3(-5, 0, 0), new THREE.Vector3(-5, 5, 0), texture);
    this.createElbow(new THREE.Vector3(-5, 5, 0), texture, Math.PI / 2, new THREE.Vector3(1, 0, 0));
    this.createPipe(new THREE.Vector3(-5, 5, 0), new THREE.Vector3(-10, 5, 0), texture);
    this.createElbow(new THREE.Vector3(-10, 5, 0), texture, Math.PI / 2, new THREE.Vector3(0, 0, 1));
    this.createPipe(new THREE.Vector3(-10, 5, 0), new THREE.Vector3(-10, 5, 5), texture);

    // Uniones existentes
    this.createUnion(new THREE.Vector3(0, 0, 0), texture);
    this.createUnion(new THREE.Vector3(5, 0, 0), texture);
    this.createUnion(new THREE.Vector3(5, 5, 0), texture);
    this.createUnion(new THREE.Vector3(10, 5, 0), texture);

    // Nuevas uniones
    this.createUnion(new THREE.Vector3(-5, 0, 0), texture);
    this.createUnion(new THREE.Vector3(-5, 5, 0), texture);
    this.createUnion(new THREE.Vector3(-10, 5, 0), texture);

    // Tanque de agua con nueva textura
    this.createWaterTank(new THREE.Vector3(10, 5, 5), this.tankTexture);
}

private createPipe(start: THREE.Vector3, end: THREE.Vector3, texture: THREE.Texture): void {
    const pipeLength = start.distanceTo(end);
    const pipeGeometry = new THREE.PlaneGeometry(pipeLength, 1);
    const pipeMaterial = new THREE.MeshStandardMaterial({ map: texture });
    const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
    pipe.position.copy(start.clone().add(end).divideScalar(2));
    pipe.rotation.z = Math.atan2(end.y - start.y, end.x - start.x);
    pipe.castShadow = true;
    pipe.receiveShadow = true;
    this.scene.add(pipe);
    this.pipes.push(pipe);
}

private createElbow(position: THREE.Vector3, texture: THREE.Texture, angle: number, axis: THREE.Vector3): void {
    const elbowGeometry = new THREE.CircleGeometry(0.5, 32, 0, Math.PI / 2);
    const elbowMaterial = new THREE.MeshStandardMaterial({ map: texture });
    const elbow = new THREE.Mesh(elbowGeometry, elbowMaterial);
    elbow.position.copy(position);
    elbow.rotateOnAxis(axis, angle);
    elbow.castShadow = true;
    elbow.receiveShadow = true;
    this.scene.add(elbow);
    this.elbows.push(elbow);
}

private createUnion(position: THREE.Vector3, texture: THREE.Texture): void {
    const unionGeometry = new THREE.CircleGeometry(0.5, 32);
    const unionMaterial = new THREE.MeshStandardMaterial({ map: texture });
    const union = new THREE.Mesh(unionGeometry, unionMaterial);
    union.position.copy(position);
    union.castShadow = true;
    union.receiveShadow = true;
    this.scene.add(union);
    this.unions.push(union);
}


private createWaterTank(position: THREE.Vector3, texture: THREE.Texture): void {
    const tankGeometry = new THREE.CylinderGeometry(3, 3, 5, 32);
    const tankMaterial = new THREE.MeshStandardMaterial({ map: texture });
    this.waterTank = new THREE.Mesh(tankGeometry, tankMaterial);
    this.waterTank.position.copy(position);
    this.waterTank.castShadow = true;
    this.waterTank.receiveShadow = true;
    this.scene.add(this.waterTank);
}

private createSink(position: THREE.Vector3, texture: THREE.Texture): void {
    // Geometría del lavamanos
    const sinkGeometry = new THREE.BoxGeometry(3, 1, 2);
    const sinkMaterial = new THREE.MeshStandardMaterial({ map: texture });
    const sink = new THREE.Mesh(sinkGeometry, sinkMaterial);
    sink.position.copy(position);
    sink.castShadow = true;
    sink.receiveShadow = true;
    this.scene.add(sink);

    // Grifo
    const faucetGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1);
    const faucetMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const faucet = new THREE.Mesh(faucetGeometry, faucetMaterial);
    faucet.position.set(position.x, position.y + 0.5, position.z);
    faucet.rotation.z = Math.PI / 2;
    faucet.castShadow = true;
    faucet.receiveShadow = true;
    this.scene.add(faucet);
}
private animate(): void {
  this.animationId = requestAnimationFrame(this.animate.bind(this));

  // Simulación de un chorro continuo de agua
  if (Math.random() < 0.2) {
      const numDrops = 10; // Número de partículas en el chorro
      const dropGeometry = new THREE.CircleGeometry(0.05, 32); // Tamaño de cada partícula
      const dropMaterial = new THREE.MeshPhysicalMaterial({
          map: this.waterTexture,
          color: 0x6DC5EE,
          roughness: 0.2,
          metalness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1
      });

      // Posición inicial del chorro
      const startX = Math.random() * 1 - 0.5;
      const startY = 0.1; // Altura inicial del chorro

      for (let i = 0; i < numDrops; i++) {
          const drop = new THREE.Mesh(dropGeometry, dropMaterial);
          drop.position.set(startX, startY - i * 0.1, 0); // Distribución de las partículas a lo largo del chorro
          drop.castShadow = true;
          drop.receiveShadow = true;
          this.scene.add(drop);
          this.waterDrops.push(drop);
      }
  }

  // Mover las partículas del chorro
  this.waterDrops.forEach(drop => {
      drop.position.y -= 0.1; // Velocidad de descenso del chorro
      if (drop.position.y < -8) {
          drop.position.y = 0.005; // Reiniciar posición al llegar al final
      }
  });

  this.renderer.render(this.scene, this.camera);
}

private onWindowResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.left = -aspect * 10;
    this.camera.right = aspect * 10;
    this.camera.top = 10;
    this.camera.bottom = -10;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
}
}
