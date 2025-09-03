import { useEffect } from 'react';

// Componente que fuerza la eliminación de fondos blancos SOLO EN MODO OSCURO
const DarkModeEnforcer = () => {
  useEffect(() => {
    // Función para eliminar fondos blancos SOLO cuando el modo oscuro está activo
    const removeWhiteBackgroundsInDarkMode = () => {
      // Verificar si el modo oscuro está activo
      const isDarkMode = document.body.classList.contains('dark-mode') ||
                         document.documentElement.hasAttribute('data-theme') &&
                         document.documentElement.getAttribute('data-theme') === 'dark';
      
      // Solo actuar si el modo oscuro está activo
      if (!isDarkMode) {
        return;
      }
      
      // Seleccionar elementos que podrían tener fondo blanco en modo oscuro
      const selectors = [
        '[style*="background-color: white"]',
        '[style*="background-color: #fff"]',
        '[style*="background-color: #ffffff"]',
        '[style*="background: white"]',
        '[style*="background: #fff"]',
        '[style*="background: #ffffff"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const htmlElement = element as HTMLElement;
          const computedStyle = window.getComputedStyle(htmlElement);
          const bgColor = computedStyle.backgroundColor;
          
          // Verificar si el elemento tiene fondo blanco
          if (bgColor === 'rgb(255, 255, 255)' || 
              bgColor === 'white' || 
              bgColor === '#ffffff' ||
              bgColor === '#fff' ||
              bgColor === 'rgba(255, 255, 255, 1)') {
            
            // Determinar qué color de fondo aplicar según el elemento
            if (htmlElement.className.includes('MuiContainer') || 
                htmlElement.id === 'root' ||
                htmlElement.tagName === 'MAIN' ||
                htmlElement.tagName === 'BODY') {
              htmlElement.style.setProperty('background-color', '#0f0f0f', 'important');
            } else {
              htmlElement.style.setProperty('background-color', '#1e1e1e', 'important');
            }
            
            htmlElement.style.setProperty('color', '#ffffff', 'important');
          }
        });
      });
      
      // Detectar elementos con fondo blanco computado
      const allElements = document.querySelectorAll('div, section, article, main, header, footer, nav, aside');
      allElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlElement);
        const bgColor = computedStyle.backgroundColor;
        
        if (bgColor === 'rgb(255, 255, 255)' || 
            bgColor === 'white' || 
            bgColor === '#ffffff' ||
            bgColor === '#fff' ||
            bgColor === 'rgba(255, 255, 255, 1)') {
          
          // Solo cambiar si no es un elemento que debería mantener fondo blanco en modo oscuro
          if (!htmlElement.closest('.keep-white-bg')) {
            if (htmlElement.className.includes('MuiContainer') || 
                htmlElement.id === 'root' ||
                htmlElement.tagName === 'MAIN') {
              htmlElement.style.setProperty('background-color', '#0f0f0f', 'important');
            } else {
              htmlElement.style.setProperty('background-color', '#1e1e1e', 'important');
            }
            htmlElement.style.setProperty('color', '#ffffff', 'important');
          }
        }
      });
    };
    
    // Ejecutar solo en modo oscuro
    const checkAndRemoveWhiteBg = () => {
      const isDarkMode = document.body.classList.contains('dark-mode') ||
                         document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDarkMode) {
        removeWhiteBackgroundsInDarkMode();
      }
    };
    
    // Ejecutar inmediatamente
    checkAndRemoveWhiteBg();
    
    // Ejecutar después de delays para elementos que se cargan después (solo en modo oscuro)
    const timeouts = [50, 100, 200, 500].map(delay => 
      setTimeout(checkAndRemoveWhiteBg, delay)
    );
    
    // Observar cambios en el DOM (solo actuar en modo oscuro)
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldCheck = true;
        }
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || 
             mutation.attributeName === 'class' ||
             mutation.attributeName === 'data-theme')) {
          shouldCheck = true;
        }
      });
      
      if (shouldCheck) {
        setTimeout(checkAndRemoveWhiteBg, 10);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'data-theme']
    });
    
    // Escuchar eventos de cambio de tema
    const handleThemeChange = (event: any) => {
      const isDarkMode = event.detail;
      if (isDarkMode) {
        setTimeout(removeWhiteBackgroundsInDarkMode, 50);
      }
      // No hacer nada en modo claro - dejar que los estilos normales se apliquen
    };
    
    window.addEventListener('darkModeChanged', handleThemeChange);
    
    // Cleanup
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      observer.disconnect();
      window.removeEventListener('darkModeChanged', handleThemeChange);
    };
  }, []);
  
  return null; // Este componente no renderiza nada
};

export default DarkModeEnforcer;
