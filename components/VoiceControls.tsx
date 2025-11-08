"use client";
import React, { useEffect, useRef, useState } from "react";

export default function VoiceControls({ onTranscript }:{ onTranscript:(t:string)=>void }){
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(()=>{
    // @ts-ignore
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "hi-IN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e:any)=>{
      let text = "";
      for(let i=0;i<e.results.length;i++){
        text += e.results[i][0].transcript;
      }
      onTranscript(text);
    };
    rec.onend = ()=> setListening(false);
    recRef.current = rec;
  }, [onTranscript]);

  function start(){
    if (!recRef.current) return alert("Voice recognition not supported here.");
    setListening(true);
    recRef.current.start();
  }
  function stop(){
    try{ recRef.current?.stop(); } catch {}
    setListening(false);
  }

  function speak(txt:string){
    if (!("speechSynthesis" in window)) return alert("TTS not supported here.");
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "hi-IN";
    window.speechSynthesis.speak(u);
  }

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      <button onClick={listening?stop:start} style={{ background:listening?"#9e1c1c":"#1f6feb", border:"1px solid #30363d", padding:"6px 10px", borderRadius:8, color:"#fff", cursor:"pointer" }}>
        {listening? "Stop Voice" : "🎙️ Voice"}
      </button>
      <button onClick={()=>speak("नमस्ते, मैं Aarambh AI बोल रहा हूँ।")} style={{ background:"#3c3c3c", border:"1px solid #30363d", padding:"6px 10px", borderRadius:8, color:"#fff", cursor:"pointer" }}>
        🔊 Test TTS
      </button>
    </div>
  );
}
