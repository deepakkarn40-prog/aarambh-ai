import React from "react";

type Props = {
  role: "user" | "assistant" | "system";
  text: string;
};

export default function MessageBubble({ role, text }: Props) {
  const isUser = role === "user";
  const bg = isUser ? "#1f6feb22" : "#161b22";
  const border = isUser ? "#1f6feb66" : "#30363d";

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      padding: "6px 0"
    }}>
      <div style={{
        maxWidth: 820,
        width: "100%",
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start"
      }}>
        <div style={{
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: 12,
          padding: "10px 12px",
          whiteSpace: "pre-wrap",
          lineHeight: 1.5
        }}>
          {text}
        </div>
      </div>
    </div>
  );
}
