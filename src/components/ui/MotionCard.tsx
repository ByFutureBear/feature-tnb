
import { motion } from 'framer-motion';
import React from 'react';

interface MotionCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    style?: React.CSSProperties;
}

export const MotionCard: React.FC<MotionCardProps> = ({ children, className = '', delay = 0, style = {} }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
            whileHover={{
                y: -8,
                boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                scale: 1.02
            }}
            className={`card ${className}`}
            style={{ willChange: 'transform', ...style }} // Optimize performance and merge custom styles
        >
            {children}
        </motion.div>
    );
};
