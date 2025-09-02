import React from 'react';
import { Menu } from "../components/Menu";
import { EditModelForm } from '../components/EditModelForm';
import { useLocation } from 'react-router-dom';
import { useParams } from "react-router-dom";

export function EditModelPage(){
    const { thingId } = useParams<{ thingId: string }>();

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f0f0f0"
      }}>
            <Menu />    
            <div style={{
                width: '85%',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: '#dfdfdfff',
           }}>
                <EditModelForm />
            </div>
        </div>
      );
}