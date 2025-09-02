

export function TextLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: '16px',
        color: '#333',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
      }}
    >
      {text}
    </div>
  );
}