import React, { useEffect, useRef, useState, useMemo } from "react";

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
interface DataCardProps {
  modelData: Model;
}

export function DataCard({ modelData }: DataCardProps) {
    return (
        <div style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            width: '100%',
            height: '300px',
            margin: '16px',
        }}>
        <h3 style={{ fontFamily: 'Inter, sans-serif' }}>{capitalize(modelData.thingId.split(':')[1])}</h3>
        <p style={{ fontSize: '14px', color: '#555', fontFamily: 'Inter, sans-serif' }}>
            Policy ID: {modelData.policyId}
        </p>
        <div style={{ marginTop: '16px' }}>
            {Object.entries(modelData.features).map(([featureName, feature]) => (
            <div key={featureName} style={{ marginBottom: '8px' }}>
                <strong>{capitalize(featureName)}:</strong> {JSON.stringify(feature.properties.value)}
            </div>
            ))}
        </div>
        </div>
    );
}