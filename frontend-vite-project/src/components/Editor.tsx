import MonacoEditor from "@monaco-editor/react";

interface EditorProps {
  roomId: string;
  language: string;
  value: string; // Editor content controlled by parent
  onChange: (newCode: string) => void; // Callback for editor changes
}
const Editor: React.FC<EditorProps> = ({ language, value, onChange }) => {
  return (
    <div>
      <MonacoEditor
        height="500px"
        width="100%"
        language={language}
        value={value}
        onChange={(newCode) => {
          if (newCode !== undefined) {
            onChange(newCode); // Notify parent about changes
          }
        }}
        theme="vs-dark"
      />
    </div>
  );
};

export default Editor;
