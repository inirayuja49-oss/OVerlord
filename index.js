import * as THREE from '../three.js-master/build/three.module.js'
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js'
import { TextGeometry } from '../three.js-master/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from '../three.js-master/examples/jsm/loaders/FontLoader.js'

let scene, thirdPersonCam, firstPersonCam, renderer, orbitControls, ambientLight
let currentCam, spotLight, directionalLight

let init = () => {
    scene = new THREE.Scene()

    let w = window.innerWidth
    let h = window.innerHeight
    let aspect = w/h

    thirdPersonCam = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    thirdPersonCam.position.set(6, 3, 5)
    thirdPersonCam.lookAt(0,0,0)

    renderer = new THREE.WebGLRenderer( {antialias: true} )
    renderer.setSize(w, h)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    document.body.appendChild(renderer.domElement)

    orbitControls = new OrbitControls(thirdPersonCam, renderer.domElement)
    orbitControls.target.set( 0, 0, 0 );
    
    //--------------------------------------------------------------------- light
    ambientLight = new THREE.AmbientLight('#FFFFFF', 0.7)
    scene.add(ambientLight)

    // spotLight = new THREE.SpotLight('#FFFFFF', 1.2)//-- kok gk ad cahayany??
    // spotLight.castShadow = true
    // spotLight.distance = 1000
    // //spotLight.position.set(0,10,0)
    // spotLight.position.y = 10
    // spotLight.shadow.mapSize.width = 2048
    // spotLight.shadow.mapSize.height = 2048

    // let spotLightHelper = new THREE.SpotLightHelper(spotLight)
    // scene.add(spotLight, spotLightHelper)

    directionalLight = new THREE.DirectionalLight('#FFFFEE', 0.5) //-- muncul cmn redup
    directionalLight.position.set(5,2,8)
    directionalLight.castShadow = true

    let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
    scene.add(directionalLight, directionalLightHelper)

    currentCam = thirdPersonCam
}

let render = () => {
    requestAnimationFrame(render)
    orbitControls.update();
    renderer.render(scene, currentCam)
}

window.onload = async () => {
    init()
    ground()
    hamster()
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
    currentCam.aspect = w/h

    currentCam.updateProjectionMatrix()
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
    let textGeometry = new TextGeometry('Overlord', {
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