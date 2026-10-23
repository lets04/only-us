import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ImagePlus, X } from 'lucide-react'
import type { ReactNode } from 'react'

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <header className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{children}</p></header>
}

export function ImagePlaceholder({ label = 'Espacio para nuestra foto', className = '' }: { label?: string; className?: string }) {
  return <div className={`image-placeholder ${className}`}><span className="placeholder-star">✦</span><ImagePlus size={20} /><span>{label}</span></div>
}

export function Notice({ children, kind = 'info' }: { children: ReactNode; kind?: 'info' | 'warning' }) {
  return <div className={`notice notice--${kind}`}><AlertCircle size={18} /><span>{children}</span></div>
}

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  return <AnimatePresence>{open && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
    <motion.section className="modal" initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} onMouseDown={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-label={title}>
      <button className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button><h2>{title}</h2>{children}
    </motion.section>
  </motion.div>}</AnimatePresence>
}
