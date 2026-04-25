export type Language = 'en' | 'es';

export interface TranslationDictionary {
  appTitle: string;
  nav: {
    home: string;
    dashboard: string;
    analytics: string;
    faq: string;
    tree: string;
    profile: string;
  };
  home: {
    welcomeTitle: string;
    welcomeDescription: string;
    features: {
      payment: string;
      analytics: string;
      monitoring: string;
    };
    cta: {
      getStarted: string;
      viewDashboard: string;
      viewAnalytics: string;
    };
  };
  dashboard: {
    title: string;
    description: string;
    currentUsage: string;
    lastPayment: string;
    nextBill: string;
    quickActions: string;
    payNow: string;
    viewHistory: string;
    updateProfile: string;
  };
  analytics: {
    title: string;
    description: string;
    usageTrends: string;
    costAnalysis: string;
    averageUsage: string;
    peakHour: string;
    efficiencyScore: string;
    recommendations: string;
    loading: string;
    export: string;
    tableSummary: string;
    trackedEvents: string;
    exportSuccess: string;
    exportFail: string;
    up: string;
    down: string;
    stable: string;
    successful: string;
    failed: string;
    total: string;
  };
  tree: {
    title: string;
    description: string;
    instruction: string;
  };
  language: {
    label: string;
    english: string;
    spanish: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appTitle: 'NEPA Platform',
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      faq: 'FAQ',
      tree: 'Tree View',
      profile: 'Profile',
    },
    home: {
      welcomeTitle: 'Welcome to NEPA',
      welcomeDescription: 'Modern utility management platform with advanced analytics and payment processing.',
      features: {
        payment: 'Secure and efficient payment processing with multiple payment options.',
        analytics: 'Detailed insights into your utility consumption patterns and trends.',
        monitoring: 'Real-time monitoring and alerts for your utility services.',
      },
      cta: {
        getStarted: 'Get Started',
        viewDashboard: 'View User Dashboard',
        viewAnalytics: 'View Analytics Dashboard',
      },
    },
    dashboard: {
      title: 'User Dashboard',
      description: 'Manage your utility services and view usage statistics.',
      currentUsage: 'Current Usage',
      lastPayment: 'Last Payment',
      nextBill: 'Next Bill',
      quickActions: 'Quick Actions',
      payNow: 'Make Payment',
      viewHistory: 'View History',
      updateProfile: 'Update Profile',
    },
    analytics: {
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights for your utility management.',
      usageTrends: 'Usage Trends',
      costAnalysis: 'Cost Analysis',
      averageUsage: 'Average Daily Usage',
      peakHour: 'Peak Usage Hour',
      efficiencyScore: 'Efficiency Score',
      recommendations: 'Recommendations',
      loading: 'Loading analytics data...',
      export: 'Export Data',
      tableSummary: 'Tracked events summary',
      trackedEvents: 'Tracked Events',
      exportSuccess: 'Export complete',
      exportFail: 'Export failed',
      up: 'Up',
      down: 'Down',
      stable: 'Stable',
      successful: 'Successful',
      failed: 'Failed',
      total: 'Total',
    },
    tree: {
      title: 'Tree View',
      description: 'Explore hierarchical utility assets in an accessible and responsive tree.',
      instruction: 'Expand nodes to reveal children and use keyboard navigation to explore the structure.',
      selectedNodeLabel: 'Selected node:',
    },
    language: {
      label: 'Language',
      english: 'English',
      spanish: 'Spanish',
    },
  },
  es: {
    appTitle: 'Plataforma NEPA',
    nav: {
      home: 'Inicio',
      dashboard: 'Panel',
      analytics: 'Analítica',
      faq: 'Preguntas',
      tree: 'Vista de árbol',
      profile: 'Perfil',
    },
    home: {
      welcomeTitle: 'Bienvenido a NEPA',
      welcomeDescription: 'Plataforma moderna de gestión de servicios públicos con análisis y pagos avanzados.',
      features: {
        payment: 'Procesamiento de pagos seguro y eficiente con múltiples opciones.',
        analytics: 'Información detallada sobre tus patrones de consumo de servicios públicos.',
        monitoring: 'Monitoreo en tiempo real y alertas para tus servicios.',
      },
      cta: {
        getStarted: 'Comenzar',
        viewDashboard: 'Ver Panel de Usuario',
        viewAnalytics: 'Ver Analítica',
      },
    },
    dashboard: {
      title: 'Panel de Usuario',
      description: 'Administra tus servicios y consulta estadísticas de uso.',
      currentUsage: 'Uso Actual',
      lastPayment: 'Último Pago',
      nextBill: 'Próxima Factura',
      quickActions: 'Acciones rápidas',
      payNow: 'Realizar Pago',
      viewHistory: 'Ver Historial',
      updateProfile: 'Actualizar Perfil',
    },
    analytics: {
      title: 'Panel de Analítica',
      description: 'Analítica completa e información para la gestión de servicios públicos.',
      usageTrends: 'Tendencias de Uso',
      costAnalysis: 'Análisis de Costos',
      averageUsage: 'Uso Diario Promedio',
      peakHour: 'Hora de Mayor Uso',
      efficiencyScore: 'Puntaje de Eficiencia',
      recommendations: 'Recomendaciones',
      loading: 'Cargando datos analíticos...',
      export: 'Exportar Datos',
      tableSummary: 'Resumen de eventos registrados',
      trackedEvents: 'Eventos Registrados',
      exportSuccess: 'Exportación completada',
      exportFail: 'Error en la exportación',
      up: 'Ascendente',
      down: 'Descendente',
      stable: 'Estable',
      successful: 'Exitoso',
      failed: 'Fallido',
      total: 'Total',
    },
    tree: {
      title: 'Vista de árbol',
      description: 'Explora activos jerárquicos de servicios públicos con un árbol accesible y adaptable.',
      instruction: 'Expande nodos para ver los hijos y usa el teclado para navegar.',
      selectedNodeLabel: 'Nodo seleccionado:',
    },
    language: {
      label: 'Idioma',
      english: 'Inglés',
      spanish: 'Español',
    },
  },
};
