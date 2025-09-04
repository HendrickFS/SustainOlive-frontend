import React, { useEffect, useState } from "react";
import { ModelCard } from "./ModelCard"; 
import { NewModelCard } from "./NewModelCard";
import { useNavigate } from "react-router-dom";
import { getModels } from "../api/modelApi";
import type { Model } from "../api/modelApi";
import { getType } from "../utils/formatting";

interface Feature {
    properties: {
        value: number | number[] | string | string[];
    };
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function ModelsGrid() {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const refreshModels = () => {
        getModels()
            .then((data) => {
                setModels(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching models:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        getModels()
            .then((data) => {
                setModels(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching models:", error);
                setLoading(false);
            });
    }, []);

    let modelTypes: string[] = [];
    for (const model of models) {
        const type = getType(model.thingId);
        if (!modelTypes.includes(type)) {
            modelTypes.push(type);
        }
    }

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            overflow: 'auto',
            backgroundColor: '#dfdfdfff',
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
        }}>
        {models.map((model, index) => (
            <ModelCard key={model.thingId || index} modelData={model} onDelete={refreshModels} />
        ))}

        <NewModelCard modelTypes={modelTypes} />

        </div>
    );
}