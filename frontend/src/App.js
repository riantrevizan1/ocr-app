import { useState, useRef, useEffect } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState("");
  const [dark, setDark] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleFile = (f) => {
    setFile(f);
    setText("");
    setError("");
    setStats(null);
    if (f && f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setToast("Texto copiado!");
    setTimeout(() => setToast(""), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setText("");
    setError("");
    setStats(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setText("");
    setStats(null);
    const formData = new FormData();
    formData.append("file", file);
    const start = Date.now();
    try {
      const res = await axios.post("http://127.0.0.1:8000/ocr", formData);
      const t = res.data.text;
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      setText(t);
      setStats({
        words: t.split(/\s+/).filter(Boolean).length,
        chars: t.length,
        time: elapsed,
      });
      setHistory((prev) => [
        { name: file.name, text: t, date: new Date().toLocaleString("pt-BR") },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      const msg = err.response?.data?.detail || "Erro ao processar o arquivo. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex h-screen font-sans ${dark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>

      {/* Sidebar */}
      <aside className={`w-48 flex flex-col p-3 gap-0.5 shrink-0 border-r ${dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
        <div className="flex items-center gap-2.5 px-2 py-3 mb-2">
          <div className="w-7 h-7 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 stroke-white dark:stroke-zinc-900" fill="none" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className={`text-sm font-semibold leading-tight ${dark ? "text-zinc-100" : "text-zinc-900"}`}>OCR App</p>
            <p className={`text-xs ${dark ? "text-zinc-500" : "text-zinc-400"}`}>v1.0</p>
          </div>
        </div>

        {[
          { id: "upload", label: "Novo upload", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
          { id: "history", label: "Histórico", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === item.id
                ? dark ? "bg-zinc-800 text-zinc-100" : "bg-zinc-100 text-zinc-900"
                : dark ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
            </svg>
            {item.label}
          </button>
        ))}

        <div className="mt-auto px-2 pb-1 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <span className={`text-xs ${dark ? "text-zinc-600" : "text-zinc-400"}`}>API online</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className={`px-5 py-3 flex items-center justify-between border-b ${dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
          <div className="flex items-center gap-2.5">
            <span className={`text-sm font-medium ${dark ? "text-zinc-100" : "text-zinc-900"}`}>
              {activeTab === "upload" ? "Extrair texto" : "Histórico"}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${dark ? "border-zinc-700 text-zinc-400" : "border-zinc-200 text-zinc-500"}`}>
              Tesseract OCR
            </span>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${dark ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
          >
            {dark ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
            {dark ? "Light" : "Dark"}
          </button>
        </header>

        {activeTab === "upload" ? (
          <div className="flex-1 flex overflow-hidden">

            {/* Left panel */}
            <div className={`w-56 flex flex-col gap-3 p-4 shrink-0 border-r ${dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all text-center ${
                  dark ? "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800" : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                }`}
              >
                <svg className={`w-7 h-7 ${dark ? "stroke-zinc-600" : "stroke-zinc-300"}`} fill="none" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 10.9" />
                </svg>
                <p className={`text-xs ${dark ? "text-zinc-400" : "text-zinc-500"}`}>Arraste ou clique para enviar</p>
                <span className={`text-xs ${dark ? "text-zinc-600" : "text-zinc-400"}`}>PDF, JPG, PNG · até 10MB</span>
                <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
              </div>

              {preview && (
                <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <img src={preview} alt="preview" className="w-full object-cover max-h-32" />
                </div>
              )}

              {file && (
                <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${dark ? "border-zinc-800 bg-zinc-800/50" : "border-zinc-100 bg-zinc-50"}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${dark ? "bg-red-900/40" : "bg-red-50"}`}>
                    <svg className={`w-3.5 h-3.5 ${dark ? "stroke-red-400" : "stroke-red-400"}`} fill="none" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${dark ? "text-zinc-200" : "text-zinc-700"}`}>{file.name}</p>
                    <p className={`text-xs ${dark ? "text-zinc-500" : "text-zinc-400"}`}>{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${dark ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>pronto</span>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300"
              >
                {loading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Processando...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    Extrair texto
                  </>
                )}
              </button>

              {loading && (
                <p className={`text-xs text-center ${dark ? "text-zinc-600" : "text-zinc-400"}`}>PDFs grandes podem demorar alguns segundos</p>
              )}

              {text && (
                <button
                  onClick={handleReset}
                  className={`w-full py-2 rounded-xl text-xs border transition-all ${dark ? "border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" : "border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"}`}
                >
                  Limpar e começar de novo
                </button>
              )}

              {stats && (
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Palavras", value: stats.words },
                    { label: "Chars", value: stats.chars },
                    { label: "Tempo", value: `${stats.time}s` },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-xl p-2 text-center ${dark ? "bg-zinc-800" : "bg-zinc-50"}`}>
                      <p className={`text-xs mb-0.5 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>{s.label}</p>
                      <p className={`text-sm font-semibold ${dark ? "text-zinc-200" : "text-zinc-700"}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right panel */}
            <div className={`flex-1 flex flex-col gap-3 p-4 overflow-hidden ${dark ? "bg-zinc-950" : "bg-zinc-50"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${dark ? "text-zinc-100" : "text-zinc-900"}`}>Texto extraído</span>
                {text && (
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${dark ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "border-zinc-200 text-zinc-500 hover:bg-white"}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      Copiar
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([text], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${file?.name ?? "texto"}.txt`;
                        a.click();
                      }}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${dark ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "border-zinc-200 text-zinc-500 hover:bg-white"}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Baixar .txt
                    </button>
                  </div>
                )}
              </div>

              <div className={`flex-1 rounded-xl border overflow-y-auto ${dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
                {error && (
                  <div className={`m-4 flex items-start gap-2.5 p-3 rounded-xl border ${dark ? "bg-red-900/20 border-red-900/40" : "bg-red-50 border-red-100"}`}>
                    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? "stroke-red-400" : "stroke-red-400"}`} fill="none" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    </svg>
                    <p className={`text-xs ${dark ? "text-red-400" : "text-red-600"}`}>{error}</p>
                  </div>
                )}
                {!text && !error && (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <svg className={`w-8 h-8 ${dark ? "stroke-zinc-700" : "stroke-zinc-200"}`} fill="none" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                    </svg>
                    <p className={`text-xs ${dark ? "text-zinc-600" : "text-zinc-400"}`}>O texto extraído aparecerá aqui</p>
                  </div>
                )}
                {text && (
                  <pre className={`p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed ${dark ? "text-zinc-300" : "text-zinc-700"}`}>{text}</pre>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex-1 overflow-y-auto p-4 ${dark ? "bg-zinc-950" : "bg-zinc-50"}`}>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <svg className={`w-8 h-8 ${dark ? "stroke-zinc-700" : "stroke-zinc-200"}`} fill="none" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className={`text-xs ${dark ? "text-zinc-600" : "text-zinc-400"}`}>Nenhum documento processado ainda.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-w-2xl mx-auto">
                {history.map((item, i) => (
                  <div key={i} className={`rounded-xl border p-4 flex items-start justify-between gap-4 ${dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${dark ? "text-zinc-200" : "text-zinc-700"}`}>{item.name}</p>
                      <p className={`text-xs mt-0.5 ${dark ? "text-zinc-600" : "text-zinc-400"}`}>{item.date}</p>
                      <p className={`text-xs mt-2 line-clamp-2 ${dark ? "text-zinc-500" : "text-zinc-500"}`}>{item.text}</p>
                    </div>
                    <button
                      onClick={() => { setText(item.text); setActiveTab("upload"); }}
                      className={`text-xs shrink-0 ${dark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-500 hover:text-zinc-700"}`}
                    >
                      Ver texto →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 text-xs px-4 py-2 rounded-xl ${dark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"}`}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

export default App;