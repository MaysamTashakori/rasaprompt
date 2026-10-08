"use client"
// ورود هنگام دیده‌شدن: سلسله‌مراتب بصری بخش‌ها (با احترام به کاهش حرکت)
import { motion, useReducedMotion } from "motion/react"

export function Reveal({ children, delay = 0, className, y = 20 }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}
