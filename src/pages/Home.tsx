import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "../components/Menu";
import { div } from "three/tsl";
import { DataCard } from "../components/DataCard";

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


const exampleModels: Model[] = [
    {
        "thingId": "olive.bins:bin001",
        "policyId": "olive.default:policy",
        "features": {
            "temperature": {
                "properties": {
                    "value": 0
                }
            }
        }
    },
    {
        "thingId": "olive.deposits:deposit001",
        "policyId": "olive.default:policy",
        "features": {
            "temperature": {
                "properties": {
                    "value": 0
                }
            },
            "humidity": {
                "properties": {
                    "value": 0
                }
            },
            "mq": {
                "properties": {
                    "value": [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            }
        }
    },
    {
        "thingId": "olive.deposits:deposit002",
        "policyId": "olive.default:policy",
        "features": {
            "temperature": {
                "properties": {
                    "value": 25
                }
            },
            "humidity": {
                "properties": {
                    "value": 50
                }
            },
            "mq": {
                "properties": {
                    "value": [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            }
        }
    },
    {
        "thingId": "olive.mills:mill001",
        "policyId": "olive.default:policy",
        "features": {
            "temperature": {
                "properties": {
                    "value": 0
                }
            },
            "waterQuantity": {
                "properties": {
                    "value": 0
                }
            }
        }
    },
    {
        "thingId": "olive.mixers:mixer001",
        "policyId": "olive.default:policy",
        "features": {
            "temperature": {
                "properties": {
                    "value": 0
                }
            },
            "humidity": {
                "properties": {
                    "value": 0
                }
            }
        }
    },
    {
        "thingId": "olive.decanters:decanter001",
        "policyId": "olive.default:policy",
        "features": {
            "temperature": {
                "properties": {
                    "value": 0
                }
            },
            "waterQuantity": {
                "properties": {
                    "value": 0
                }
            }
        }
    }
]

export function Home() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#f0f0f0"
        }}>
            <Menu />

            <div style={{
                width: '85%',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: '#dfdfdfff',
            }}>
                <div style={{
                    width: '100%',
                    height: '100vh',
                    overflow: 'auto',
                    backgroundColor: '#dfdfdfff',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '16px',
                    alignItems: 'center',
                }}>
                    {exampleModels.map((model, index) => (
                        <DataCard key={index} modelData={model} />
                    ))}
                </div>
            </div>
        </div>
    );
}