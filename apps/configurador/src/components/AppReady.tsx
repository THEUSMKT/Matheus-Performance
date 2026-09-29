'use client';
/* ==========================================================================
   Marca que o JavaScript da página iniciou (data-app="ok" no <html>). O
   script de verificação do layout usa essa marca: se a página carregar e
   ela não aparecer, mostra o aviso com contato direto (AppFallback).
   ========================================================================== */
import { useEffect } from 'react';

export function AppReady() {
  useEffect(() => {
    document.documentElement.setAttribute('data-app', 'ok');
    // Aviso mostrado cedo demais (rede muito lenta): some assim que a página inicia.
    document.getElementById('app-fallback')?.setAttribute('hidden', '');
  }, []);
  return null;
}
