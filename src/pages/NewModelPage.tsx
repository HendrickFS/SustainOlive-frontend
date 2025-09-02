import React from 'react';
import { Menu } from "../components/Menu";
import { NewModelForm } from "../components/NewModelForm";
import { useLocation } from 'react-router-dom';

type NewModelPageProps = {
  type?: string;
};

export function NewModelPage() {
  const location = useLocation();
  const { type } = location.state || {};

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
            <NewModelForm type={type} />
        </div>
    </div>
  );
}
