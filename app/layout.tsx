export const metadata = {
  title: "Aarambh AI",
  description: "Aarambh AI — ChatGPT-like chat built with Next.js"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0b0f14", color: "#e6edf3", fontFamily: "Inter, system-ui, Arial" }}>
        {children}
      </body>
    </html>
  );
}
