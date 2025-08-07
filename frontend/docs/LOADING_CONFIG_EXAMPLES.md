// 🎯 EXEMPLOS DE COMO USAR O SISTEMA CONFIGURÁVEL DE LOADING

import { updateLoadingConfig } from "@shared/hooks/useLoadingConfig";

// ✅ OPÇÃO 1: Sem skeleton (comportamento atual - recomendado)
updateLoadingConfig({
useRouteSkeleton: false,
useLazyLoading: false,
});

// ✅ OPÇÃO 2: Com RouteSkeleton (se quiser usar)
updateLoadingConfig({
useRouteSkeleton: true,
useLazyLoading: true,
});

// ✅ OPÇÃO 3: Lazy loading sem skeleton visual
updateLoadingConfig({
useRouteSkeleton: false,
useLazyLoading: true,
});

// ✅ OPÇÃO 4: Personalizar duração das animações
updateLoadingConfig({
useRouteSkeleton: false,
useLazyLoading: false,
animationDuration: 0.6, // Animações mais lentas
});

/\*
🎯 COMO USAR:

1. No início da sua aplicação (main.tsx ou App.tsx), chame:
   updateLoadingConfig({ useRouteSkeleton: true/false });

2. O sistema automaticamente vai usar a configuração escolhida

3. Para mudar em tempo de execução:
   - Chame updateLoadingConfig() novamente
   - A próxima navegação para /comunicacoes vai usar a nova config

📝 VANTAGENS:

- ✅ Flexibilidade total
- ✅ Fácil de alternar entre estratégias
- ✅ Mantém ambas as opções disponíveis
- ✅ Zero breaking changes
  \*/
