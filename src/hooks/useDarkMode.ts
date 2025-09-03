import { useEffect } from 'react';

// Hook para forzar el modo oscuro en elementos DOM (actualizado para manejar modo claro)
export const useDarkModeForcer = (isDarkMode: boolean) => {
  useEffect(() => {
    const applyThemeMode = () => {
      if (isDarkMode) {
        // Aplicar modo oscuro
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('data-mui-color-scheme', 'dark');
        
        // Remover clases de modo claro si existen
        document.body.classList.remove('light-mode');
        document.documentElement.classList.remove('light-mode');
        
        // Forzar estilos directamente en elementos críticos
        document.body.style.setProperty('background-color', '#0f0f0f', 'important');
        document.documentElement.style.setProperty('background-color', '#0f0f0f', 'important');
        document.body.style.setProperty('color', '#ffffff', 'important');
        
        // Obtener el elemento root
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.style.setProperty('background-color', '#0f0f0f', 'important');
          rootElement.style.setProperty('color', '#ffffff', 'important');
        }
        
        // Forzar elementos Material-UI a modo oscuro
        const allPapers = document.querySelectorAll('[class*="MuiPaper"]');
        allPapers.forEach((paper) => {
          (paper as HTMLElement).style.setProperty('background-color', '#1e1e1e', 'important');
          (paper as HTMLElement).style.setProperty('color', '#ffffff', 'important');
        });
        
        const allCards = document.querySelectorAll('[class*="MuiCard"]');
        allCards.forEach((card) => {
          (card as HTMLElement).style.setProperty('background-color', '#1e1e1e', 'important');
          (card as HTMLElement).style.setProperty('color', '#ffffff', 'important');
        });
        
        const allContainers = document.querySelectorAll('[class*="MuiContainer"]');
        allContainers.forEach((container) => {
          (container as HTMLElement).style.setProperty('background-color', '#0f0f0f', 'important');
          (container as HTMLElement).style.setProperty('color', '#ffffff', 'important');
        });
        
      } else {
        // Aplicar modo claro
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-mui-color-scheme');
        
        // Añadir clases de modo claro
        document.body.classList.add('light-mode');
        document.documentElement.classList.add('light-mode');
        document.documentElement.setAttribute('data-theme', 'light');
        
        // Forzar estilos de modo claro
        document.body.style.setProperty('background-color', '#fafafa', 'important');
        document.documentElement.style.setProperty('background-color', '#fafafa', 'important');
        document.body.style.setProperty('color', '#1a1a1a', 'important');
        
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.style.setProperty('background-color', '#fafafa', 'important');
          rootElement.style.setProperty('color', '#1a1a1a', 'important');
        }
        
        // Remover estilos forzados de modo oscuro de todos los elementos
        const allElements = document.querySelectorAll('*');
        allElements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          
          // Solo remover estilos si son del modo oscuro
          const bgColor = htmlElement.style.backgroundColor;
          if (bgColor === 'rgb(15, 15, 15)' || bgColor === '#0f0f0f' || 
              bgColor === 'rgb(30, 30, 30)' || bgColor === '#1e1e1e') {
            htmlElement.style.removeProperty('background-color');
            htmlElement.style.removeProperty('color');
          }
        });
        
        // Restaurar Material-UI a colores predeterminados
        const allPapers = document.querySelectorAll('[class*="MuiPaper"]');
        allPapers.forEach((paper) => {
          (paper as HTMLElement).style.removeProperty('background-color');
          (paper as HTMLElement).style.removeProperty('color');
        });
        
        const allCards = document.querySelectorAll('[class*="MuiCard"]');
        allCards.forEach((card) => {
          (card as HTMLElement).style.removeProperty('background-color');
          (card as HTMLElement).style.removeProperty('color');
        });
        
        const allContainers = document.querySelectorAll('[class*="MuiContainer"]');
        allContainers.forEach((container) => {
          (container as HTMLElement).style.removeProperty('background-color');
          (container as HTMLElement).style.removeProperty('color');
        });
      }
    };
    
    // Aplicar inmediatamente
    applyThemeMode();
    
    // Aplicar después de un pequeño delay para asegurar que el DOM esté listo
    const timeout = setTimeout(applyThemeMode, 50);
    
    // Cleanup
    return () => {
      clearTimeout(timeout);
    };
  }, [isDarkMode]);
};

// Hook para forzar el rerender cuando cambia el modo
export const useDarkModeRerender = (isDarkMode: boolean) => {
  useEffect(() => {
    // Forzar un rerender del DOM después de un pequeño delay
    const timeout = setTimeout(() => {
      // Disparar un evento personalizado para que los componentes se actualicen
      window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: isDarkMode }));
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [isDarkMode]);
};
