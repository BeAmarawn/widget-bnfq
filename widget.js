(function() {
  'use strict';
  
  const CONFIG = {
    IFRAME_URL: 'http://localhost:5173'
  };

  let isWidgetOpen = false;
  let widgetIframe = null;

  function createIframe() {
    if (widgetIframe) return;
    
    widgetIframe = document.createElement('iframe');
    widgetIframe.id = 'user-widget-iframe';
    widgetIframe.src = CONFIG.IFRAME_URL;
    widgetIframe.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 360px;
      height: 640px;
      border: none;
      border-radius: 16px;
      z-index: 999999;
      overflow: visible;
      background: transparent;
      transition: all 0.3s ease;
      color-scheme: light dark;
    `;
    widgetIframe.setAttribute('title', 'User Widget');
    widgetIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation');
    
    document.body.appendChild(widgetIframe);
  }

  function showWidget() {
    if (!widgetIframe) createIframe();
    
    isWidgetOpen = true;
    sendMessageToIframe({ type: 'SHOW_WIDGET' });
    console.log('Widget aberto');
  }
  
  function hideWidget() {
    if (widgetIframe) {
      isWidgetOpen = false;
      sendMessageToIframe({ type: 'HIDE_WIDGET' });
      console.log('Widget fechado');
    }
  }
  
  function toggleWidget() {
    if (isWidgetOpen) {
      hideWidget();
    } else {
      showWidget();
    }
  }

  function sendMessageToIframe(message) {
    if (widgetIframe && widgetIframe.contentWindow) {
      try {
        widgetIframe.contentWindow.postMessage(message, '*');
        console.log('📤 Mensagem enviada:', message.type);
      } catch (error) {
        console.warn('Erro ao enviar mensagem:', error);
      }
    }
  }

  function handleIframeMessages(event) {
    const { type } = event.data;
    
    switch (type) {
      case 'READY':
        sendMessageToIframe({ 
          type: 'USER_DATA',
          userId: window.loggedUserId,
          isWidgetOpen: isWidgetOpen
        });
        break;
        
      case 'CLOSE_WIDGET':
        hideWidget();
        break;
        
      case 'OPEN_WIDGET':
        showWidget();
        break;
        
      case 'REQUEST_USER_DATA':
        sendMessageToIframe({ 
          type: 'USER_DATA',
          userId: window.loggedUserId,
          isWidgetOpen: isWidgetOpen
        });
        break;
        
      default:
        console.log('📥 Mensagem recebida:', type);
    }
  }

  function initWidget() {
    if (window._userWidgetInitialized) {
      console.warn('Widget já foi inicializado');
      return;
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initWidget);
      return;
    }
    
    console.log('🚀 Inicializando User Widget...');
    
    window.addEventListener('message', handleIframeMessages);
    createIframe();
    
    window._userWidgetInitialized = true;
    
    if (window.loggedUserId) {
      console.log('✅ loggedUserId:', window.loggedUserId);
    } else {
      console.warn('⚠️ loggedUserId não encontrado');
    }
  }

  initWidget();
  
  window.UserWidget = {
    open: showWidget,
    close: hideWidget,
    toggle: toggleWidget,
    isOpen: () => isWidgetOpen,
    sendMessage: sendMessageToIframe
  };

})();
