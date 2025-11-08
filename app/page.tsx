import Chat from "../components/Chat";

export default function Page() {
  return (
    <div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 0" }}>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: 0.2 }}>Aarambh AI</h1>
        <div style={{ opacity: 0.7, marginTop: 4, fontSize: 14 }}>
          ChatGPT जैसे अनुभव के लिए बनाया गया — Aarambh AI — अपने मॉडल और कुंजी सेट करें और शुरू करें।
        </div>
      </div>
      <Chat />
    </div>
  );
}
