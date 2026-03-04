import React from 'react';
import { Settings, RefreshCw, Cpu, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface MaintenancePageProps {
  message?: string;
}

export default function MaintenancePage({ message }: MaintenancePageProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 font-sans overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg w-full bg-[#121214]/80 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-16 text-center border border-white/5 shadow-2xl relative z-10"
      >
        {/* Animated Illustration */}
        <div className="relative flex justify-center mb-12">
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative"
          >
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu size={48} className="text-white" strokeWidth={1.5} />
            </div>
            
            {/* Pulsing Ring */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-[-8px] border border-indigo-500/30 rounded-[2rem]"
            />
          </motion.div>

          {/* Small Floating Gear */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -right-4 top-0 text-zinc-700"
          >
            <Settings size={32} strokeWidth={1} />
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Estamos em manutenção
          </h1>
          
          <p className="text-zinc-400 text-lg mb-10 leading-relaxed font-light">
            {message || "Voltamos em breve! Estamos realizando melhorias para tornar sua experiência ainda melhor."}
          </p>
        </motion.div>

        {/* Actions */}
        <div className="space-y-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReload}
            className="w-full bg-white text-black font-semibold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5 hover:bg-zinc-100"
          >
            <RefreshCw size={20} className="text-black/70" />
            Recarregar página
          </motion.button>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <a 
              href="#" 
              className="flex items-center gap-2 text-zinc-500 hover:text-indigo-400 text-sm font-medium transition-colors group"
            >
              <Activity size={16} className="group-hover:animate-pulse" />
              Status do Sistema
              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            
            <div className="hidden sm:block w-1 h-1 bg-zinc-800 rounded-full" />
            
            <div className="flex gap-4">
              {['Twitter', 'Discord'].map((social) => (
                <a 
                  key={social}
                  href="#" 
                  className="text-zinc-500 hover:text-white text-sm font-medium transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Micro-detail */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-800">
          System Core v2.4.0 • Maintenance Mode
        </p>
      </div>
    </div>
  );
}
