import React from 'react';
import { Settings, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface MaintenancePageProps {
  message?: string;
}

export default function MaintenancePage({ message }: MaintenancePageProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-zinc-200/50 p-8 text-center border border-zinc-100"
      >
        <div className="relative inline-block mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="text-zinc-200"
          >
            <Settings size={80} strokeWidth={1} />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center text-amber-500">
            <AlertTriangle size={32} />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-zinc-900 mb-3 tracking-tight">
          Modo de Manutenção
        </h1>
        
        <p className="text-zinc-500 mb-8 leading-relaxed">
          {message || "Estamos realizando algumas atualizações importantes para melhorar sua experiência. Voltaremos em instantes!"}
        </p>

        <div className="space-y-3">
          <button
            onClick={handleReload}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 group active:scale-95"
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
            Tentar novamente
          </button>
          
          <div className="pt-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-300">
              System Status: Maintenance Active
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
