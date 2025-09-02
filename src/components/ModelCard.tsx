import React, { useEffect, useRef, useState, useMemo } from "react";
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Environment } from "@react-three/drei";
import { Suspense } from "react";
import { Group } from "three";
import { deleteModel } from "../api/modelApi";
import { useNavigate } from "react-router-dom";

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
  onDelete: () => void;
}

const available3DModels = ['deposits'];

function getModelPath(thingId: string): string {
  const name = thingId.split(':')[0].split('.')[1];
  if (available3DModels.includes(name)) {
    return `/${name}/${name}.gltf`;
  }
  return "/questionMarkModel/scene.gltf"; // Default model path
}

export function ModelCard({ modelData, onDelete }: ModelCardProps) {
    const [model, setModel] = useState(modelData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string>("");

    useGLTF.preload("/questionMarkModel/scene.gltf");
    useGLTF.preload("/deposits/deposits.gltf");

    const confirmDelete = async () => {
        try {
            await deleteModel(itemToDelete);
            onDelete(); 
        } catch (error) {
            console.error("Erro ao excluir modelo:", error);
        }
        setItemToDelete("");
        setIsModalOpen(false);
    };

    const navigate = useNavigate();
    const handleEdit = () => {
        navigate(`/edit-model/${model.thingId}`);
    };

    return (
        <div style={{
            backgroundColor: '#f0f0f0ff',
            color: 'black',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            width: '280px',
            height: '450px',
            margin: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        }}>
            
            {isModalOpen && (
                <div
              style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000,

              }}>
              <div
                style={{
                  backgroundColor: 'white',
                  width: '400px',
                  minHeight: '200px',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between'
              }}>
                <h2 style={{fontFamily: 'Arial, sans-serif'}}>Confirm Delete</h2>
                <p style={{fontFamily: 'Arial, sans-serif'}}>Are you sure you want to delete this model?</p> 
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ccc',
                      color: 'black',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Confirm
                  </button>
                </div>
                </div>
              </div>
            )}

            <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            
            <Suspense fallback={<div>Carregando modelo...</div>}>
                <Canvas camera={{ position: [0, 0, 3] } } style={{ width: '200px', height: '200px' }} >

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

                <div style={{ height: '20px' }} />
                <h3 style={{fontFamily: 'Inter, sans-serif'}}>Number of features:</h3>
                <div style={{ height: '10px' }} />
                <p
                  style={{fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#555'}}
                >
                    {Object.keys(modelData.features).length} Features
                </p>
                {/* <ul style={{ padding: 0, marginLeft: '20px' }}>
                    {Object.entries(modelData.features).map(([featureName, feature]) => (
                        <li key={featureName} style={{ marginBottom: '8px' }}>
                            <strong style={{fontFamily: 'Inter, sans-serif'}}>{capitalize(featureName)}</strong>
                        </li>
                    ))}
                </ul>   */}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: '16px' }}>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%',
                }}
                onClick={() => navigate(`/model-info/${modelData.thingId}`)}
              >
                View Model Info
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: '16px' }}>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '50%',
                }}
                onClick={handleEdit}
              >
                Edit
              </button>
              <div style={{ width: '10px' }} />
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '50%',
                }}
                onClick={
                  () => {
                    setItemToDelete(modelData.thingId);
                    setIsModalOpen(true);
                  }
                }
              >
                Delete
              </button>
            </div>
        </div>
    );

}