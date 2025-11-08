"use client";
import React from "react";

const MODELS = ["gpt-4o-mini","gpt-4o","gpt-4.1-mini","gpt-3.5-turbo"];

export default function ModelSelector({ value, onChange }:{ value:string; onChange:(v:string)=>void }){
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      <label style={{ fontSize:12, opacity:0.8 }}>Model:</label>
      <select value={value} onChange={(e)=>onChange(e.target.value)} style={{ background:"#0d1117", color:"#e6edf3", border:"1px solid #30363d", borderRadius:8, padding:"6px 8px" }}>
        {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );
}
