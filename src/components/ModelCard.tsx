import React, { useEffect, useRef, useState, useMemo } from "react";
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Environment } from "@react-three/drei";
import { Suspense } from "react";
import { Group } from "three";
import { deleteModel } from "../api/modelApi";
import { useNavigate } from "react-router-dom";
import { getType } from "../utils/formatting";

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

const available3DModels = ['deposit', 'mixer', 'mill', 'decanter', 'centrifuge', 'bin'];

function getModelPath(thingId: string): string {
  const name = getType(thingId);
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
    useGLTF.preload("/deposits/deposit.gltf");

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
            backgroundColor: '#ffffff',
            color: 'black',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            width: '300px',
            margin: '16px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
            e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
        }}
        >
            
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
                  padding: '32px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
              }}>
                <h2 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#262626'
                }}>Confirm Delete</h2>
                <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#595959',
                    lineHeight: '1.6'
                }}>Are you sure you want to delete this model? This action cannot be undone.</p> 
                <div style={{ 
                    display: 'flex', 
                    gap: '12px',
                    justifyContent: 'flex-end',
                    marginTop: '8px'
                }}>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#fff',
                      color: '#262626',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#262626';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d9d9d9';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#ff4d4f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d9363e';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ff4d4f';
                    }}
                  >
                    Delete
                  </button>
                </div>
                </div>
              </div>
            )}

            <div style={{ 
                width: '100%', 
                height: '200px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: '#fafafa',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
            
            <Suspense fallback={<div style={{ fontSize: '14px', color: '#8c8c8c' }}>Loading model...</div>}>
                <Canvas camera={{ position: [0, 0, 3] } } style={{ width: '100%', height: '200px' }} >

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
                </Canvas>
            </Suspense>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#262626',
                    marginBottom: '8px'
                }}>{capitalize(modelData.thingId.split(':')[1])}</h3>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '6px',
                    marginTop: '12px'
                }}>
                    <span style={{
                        fontSize: '12px',
                        color: '#8c8c8c',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>Features</span>
                    <span style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#262626'
                    }}>{Object.keys(modelData.features).length}</span>
                </div>
            </div>
            
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                marginTop: 'auto'
            }}>
              <button
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#262626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate(`/model-info/${modelData.thingId}`)}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#434343';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#262626';
                }}
              >
                View Details
              </button>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#fff',
                    color: '#262626',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    flex: 1,
                    transition: 'all 0.3s ease',
                  }}
                  onClick={handleEdit}
                  onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#262626';
                      e.currentTarget.style.backgroundColor = '#fafafa';
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d9d9d9';
                      e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  Edit
                </button>
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#fff',
                    color: '#ff4d4f',
                    border: '1px solid #ffccc7',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    flex: 1,
                    transition: 'all 0.3s ease',
                  }}
                  onClick={
                    () => {
                      setItemToDelete(modelData.thingId);
                      setIsModalOpen(true);
                    }
                  }
                  onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#ff4d4f';
                      e.currentTarget.style.backgroundColor = '#fff1f0';
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#ffccc7';
                      e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
        </div>
    );

}