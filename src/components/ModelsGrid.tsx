import React, { useEffect, useState } from "react";
import { ModelCard } from "./ModelCard"; 

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
    }
]

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function ModelsGrid() {
    const [models, setModels] = useState<Model[]>([]);

    useEffect(() => {
        setModels(exampleModels);
    }, []);

    return (
        <div style={{
            width: '85%',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#eeeeeeff',
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
        }}>
        {models.map((model, index) => (
            <ModelCard key={model.thingId || index} modelData={model}/>
        ))}
        </div>
    );
}