import React, { useEffect, useRef, useState, useMemo } from "react";
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Environment } from "@react-three/drei";
import { Suspense } from "react";
import { Group } from "three";

function ModelViewer({ url }: { url: string }) {
  const groupRef = useRef<Group>(null);

  try {
    const { scene } = useGLTF(url);
    const clonedScene = useMemo(() => clone(scene), [scene]);

    useFrame(() => {
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.01;
      }
    });

    return (
      <group ref={groupRef}>
        <primitive object={clonedScene} scale={0.75} position={[0, 0, 0]} />
      </group>
    );
  } catch (err) {
    console.error("Erro ao carregar modelo 3D:", err);
    return (
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface Feature {
    properties: {
        value: number | number[] | string | string[];
    };
}

interface Model {
    thingId: string;
    policyId: string;
    features: Record<string, Feature>;
}

interface ModelCardProps {
  modelData: Model;
}

const available3DModels = ['deposits'];

function getModelPath(thingId: string): string {
  const name = thingId.split(':')[0].split('.')[1];
  if (available3DModels.includes(name)) {
    return `/${name}/${name}.gltf`;
  }
  return "/questionMarkModel/scene.gltf"; // Default model path
}

export function ModelCard({ modelData }: ModelCardProps) {
    const [model, setModel] = useState(modelData);

    useGLTF.preload("/questionMarkModel/scene.gltf");
    useGLTF.preload("/deposits/deposits.gltf");
    

    return (
        <div style={{
            backgroundColor: '#f0f0f0ff',
            color: 'black',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            width: '300px',
            height: '450px',
            margin: '16px',
        }}>

            <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            
            <Suspense fallback={<div>Carregando modelo...</div>}>
                <Canvas camera={{ position: [0, 0, 3] } } style={{ width: '200px', height: '200px' }} >
                {/* <pointLight position={[5, 5, 5]} intensity={1} />
                <pointLight position={[-5, 5, 5]} intensity={1} />
                <pointLight position={[5, 5, -5]} intensity={1} />
                <pointLight position={[-5, 5, -5]} intensity={1} />
                <pointLight position={[0, 0, -5]} intensity={1} /> */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={3} />
                <directionalLight position={[-5, 5, -5]} intensity={3} />
                <directionalLight position={[5, 5, -5]} intensity={3} />
                <directionalLight position={[-5, 5, 5]} intensity={3} />
                <directionalLight position={[0, 5, 0]} intensity={3} />
                <directionalLight position={[0, -5, 0]} intensity={3} />
                <OrbitControls />
                {modelData?.thingId && (
                <ModelViewer url={getModelPath(modelData.thingId)}/>
                )}
                {/* <Environment files={"studio_small_09_4k.hdr"} background={false} /> */}
                </Canvas>
            </Suspense>
            </div>
            
            <div style={{height:'20px'}}></div>
            <div>
                <h3 style={{fontFamily: 'Inter, sans-serif'}}>{capitalize(modelData.thingId.split(':')[1])}</h3>
                {/* <p style={{ fontSize: '12px', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>
                    Policy: {modelData.policyId}
                </p> */}
                <div style={{ height: '20px' }} />
                <h3 style={{fontFamily: 'Inter, sans-serif'}}>Features:</h3>
                <div style={{ height: '10px' }} />

                <ul style={{ padding: 0, marginLeft: '20px' }}>
                    {Object.entries(modelData.features).map(([featureName, feature]) => (
                        <li key={featureName} style={{ marginBottom: '8px' }}>
                            <strong style={{fontFamily: 'Inter, sans-serif'}}>{capitalize(featureName)}</strong>
                        </li>
                    ))}
                </ul>  
            </div>
        </div>
    );

}