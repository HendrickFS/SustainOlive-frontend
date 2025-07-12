import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import { Group } from "three";

function ModelViewer({ url }: { url: string }) {
  const groupRef = useRef<Group>(null);

  try {
    const { scene } = useGLTF(url);
    const clone = scene.clone(true);

    useFrame(() => {
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.01;
      }
    });

    return (
      <group ref={groupRef}>
        <primitive object={clone} scale={1} position={[-0.75, 0, 0]} />
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

export function ModelCard({ modelData }: ModelCardProps) {
    const [model, setModel] = useState(modelData);

    useGLTF.preload("/questionMarkModel/scene.gltf");
    

    return (
        <div style={{
            backgroundColor: '#3a350bff',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            width: '300px',
            height: '400px',
            margin: '16px',
        }}>

            <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Suspense fallback={<div>Carregando modelo...</div>}>
                <Canvas camera={{ position: [0, 0, 3] } } style={{ width: '300px', height: '300px' }}>
                <ambientLight />
                <OrbitControls />
                <ModelViewer url="/questionMarkModel/scene.gltf" />
                </Canvas>
            </Suspense>
            </div>
            
            <div>
                <h3>{capitalize(modelData.thingId.split(':')[1])}</h3>
                <p style={{ fontSize: '12px', color: '#ccc' }}>
                    Policy: {modelData.policyId}
                </p>
                <div style={{ height: '20px' }} />
                <h3>Features:</h3>
                <div style={{ height: '10px' }} />

                <ul style={{ padding: 0, marginLeft: '20px' }}>
                    {Object.entries(modelData.features).map(([featureName, feature]) => (
                        <li key={featureName} style={{ marginBottom: '8px' }}>
                            <strong>{capitalize(featureName)}</strong>
                        </li>
                    ))}
                </ul>  
            </div>
        </div>
    );

}