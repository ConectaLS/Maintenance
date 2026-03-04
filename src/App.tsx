import React, { useEffect, useState, useRef } from 'react';
import MaintenancePage from './components/MaintenancePage';
import { Shield, Send, User, LogOut, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MaintenanceStatus {
  isActive: boolean;
  message: string;
}

interface ChatMessage {
  type: 'chat';
  user: string;
  text: string;
  timestamp: number;
}

export default function App() {
  const [maintenance, setMaintenance] = useState<MaintenanceStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState('User_' + Math.floor(Math.random() * 1000));
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Initial Maintenance Check
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => {
        setMaintenance(data);
        setCustomMessage(data.message);
      })
      .catch(err => console.error("Failed to fetch status", err));

    // 2. WebSocket Connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'maintenance_active') {
        setMaintenance({ isActive: true, message: data.message });
      } else if (data.type === 'maintenance_inactive') {
        setMaintenance({ isActive: false, message: '' });
      } else if (data.type === 'chat') {
        setMessages(prev => [...prev, data]);
      }
    };

    return () => socket.close();
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;

    const msg: ChatMessage = {
      type: 'chat',
      user: username,
      text: inputText,
      timestamp: Date.now()
    };

    socketRef.current.send(JSON.stringify(msg));
    setInputText('');
  };

  const toggleMaintenance = async () => {
    if (!isAdmin) return;
    const nextStatus = !maintenance?.isActive;
    
    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextStatus, message: customMessage })
      });
      const data = await res.json();
      setMaintenance({ isActive: data.isActive, message: data.message });
    } catch (err) {
      console.error("Failed to toggle maintenance", err);
    }
  };

  const updateMaintenanceMessage = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: maintenance?.isActive, message: customMessage })
      });
      const data = await res.json();
      setMaintenance({ isActive: data.isActive, message: data.message });
      alert("Mensagem atualizada com sucesso!");
    } catch (err) {
      console.error("Failed to update message", err);
    }
  };

  if (maintenance?.isActive && !isAdmin) {
    return <MaintenancePage message={maintenance.message} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
            <Send size={20} />
          </div>
          <div>
            <h1 className="font-bold tracking-tight">ChatApp</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            <Shield size={14} />
            {isAdmin ? 'Admin Mode' : 'User Mode'}
          </button>
          <div className="h-8 w-[1px] bg-zinc-200" />
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{username}</p>
              <p className="text-[10px] text-zinc-400">Active Session</p>
            </div>
            <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-200">
              <User size={16} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="md:col-span-2 flex flex-col h-[calc(100vh-180px)] bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-300 space-y-2">
                <Send size={48} strokeWidth={1} />
                <p className="text-sm font-medium">Nenhuma mensagem ainda...</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.timestamp + i}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`flex flex-col ${msg.user === username ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.user === username 
                      ? 'bg-zinc-900 text-white rounded-tr-none' 
                      : 'bg-zinc-100 text-zinc-800 rounded-tl-none'
                  }`}>
                    <p className="text-[10px] font-bold opacity-50 mb-0.5">{msg.user}</p>
                    <p>{msg.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <form onSubmit={sendMessage} className="p-4 bg-zinc-50 border-t border-zinc-200 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
            />
            <button 
              type="submit"
              className="bg-zinc-900 text-white p-2.5 rounded-xl hover:bg-zinc-800 transition-colors active:scale-95"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Sidebar / Settings */}
        <div className="space-y-6">
          {/* Admin Panel */}
          {isAdmin && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900 rounded-3xl p-6 text-white shadow-xl shadow-zinc-900/20"
            >
              <div className="flex items-center gap-2 mb-6">
                <Shield size={20} className="text-amber-400" />
                <h2 className="font-bold tracking-tight">Admin Control</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <p className="text-sm font-bold">Modo Manutenção</p>
                    <p className="text-[10px] text-zinc-400">Bloqueia acesso geral</p>
                  </div>
                  <button 
                    onClick={toggleMaintenance}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {maintenance?.isActive ? (
                      <ToggleRight size={32} className="text-amber-400" />
                    ) : (
                      <ToggleLeft size={32} />
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mensagem de Aviso</label>
                  <textarea 
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Ex: Voltamos em 30 minutos..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400/50 min-h-[80px] resize-none"
                  />
                  <button 
                    onClick={updateMaintenanceMessage}
                    className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-2 rounded-lg transition-colors uppercase tracking-widest"
                  >
                    Atualizar Mensagem
                  </button>
                </div>

                <div className="p-4 bg-amber-400/10 border border-amber-400/20 rounded-2xl">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Status Atual</p>
                  <p className="text-xs text-zinc-300">
                    {maintenance?.isActive 
                      ? "O sistema está atualmente em manutenção. Apenas administradores podem ver esta tela." 
                      : "O sistema está operando normalmente."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Profile Info */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
            <h2 className="font-bold mb-4 text-sm">Configurações</h2>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Seu Apelido</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <button className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 rounded-2xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                    <LogOut size={16} />
                  </div>
                  <span className="text-xs font-bold text-zinc-600">Sair da Sessão</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
