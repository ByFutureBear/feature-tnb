
import { motion } from 'framer-motion';

export const AnimatedBackground = ({ children }: { children: React.ReactNode }) => {
    return (
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            {/* Background Gradient Mesh */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: -1,
                    background: 'radial-gradient(circle at 50% 50%, #f5f7fa 0%, #e4e8f0 100%)',
                }}
            >
                {/* Only render animated blobs on larger screens to prevent lag on mobile */}
                <div className="hidden md:block">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                            rotate: [0, 90, 0],
                        }} // Slow pulse animation
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            position: 'absolute',
                            top: '-20%',
                            left: '-10%',
                            width: '800px',
                            height: '800px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(87, 204, 153, 0.15) 0%, rgba(0,0,0,0) 70%)',
                            filter: 'blur(60px)',
                            transform: 'translateZ(0)', // Hardware acceleration
                        }}
                    />

                    <motion.div
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -100, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            bottom: '-10%',
                            right: '-5%',
                            width: '600px',
                            height: '600px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(26, 95, 122, 0.1) 0%, rgba(0,0,0,0) 70%)',
                            filter: 'blur(80px)',
                            transform: 'translateZ(0)', // Hardware acceleration
                        }}
                    />
                </div>
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
};
