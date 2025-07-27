# WhatsApp Bot para Condomínios (com XState)

Este é um bot do WhatsApp para gerenciamento de ocorrências em condomínios, implementado seguindo as especificações detalhadas no documento `docs/whatsapp-bot-spec.md`. A versão atual utiliza **XState** para gerenciamento robusto de estados e transições.

## Funcionalidades Implementadas

### ✅ Fluxos Principais
- **Aceite de Termos**: Primeiro uso com aceite de termos e política de privacidade
- **Cadastro de Usuários**: 
  - Confirmação de pré-cadastro (usuários já inseridos pelo síndico)
  - Solicitação de novo cadastro (usuários desconhecidos)
- **Menu Principal**: Navegação entre registro e consulta de ocorrências
- **Registro de Ocorrências**: Coleta de descrição e mídia (fotos)
- **Consulta de Ocorrências**: Visualização de ocorrências do usuário
- **Notificações Proativas**: Updates de status e solicitação de feedback
- **Sistema de Feedback**: Avaliação pós-resolução

### ✅ Gerenciamento de Estado com XState
- **State Machines por usuário**: Cada usuário tem sua própria máquina de estados
- **Transições declarativas**: Estados e transições definidos de forma clara
- **Context management**: Dados da conversa armazenados no contexto da máquina
- **Cleanup automático**: Máquinas em estados finais são limpas automaticamente
- **Type safety**: Eventos tipados e validação de transições

### ✅ APIs para Integração
- `POST /api/user/approve` - Aprovar cadastro de usuário
- `POST /api/user/reject` - Rejeitar cadastro de usuário  
- `POST /api/occurrence/update` - Atualizar status de ocorrência
- `GET /api/users` - Listar usuários (para testes)
- `GET /api/occurrences` - Listar ocorrências (para testes)
- `GET /api/conversations` - Listar máquinas de estado ativas (para testes)

## Configuração

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:
```
VERIFY_TOKEN=seu_token_de_verificacao
ACCESS_TOKEN=seu_token_de_acesso_whatsapp
PHONE_NUMBER_ID=seu_id_do_numero_telefone
WABA_API_VERSION=v18.0
PORT=3000
```

3. Instale as dependências:
```bash
npm install
```

4. Execute o servidor:
```bash
npm start
```

## Arquitetura XState

### Estados da Máquina
```javascript
const conversationMachine = createMachine({
    id: 'whatsappBot',
    initial: 'checkingTerms',
    states: {
        checkingTerms: { /* Verificação inicial */ },
        waitingTermsAcceptance: { /* Aguardando aceite de termos */ },
        termsRejected: { /* Estado final - termos rejeitados */ },
        checkingUserStatus: { /* Verificação de status do usuário */ },
        waitingName: { /* Coletando nome */ },
        waitingEmail: { /* Coletando email */ },
        waitingBlock: { /* Coletando bloco */ },
        waitingUnit: { /* Coletando unidade */ },
        waitingDataConfirmation: { /* Confirmação de dados */ },
        registrationPending: { /* Aguardando aprovação */ },
        registrationRejected: { /* Registro rejeitado */ },
        mainMenu: { /* Menu principal */ },
        waitingOccurrenceDescription: { /* Coletando descrição */ },
        waitingOccurrenceMedia: { /* Coletando mídia */ },
        viewingOccurrences: { /* Visualizando ocorrências */ },
        waitingFeedback: { /* Aguardando feedback */ },
        waitingFeedbackComment: { /* Aguardando comentário */ }
    }
});
```

### Eventos Suportados
- `TERMS_NEEDED` - Mostrar termos de uso
- `ACCEPT_TERMS` - Aceitar termos
- `REJECT_TERMS` - Rejeitar termos
- `PRE_REGISTERED` - Usuário pré-cadastrado
- `NEW_USER` - Novo usuário
- `APPROVED` - Usuário aprovado
- `PROVIDE_NAME` - Fornecer nome
- `PROVIDE_EMAIL` - Fornecer email
- `PROVIDE_BLOCK` - Fornecer bloco
- `PROVIDE_UNIT` - Fornecer unidade
- `CONFIRM_DATA` - Confirmar dados
- `START_OCCURRENCE` - Iniciar ocorrência
- `PROVIDE_DESCRIPTION` - Fornecer descrição
- `PROVIDE_MEDIA` - Fornecer mídia
- `VIEW_OCCURRENCES` - Ver ocorrências
- `PROVIDE_FEEDBACK` - Fornecer feedback

### Context (Dados da Conversa)
```javascript
context: {
    phone: null,
    userData: {
        name: '',
        email: '',
        block: '',
        unit: ''
    },
    occurrenceData: {
        description: '',
        mediaUrl: null
    },
    feedbackData: {
        rating: '',
        comment: ''
    }
}
```

## Vantagens do XState

### 🎯 **Previsibilidade**
- Estados e transições bem definidos
- Impossível chegar a estados inválidos
- Comportamento determinístico

### 🔧 **Manutenibilidade** 
- Lógica de estado centralizada
- Fácil visualização do fluxo
- Mudanças controladas

### 🐛 **Debugging**
- Histórico de transições
- Inspeção de estado atual
- Logs estruturados

### 🧪 **Testabilidade**
- Estados isolados e testáveis
- Transições unitárias
- Mocks de contexto

## Funções Principais

### Gerenciamento de Máquinas
```javascript
// Criar ou obter máquina para usuário
getOrCreateStateMachine(phone)

// Obter estado atual
getCurrentState(phone)

// Enviar evento
sendEvent(phone, 'EVENT_NAME', data)

// Limpar máquina
clearStateMachine(phone)

// Obter dados do contexto
getContextData(phone)
```

## Exemplos de Uso

### Aprovar Usuário
```bash
curl -X POST http://localhost:3000/api/user/approve \
  -H "Content-Type: application/json" \
  -d '{"phone": "5511999999999"}'
```

### Ver Estado das Conversas
```bash
curl http://localhost:3000/api/conversations
```

Resposta:
```json
[
  {
    "phone": "5511999999999",
    "currentState": "mainMenu",
    "context": {
      "phone": "5511999999999",
      "userData": {
        "name": "João Silva",
        "email": "joao@email.com",
        "block": "A",
        "unit": "101"
      },
      "occurrenceData": {},
      "feedbackData": {}
    },
    "done": false
  }
]
```

## Fluxograma de Estados

```
checkingTerms → waitingTermsAcceptance → checkingUserStatus
                     ↓                         ↓
                termsRejected              [Multiple paths]
                     ↓                         ↓
                   [END]                   mainMenu ←→ waitingOccurrence*
                                             ↓
                                       waitingFeedback
                                             ↓
                                       waitingFeedbackComment
```

## Próximos Passos

Para produção, considere implementar:

1. **Persistência de Estado**: Salvar estado das máquinas em banco de dados
2. **Timeouts**: Implementar timeouts automáticos para transições
3. **Métricas**: Coletar métricas de estados e transições
4. **Visualização**: Interface para visualizar fluxos de estado
5. **Guards**: Adicionar guards para validação de transições
6. **Activities**: Implementar atividades para ações contínuas
7. **History States**: Permitir retorno a estados anteriores
8. **Parallel States**: Estados paralelos para funcionalidades simultâneas

## Dependências

- **xstate**: Biblioteca para máquinas de estado
- **express**: Framework web
- **axios**: Cliente HTTP
- **dotenv**: Gerenciamento de variáveis de ambiente

## Debugging XState

Para debug visual das máquinas de estado, você pode usar:
- [XState Visualizer](https://stately.ai/viz)
- [XState Inspector](https://github.com/statelyai/inspect)

## Conformidade LGPD

O bot implementa:
- Aceite explícito de termos e política de privacidade
- Registro de data/hora do aceite
- Versioning de termos
- Estados seguros para dados pessoais
- Limpeza automática de máquinas finalizadas