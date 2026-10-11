'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Stats, useGLTF } from '@react-three/drei'
import React, { useRef } from 'react'
import { degToRad } from 'three/src/math/MathUtils'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Fluid } from '@whatisjery/react-fluid-distortion'



const Model = ()=>{
    const model = useGLTF('/model/low_poly_fantasy_rune_stone.glb')

    const modelRef = useRef()

    useFrame(()=>{
        if (modelRef.current){
            modelRef.current.rotation.y += 0.01
        }
    })


    return (
        <primitive ref={modelRef} object={model.scene} scale={.008} rotation-y={degToRad(180)}/>
    )
}

const Stone = () => {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <Environment preset='studio' environmentIntensity={1}/>

        <Model />

        {/* <Stats /> */}

        <EffectComposer>
            <Fluid fluidColor='#1b1b1b' curl={30} />
        </EffectComposer>
    </Canvas>
  )
}

export default Stone