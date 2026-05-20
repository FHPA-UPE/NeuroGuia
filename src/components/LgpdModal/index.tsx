'use client'
import { useEffect, useRef } from 'react'

interface Props {
  onAccept: () => void
  onDecline: () => void
}

export function LgpdModal({ onAccept, onDecline }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="rounded-card p-6 max-w-sm w-full bg-pure-white shadow-lg"
      aria-labelledby="lgpd-title"
    >
      <h2 id="lgpd-title" className="text-lg font-bold text-midnight mb-3">Ativação de Microfone</h2>
      <p className="text-sm text-slate-text mb-4">
        O reconhecimento de voz usa a Web Speech API do Google. Seu áudio será enviado para servidores do Google para transcrição. Nenhum dado é armazenado pelo NeuroGuia.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onDecline}
          className="rounded-btn px-4 py-2.5 border border-mist text-midnight hover:bg-frost transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onAccept}
          className="rounded-btn px-4 py-2.5 bg-calm-indigo text-white hover:bg-deep-indigo transition-colors"
        >
          Entendi e aceito
        </button>
      </div>
    </dialog>
  )
}
