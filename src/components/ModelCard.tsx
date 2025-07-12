import React, { useEffect, useState } from "react";

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

export function ModelCard(modelData: Model) {
    const [model, setModel] = useState(modelData);

    useEffect(() => {
        setModel(modelData);
    }, [modelData]);

    return (
        <div style={{
            backgroundColor: '#3a350bff',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            width: '300px',
            margin: '16px',
        }}>
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
    );

}