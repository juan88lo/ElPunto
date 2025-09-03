# Testing Suite - ElpuntoUI

Este proyecto utiliza **Vitest** como framework de testing principal, junto con **React Testing Library** para testing de componentes React.

## 🚀 Scripts Disponibles

```bash
# Ejecutar tests en modo watch (recomendado para desarrollo)
npm run test

# Ejecutar todos los tests una sola vez
npm run test:run

# Ejecutar tests con interfaz gráfica
npm run test:ui

# Ejecutar tests en modo watch explícito
npm run test:watch

# Ejecutar tests con reporte de coverage
npm run test:coverage
```

## 📁 Estructura de Tests

```
tests/
├── setup.ts                 # Configuración global de tests
├── components/              # Tests de componentes React
├── services/               # Tests de servicios y lógica de negocio
├── graphql/                # Tests de queries y mutations de GraphQL
├── pages/                  # Tests de páginas completas
├── utils/                  # Utilidades para testing
│   └── test-utils.tsx      # Custom render con providers
└── mocks/                  # Mocks reutilizables
    └── apolloMocks.ts      # Mocks para Apollo Client
```

## 🛠️ Herramientas Utilizadas

- **Vitest**: Framework de testing rápido y moderno
- **React Testing Library**: Testing de componentes React
- **@testing-library/jest-dom**: Matchers adicionales para DOM
- **@testing-library/user-event**: Simulación de eventos de usuario
- **jsdom**: Entorno DOM para Node.js
- **@apollo/client**: Mocking de GraphQL queries/mutations

## 📋 Patrones de Testing

### Testing de Componentes

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'

describe('MiComponente', () => {
  it('debería renderizar correctamente', () => {
    render(<MiComponente />)
    expect(screen.getByText('Texto esperado')).toBeInTheDocument()
  })
})
```

### Testing de Servicios

```typescript
import { describe, it, expect } from 'vitest'
import { miServicio } from '../../src/services/miServicio'

describe('MiServicio', () => {
  it('debería retornar datos válidos', async () => {
    const result = await miServicio.getData()
    expect(result).toBeDefined()
  })
})
```

### Testing de GraphQL

```typescript
import { describe, it, expect } from 'vitest'
import { print } from 'graphql'
import { MI_QUERY } from '../../src/graphql/queries/miQuery'

describe('Mi Query', () => {
  it('debería tener la estructura correcta', () => {
    const queryString = print(MI_QUERY)
    expect(queryString).toContain('query MiQuery')
  })
})
```

## 🎯 Mejores Prácticas

1. **Nombres descriptivos**: Usa descripciones claras de lo que se está testando
2. **Arrange-Act-Assert**: Organiza tests en preparación, acción y verificación
3. **Tests aislados**: Cada test debe ser independiente de otros
4. **Mocks selectivos**: Solo mockea lo necesario para el test
5. **Coverage útil**: Apunta a coverage alto pero enfócate en casos de uso reales

## 🔧 Configuración

La configuración principal está en:
- `vitest.config.ts`: Configuración de Vitest
- `tests/setup.ts`: Setup global para todos los tests
- `tests/utils/test-utils.tsx`: Utilidades custom para rendering

## 📊 Coverage

Los reportes de coverage se generan en:
- `coverage/`: Reportes HTML y JSON
- Console: Reporte resumido en terminal

Ejecuta `npm run test:coverage` para generar reportes completos.

## 🚫 Exclusiones de Coverage

Por defecto se excluyen:
- `node_modules/`
- `tests/`
- `**/*.d.ts`
- `**/*.config.*`
- `dist/`
- `coverage/`

## 🆘 Troubleshooting

### Error: "Cannot find module"
- Verifica que los paths relativos sean correctos
- Asegúrate de que el archivo existe

### Tests fallan en CI/CD
- Revisa que jsdom esté configurado correctamente
- Verifica mocks de APIs del navegador

### Tests muy lentos
- Usa `test.concurrent` para tests independientes
- Revisa que no haya imports innecesarios
