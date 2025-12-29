
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';

interface CountUpProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
}

export const CountUpNumber = ({ value, prefix = '', suffix = '', decimals = 0, className = '' }: CountUpProps) => {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { stiffness: 60, damping: 15 });
    const displayValue = useTransform(springValue, (latest) => {
        return prefix + latest.toFixed(decimals) + suffix;
    });

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    return <motion.span className={className}>{displayValue}</motion.span>;
};
