import { TextLabel } from "./TextLabel";


export function CustomTextField({ enabled, label, value, onChange, placeholder, type }: { enabled?: boolean; label?: string; value: any; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{}}>
      {label && <TextLabel text={label} />}
      {label && <div style={{ height: '8px' }} />}
      <input
        disabled={enabled == false ? true : false}
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          fontSize: '16px',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
        placeholder={placeholder}
      />
    </div>
  );
}