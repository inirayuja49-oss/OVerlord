import * as THREE from '../three.js-master/build/three.module.js'
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js'
import { TextGeometry } from '../three.js-master/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from '../three.js-master/examples/jsm/loaders/FontLoader.js'
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js' // membuka format .gltf dan .glb (model 3D Dark Warrior)

let scene, thirdPersonCam, firstPersonCam, renderer, orbitControls, ambientLight
let currentCam, spotLight, directionalLight
let darkWarrior, spellCircleGroup , pointLight 
let raycaster, mouse // interaksi mouse

// Status tombol keyboard
let keys = { w: false, a: false, s: false, d: false, q: false, e: false }

let init = () => {
    scene = new THREE.Scene() // buat dunia kosong

    let w = window.innerWidth // ukuran layar
    let h = window.innerHeight
    let aspect = w/h

    // 1. CAMERA 3rd PERSON
    // lebar lensa - ukuran layar - terdekat - terjauh
    thirdPersonCam = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000) // meniru human eyes
    thirdPersonCam.position.set(6, 3, 5) // cam melayang agak ke atas dan samping kanan
    thirdPersonCam.lookAt(0,0,0) // cam melihat ke titik tengah pusat dunia
    // CAMERA 1st PERSON
    firstPersonCam = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    firstPersonCam.position.set(0, 1.8, 0)

    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    renderer = new THREE.WebGLRenderer( {antialias: true} ) // mesin pembuat gambar, pinggiran obj tak gerigi
    renderer.setSize(w, h)
    renderer.shadowMap.enabled = true // aktifkan fitur bayangan
    renderer.shadowMap.type = THREE.PCFShadowMap
    // renderer.outputColorSpace = THREE.SRGBColorSpace
    document.body.appendChild(renderer.domElement) // tempel hasil render (canvas) ke HTML (body)

    orbitControls = new OrbitControls(thirdPersonCam, renderer.domElement) // klik-kiri mouse tahan,
    orbitControls.target.set( 0, 0, 0 ); // untuk putar dan scroll + zoom in/out keliling titik tengah
    
    //--------------------------------------------------------------------- lighting
    ambientLight = new THREE.AmbientLight('#FFFFFF', 0.7) // cahaya ruang/ sun terik
    scene.add(ambientLight) // menerangi rata, yang membelakangi tidak hitam total

    spotLight = new THREE.SpotLight('#FFFFFF', 1.2)//lampu sorot teather, lebih kuat dari ambient
    spotLight.position.set(0,30,0) // 10 jadi 30 biar lebi luas jangkauan
    spotLight.distance = 1000
    spotLight.castShadow = true
    spotLight.shadow.bias = -0.0001  // Supaya bayangan gak nempel di baju

    // Resolusi bayangan biar tidak kotak
    spotLight.shadow.mapSize.width = 2048 // resolusi bayangan tajam & halus , kalau kecil kotak2 pecah
    spotLight.shadow.mapSize.height = 2048
    
    // Agar spotlight ngarah ke tengah
    spotLight.target.position.set(0, 0, 3)
    scene.add(spotLight)
    scene.add(spotLight.target) // target harus add ke scene

    // spotLight.position.y = 10
    // let spotLightHelper = new THREE.SpotLightHelper(spotLight)
    // scene.add(spotLight, spotLightHelper)
    
    // Matahari, dari arah sangat jauh sehingga sejajar tidak melebar
    directionalLight = new THREE.DirectionalLight('#FFFFEE', 0.5) //-- muncul cmn redup
    directionalLight.position.set(5,2,8)
    directionalLight.castShadow = true
    directionalLight.shadow.bias = -0.0001 
    // Garis bantu (garis lakban supaya tau posisi lampu)
    let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
    scene.add(directionalLight, directionalLightHelper) // kotak + garis2 kuning

    // Point Light Sihir
    pointLight = new THREE.PointLight('#FFD700', 2, 3)
    pointLight.position.set(0, 0.5, 0)
    scene.add(pointLight)

    currentCam = thirdPersonCam // cam live (dari mata ke 3) mau ganti = firstPersonCam
}

let setupInput = () => {
    // Saat tombol ditekan
    window.addEventListener('keydown', (event) => {
        let key = event.key.toLowerCase()
        if(keys[key] !== undefined){
            keys[key] = true
        }
        if(event.code == 'Space'){
            if(spellCircleGroup){
                spellCircleGroup.visible = !spellCircleGroup.visible
                pointLight.visible = spellCircleGroup.visible
            }
        }

        // Logic Ganti Cam (Tombol C)
        if(key == 'c'){
            if(currentCam == thirdPersonCam){
                currentCam = firstPersonCam
                orbitControls.enabled = false // matikan orbit saat fps
            }
            else{
                currentCam = thirdPersonCam
                orbitControls.enabled = true
            }
        }
    })

    // saat tombol dilepas
    window.addEventListener('keyup', (event) =>{
        let key = event.key.toLowerCase()
        if(keys[key] !== undefined){
            keys[key] = false
        }
    })

    // logic klik mouse (Raycast Hamster)
    window.addEventListener('pointerdown', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, currentCam)
        let intersects = raycaster.intersectObjects(scene.children)

        if(intersects.length > 0){
            let hitObj = intersects[0].object
        // apakah yang kena si hamster
        if (hitObj.geometry.type === 'BoxGeometry' && hitObj.position.x === 3) {
                let sadTex = '../assets/textures/hamsuke/front_sad.png'
                let happyTex = '../assets/textures/hamsuke/front_happy.png'
                let loader = new THREE.TextureLoader()

                if (!hitObj.isSad) {
                    hitObj.material[4].map = loader.load(sadTex)
                    hitObj.isSad = true
                } else {
                    hitObj.material[4].map = loader.load(happyTex)
                    hitObj.isSad = false
                }
                hitObj.material[4].needsUpdate = true
            }
        }
    })
}

// Logic Gerakan (Update Movement) 
let updateMovement = () => {
    if (!darkWarrior) return // Jangan jalan kalau model belum muncul

    let moveSpeed = 0.1 
    let rotSpeed = 0.05 

    // ROTASI (Q/E) 
    if (keys.q) darkWarrior.rotation.y += rotSpeed
    if (keys.e) darkWarrior.rotation.y -= rotSpeed

    // GERAKAN (WASD) 
    // pakai Vector math supaya geraknya relatif terhadap arah hadap karakter
    let forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), darkWarrior.rotation.y)
    let right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), darkWarrior.rotation.y)

    // Perhatikan arah minus/plus disesuaikan dengan koordinat three.js
    if (keys.w) darkWarrior.position.add(forward.multiplyScalar(moveSpeed))  // Maju
    if (keys.s) darkWarrior.position.add(forward.multiplyScalar(-moveSpeed)) // Mundur
    if (keys.a) darkWarrior.position.add(right.multiplyScalar(moveSpeed))    // Kiri
    if (keys.d) darkWarrior.position.add(right.multiplyScalar(-moveSpeed))   // Kanan

    // UPDATE POSISI SPELL & LIGHT
    if (spellCircleGroup) {
        spellCircleGroup.position.copy(darkWarrior.position)
        spellCircleGroup.position.y = 0.02
        
        pointLight.position.set(
            darkWarrior.position.x, 
            darkWarrior.position.y + 0.5, 
            darkWarrior.position.z
        )
    }

    // UPDATE POSISI FIRST PERSON CAM
    if (currentCam === firstPersonCam) {
        firstPersonCam.position.set(
            darkWarrior.position.x,
            darkWarrior.position.y + 1.8,
            darkWarrior.position.z
        )
        firstPersonCam.rotation.copy(darkWarrior.rotation)
        // Putar 90 derajat karena model aslinya menghadap samping
        firstPersonCam.rotation.y += Math.PI / 2
    }
}

let render = () => {
    requestAnimationFrame(render)
    updateMovement() // logic gerak dicall tiap frame
    orbitControls.update();
    renderer.render(scene, currentCam)
}

window.onload = async () => {
    init()
    setupInput()
    skybox()
    ground()
    hamster()
    loadDarkWarrior()
    createSpellCircle()
    treeMiddle()
    treeRight()
    treeLeft()
    await text()
    render()
}

window.onresize = () =>{ //--it works maybe??
    let w = window.innerWidth
    let h = window.innerHeight
    renderer.setSize(w, h)

    thirdPersonCam.aspect = w/h
    thirdPersonCam.updateProjectionMatrix()

    firstPersonCam.aspect = w/h
    firstPersonCam.updateProjectionMatrix()
}

let ground = () =>{
    let geometry = new THREE.BoxGeometry(25, 2, 25)
    let loader = new THREE.TextureLoader()
    let texture = loader.load('../assets/textures/grass/rocky_terrain_02_diff_1k.jpg')

    let material = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        map: texture
    })

    let mesh = new THREE.Mesh(geometry, material)

    mesh.receiveShadow = true
    mesh.position.set(0, -1, 0)

    scene.add(mesh)
}

let hamster = () =>{
    let bodygeometry = new THREE.BoxGeometry(2,2,2)
    
    let loader = new THREE.TextureLoader()

    let bodyTextures = [
        new THREE.MeshPhongMaterial({
            color: '#FFFFFF',
            map: loader.load('../assets/textures/hamsuke/side.png')
        }),
        new THREE.MeshPhongMaterial({
            color: '#FFFFFF',
            map: loader.load('../assets/textures/hamsuke/side.png')
        }),
        new THREE.MeshPhongMaterial({
            color: '#FFFFFF',
            map: loader.load('../assets/textures/hamsuke/top&back.png')
        }),
        new THREE.MeshPhongMaterial({
            color: '#FFFFFF',
            map: loader.load('../assets/textures/hamsuke/top&back.png')
        }),
        new THREE.MeshPhongMaterial({
            color: '#FFFFFF',
            map: loader.load('../assets/textures/hamsuke/front_happy.png')
        }),
        new THREE.MeshPhongMaterial({
            color: '#FFFFFF',
            map: loader.load('../assets/textures/hamsuke/top&back.png')
        }),
    ]

    let bodyMesh = new THREE.Mesh(bodygeometry, bodyTextures)
    bodyMesh.position.set(3, 1, -1)
    bodyMesh.rotation.set(0, Math.PI / 8, 0)
    bodyMesh.receiveShadow = true
    bodyMesh.castShadow = true

    let tailMainGeometry = new THREE.BoxGeometry(0.6, 2.8, 0.6)
    let tailMainMaterial = new THREE.MeshPhongMaterial({
        color: '#023020'
    })
    let tailMainMesh = new THREE.Mesh(tailMainGeometry, tailMainMaterial)
    tailMainMesh.position.set(2.6, 1.4, -2.25)
    tailMainMesh.rotation.set(0, Math.PI / 8, 0)
    tailMainMesh.castShadow = true
    tailMainMesh.receiveShadow = true

    let tailExtensionGeometry = new THREE.BoxGeometry(0.6,0.6,1.4)
    let tailExtensionMaterial = new THREE.MeshPhongMaterial({
        color: '#023020'
    }) 
    let tailExtensionMesh = new THREE.Mesh(tailExtensionGeometry, tailExtensionMaterial)
    tailExtensionMesh.position.set(2.44, 2.8, -2.62)
    tailExtensionMesh.rotation.set(0, Math.PI / 8, Math.PI / 2)
    tailExtensionMesh.castShadow = true
    tailExtensionMesh.receiveShadow = true

    let leftEarGeometry = new THREE.ConeGeometry(0.2, 0.7, 128)
    let leftEarMaterial = new THREE.MeshPhongMaterial({
        color: '#6B6860'
    })
    let leftEar = new THREE.Mesh(leftEarGeometry, leftEarMaterial)
    leftEar.position.set(4.05, 2.2, -0.6)
    leftEar.rotation.set(0, 0, -Math.PI / 8)
    leftEar.castShadow = true
    leftEar.receiveShadow = true

    let rightEarGeometry = new THREE.ConeGeometry(0.2, 0.7, 128)
    let rightEarMaterial = new THREE.MeshPhongMaterial({
        color: '#6B6860'
    })
    let rightEar = new THREE.Mesh(rightEarGeometry, rightEarMaterial)
    rightEar.position.set(2.5, 2.2, 0)
    rightEar.rotation.set(0, 0, Math.PI / 8) //--soalny minta -Math.PI tapi posisiny jd gk sesuai dg di gambar
    rightEar.castShadow = true
    rightEar.receiveShadow = true

    scene.add(bodyMesh, tailMainMesh, tailExtensionMesh, leftEar, rightEar)
}

let treeMiddle = () =>{
    let loader = new THREE.TextureLoader

    let trunkTexture = loader.load('../assets/textures/tree/chinese_cedar_bark_diff_1k.jpg')
    let trunkGeometry = new THREE.CylinderGeometry(0.6, 0.6, 3)
    let trunkMaterial = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        map : trunkTexture
    })
    let trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.castShadow = true 
    trunk.receiveShadow = true
    trunk.position.set(-5, 1.5, -5)

    let bottomLeavesGeometry = new THREE.ConeGeometry(3, 4)
    let bottomLeavesMaterial = new THREE.MeshStandardMaterial({
        color: '#374F2F'
    })
    let bottomLeaves = new THREE.Mesh(bottomLeavesGeometry, bottomLeavesMaterial)
    bottomLeaves.position.set(-5, 4, -5)
    bottomLeaves.castShadow = true
    bottomLeaves.receiveShadow = true

    let topLeavesGeometry = new THREE.ConeGeometry(2.1, 2.8)
    let topLeavesMaterial = new THREE.MeshStandardMaterial({
        color: '#374F2F'
    })
    let topLeaves = new THREE.Mesh(topLeavesGeometry, topLeavesMaterial)
    topLeaves.position.set(-5, 6, -5)
    topLeaves.castShadow = true
    topLeaves.receiveShadow = true

    scene.add(trunk, bottomLeaves, topLeaves)
}

let treeRight = () =>{
    let loader = new THREE.TextureLoader

    let trunkTexture = loader.load('../assets/textures/tree/chinese_cedar_bark_diff_1k.jpg')
    let trunkGeometry = new THREE.CylinderGeometry(0.6, 0.6, 3)
    let trunkMaterial = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        map : trunkTexture
    })
    let trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.castShadow = true 
    trunk.receiveShadow = true
    trunk.position.set(7, 1.5, -6)

    let bottomLeavesGeometry = new THREE.ConeGeometry(3, 4)
    let bottomLeavesMaterial = new THREE.MeshStandardMaterial({
        color: '#374F2F'
    })
    let bottomLeaves = new THREE.Mesh(bottomLeavesGeometry, bottomLeavesMaterial)
    bottomLeaves.position.set(7, 4, -6)
    bottomLeaves.castShadow = true
    bottomLeaves.receiveShadow = true

    let topLeavesGeometry = new THREE.ConeGeometry(2.1, 2.8)
    let topLeavesMaterial = new THREE.MeshStandardMaterial({
        color: '#374F2F'
    })
    let topLeaves = new THREE.Mesh(topLeavesGeometry, topLeavesMaterial)
    topLeaves.position.set(7, 6, -6)
    topLeaves.castShadow = true
    topLeaves.receiveShadow = true

    scene.add(trunk, bottomLeaves, topLeaves)
}

let treeLeft = () =>{
    let loader = new THREE.TextureLoader

    let trunkTexture = loader.load('../assets/textures/tree/chinese_cedar_bark_diff_1k.jpg')
    let trunkGeometry = new THREE.CylinderGeometry(0.6, 0.6, 3)
    let trunkMaterial = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        map : trunkTexture
    })
    let trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.castShadow = true 
    trunk.receiveShadow = true
    trunk.position.set(-8, 1.5, 8)

    let bottomLeavesGeometry = new THREE.ConeGeometry(3, 4)
    let bottomLeavesMaterial = new THREE.MeshStandardMaterial({
        color: '#374F2F'
    })
    let bottomLeaves = new THREE.Mesh(bottomLeavesGeometry, bottomLeavesMaterial)
    bottomLeaves.position.set(-8, 4, 8)
    bottomLeaves.castShadow = true
    bottomLeaves.receiveShadow = true

    let topLeavesGeometry = new THREE.ConeGeometry(2.1, 2.8)
    let topLeavesMaterial = new THREE.MeshStandardMaterial({
        color: '#374F2F'
    })
    let topLeaves = new THREE.Mesh(topLeavesGeometry, topLeavesMaterial)
    topLeaves.position.set(-8, 6, 8)
    topLeaves.castShadow = true
    topLeaves.receiveShadow = true

    scene.add(trunk, bottomLeaves, topLeaves)
}

let text = async () =>{
    let loader = new FontLoader()

    let font = await loader.loadAsync('../three.js-master/examples/fonts/helvetiker_bold.typeface.json')
    let textGeometry = new TextGeometry('OVerlord', {
        size: 1,
        height: 0.2,
        depth: 1,
        font: font
    })
    let textMaterial = new THREE.MeshStandardMaterial({
        color: '#FFFFFF'
    })
    let textMesh = new THREE.Mesh(textGeometry, textMaterial)
    textMesh.position.set(-6, 4, 5)
    textMesh.rotation.set(0, Math.PI / 2, 0)
    textMesh.castShadow = true
    textMesh.receiveShadow = true

    scene.add(textMesh)
}

let skybox = () => {
    let loader = new THREE.CubeTextureLoader()
    let texture = loader.load([
        './assets/skybox/side-1.png', // PX (Kanan)
        './assets/skybox/side-3.png', // NX (Kiri) 
        './assets/skybox/top.png', // PY (Atas)
        './assets/skybox/bottom.png', // NY (Bawah)
        './assets/skybox/side-4.png', // PZ (Depan)
        './assets/skybox/side-2.png' // NZ (Belakang)
    ])
    // matikan fitur Mipmaps supaya gambar tak persegi tetep bisa jalan
    texture.generateMipmaps = false
    texture.minFilter = THREE.LinearFilter

    scene.background = texture   // Ini untuk background visual
    scene.environment = texture  // Biar Logam tidak hitam
}

let loadDarkWarrior = () => {
    let loader = new GLTFLoader()

    // Ganti path sesuai letak file GLTF kamu
    loader.load('../assets/models/momonga_ainz_ooal_gown/scene.gltf', (gltf) => {
        darkWarrior = gltf.scene

        darkWarrior.scale.set(0.01, 0.01, 0.01)
        darkWarrior.position.set(0, -0.01, 3)
        darkWarrior.rotation.set(0, Math.PI/2, 0)

        darkWarrior.traverse((child) => {
            if(child.isMesh){
                child.castShadow = true
                child.receiveShadow = true
                
            }
        })
        scene.add(darkWarrior)
    })
}

let createSpellCircle = () => {
    spellCircleGroup = new THREE.Group()
    // Bahan (Material)
    let material = new THREE.MeshPhongMaterial({
        color: 0xDAA520, // GoldenRod
        emissive: 0xFFCC00, // bersinar kuning
        emissiveIntensity: 2, // kekuatan sinar
        shininess: 100,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    })

    // 1. Inner Ring
    let innerGeo = new THREE.RingGeometry(1, 1.2, 64)
    let innerRing = new THREE.Mesh(innerGeo, material)
    innerRing.rotation.x = -Math.PI/2 // tidurkan di tanah
    innerRing.position.set(0, 0.02, 0)
    // 2. Outer Ring
    let outerGeo = new THREE.RingGeometry(1.8, 2, 64)
    let outerRing = new THREE.Mesh(outerGeo, material)
    outerRing.rotation.x = -Math.PI/2
    outerRing.position.set(0, 0.02, 0) // Y = 0.02
    
    // 3. Pointers
    let pointerGeo = new THREE.BoxGeometry(0.05, 4, 0.01)
    // POINTER 1: ikut soal
    let pointer1 = new THREE.Mesh(pointerGeo, material)
    pointer1.rotation.set(Math.PI/2, 0, Math.PI/2)
    pointer1.position.set(0, 0.01, 0) // Y = 0.01

    // POINTER 2: Putar biar jadi tanda (+) 
    let pointer2 = new THREE.Mesh(pointerGeo, material)
    pointer2.rotation.set(Math.PI/2, 0, 0) // Rotasi beda biar menyilang
    pointer2.position.set(0, 0.01, 0)

    spellCircleGroup.add(innerRing)
    spellCircleGroup.add(outerRing)
    spellCircleGroup.add(pointer1)
    spellCircleGroup.add(pointer2)

    spellCircleGroup.position.set(0, 0, 3) // nempel di dark warrior

    scene.add(spellCircleGroup)
}
