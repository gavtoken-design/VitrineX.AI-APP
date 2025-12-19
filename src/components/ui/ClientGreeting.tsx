import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ClientGreetingProps {
    name: string;
}

const ClientGreeting: React.FC<ClientGreetingProps> = ({ name }) => {
    // Unified color scheme for a more inclusive and maintainable design
    const gradient = 'from-primary to-accent';

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group cursor-default"
        >
            {/* Liquid Background Effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-full blur opacity-40 group-hover:opacity-80 transition duration-500 animate-pulse`}></div>

            {/* Main Badge with Floating Animation */}
            <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 shadow-lg"
            >
                <div className={`p-1 rounded-full bg-gradient-to-br ${gradient}`}>
                    <UserIcon className="w-3 h-3 text-white" />
                </div>

                <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 flex items-center gap-1">
                    Olá, <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent max-w-[100px] sm:max-w-[200px] truncate block`}>{name}</span>
                </span>
            </motion.div>
        </motion.div>
    );
};

export default ClientGreeting;
