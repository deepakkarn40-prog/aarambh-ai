"use client";
import React, { useState } from "react";

type Doc = { id:string; name:string; content:string };

export default function DocPanel({ onDocs }:{ onDocs:(docs:Doc[])=>void }){
  const [docs, setDocs] = useState<Doc[]>([]);
  const [text, setText] = useState("");

  function addDoc(){
    const t = text.trim();
    if(!t) return;
    const d: Doc = { id: String(Date.now()), name: "Notes "+(docs.length+1), content: t };
    const next = [...docs, d];
    setDocs(next);
    setText("");
    onDocs(next);
  }

  function remove(id:string){
    const next = docs.filter(d => d.id !== id);
    setDocs(next);
    onDocs(next);
  }

  return (
    <div style={{ background:"#0d1117", border:"1px solid #30363d", borderRadius:12, padding:12 }}>
      <div style={{ fontWeight:600, marginBottom:6 }}>Session Docs (RAG-lite)</div>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} placeholder="Paste small notes or FAQ here..." style={{ width:"100%", background:"#0b0f14", color:"#e6edf3", border:"1px solid #30363d", borderRadius:8, padding:8 }} />
      <div style={{ display:"flex", gap:8, marginTop:8 }}>
        <button onClick={addDoc} style={{ background:"#238636", border:"1px solid #2ea043", padding:"6px 10px", borderRadius:8, color:"#fff" }}>Add</button>
      </div>
      <div style={{ marginTop:8, display:"grid", gap:6 }}>
        {docs.map(d => (
          <div key={d.id} style={{ border:"1px solid #30363d", borderRadius:8, padding:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontWeight:600 }}>{d.name}</div>
              <button onClick={()=>remove(d.id)} style={{ background:"#3c3c3c", border:"1px solid #30363d", padding:"4px 8px", borderRadius:6, color:"#fff" }}>Delete</button>
            </div>
            <div style={{ marginTop:6, whiteSpace:"pre-wrap", opacity:0.85 }}>{d.content.slice(0,500)}{d.content.length>500?"…":""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
