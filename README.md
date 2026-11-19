# Libras Dataset — Plataforma de Gravação de Sinais

Site para intérpretes de Libras gravarem vídeos de frases de referência, construindo um dataset aberto para pesquisa científica em reconhecimento de sinais e tradução automática.

## 🎯 Funcionalidades

- **Público**: Lista de frases com vídeo de referência → Gravação via webcam (MediaRecorder API) → Preview → Upload direto para Supabase Storage
- **Admin** (`/admin`): CRUD de frases de referência (texto PT, glosa, URL do vídeo, ordem, status) com código de acesso
- **Design System**: Baseado no Coinbase (branco, azul primário, Inter, cards elevados, pilulas)
- **Privacidade**: LGPD-compliant, zero dados pessoais, anonimização por UUID, consentimento explícito

## 🛠 Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS (design system Coinbase) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage (S3-compatível) |
| Video Recording | MediaRecorder API (nativo) |
| Deploy | Vercel |

## 🚀 Setup Rápido

### 1. Clonar e instalar

```bash
cd libras-dataset
npm install
```

### 2. Configurar Supabase

1. Crie projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute o conteúdo de `supabase/schema.sql`
3. No **Storage**, crie dois buckets:
   - `reference-videos` (público)
   - `user-recordings` (privado)
4. Em **Settings > API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Variáveis de ambiente

```bash
cp .env.example .env.local
# Edite .env.local com suas chaves do Supabase
```

### 4. Rodar localmente

```bash
npm run dev
# Abre em http://localhost:3000
```

### 5. Acessar admin

- Vá em `http://localhost:3000/admin`
- Código padrão: `libras2026` (mude em `NEXT_PUBLIC_ADMIN_PASSCODE`)

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── phrases/           # CRUD frases (GET, POST, PATCH, DELETE)
│   │   ├── recordings/        # CRUD gravações (GET, POST)
│   │   └── storage/sign-upload/  # Gera signed URL para upload direto
│   ├── record/[id]/           # Página de gravação (MediaRecorder)
│   ├── admin/                 # Painel admin (passcode)
│   ├── privacidade/           # Política de privacidade
│   ├── globals.css            # Tailwind + design system Coinbase
│   ├── layout.tsx             # Root layout + fontes
│   └── page.tsx               # Homepage pública
├── components/
│   ├── PhraseList.tsx         # Grid de frases
│   ├── PhraseCard.tsx         # Card individual com player
│   └── ConsentBanner.tsx      # Banner LGPD (localStorage)
├── lib/
│   └── supabase/
│       ├── client.ts          # Cliente browser (anon key)
│       ├── server.ts          # Cliente server (cookies)
│       ├── admin.ts           # Cliente admin (service role)
│       └── database.types.ts  # Types TypeScript
supabase/
└── schema.sql                 # Schema completo (tabelas, RLS, triggers)
```

## 🔐 Segurança

- **RLS (Row Level Security)**: Políticas no Postgres controlam acesso
- **Service Role Key**: Só no backend (API Routes), nunca no browser
- **Upload Direto**: Browser → Supabase Storage via signed URL (sem passar pelo seu servidor)
- **Validação**: Zod em todas as API Routes
- **Rate Limiting**: Implementar no middleware (Next.js) ou Supabase se necessário

## 📊 Fluxo de Dados

```
Admin cadastra frase
       ↓
Público vê lista → Clica "Gravar"
       ↓
Página /record/[id]:
  1. Carrega vídeo de referência
  2. Solicita câmera (getUserMedia)
  3. MediaRecorder → chunks webm
  4. Preview local (blob URL)
  5. POST /api/storage/sign-upload → signed URL
  6. PUT direto no Supabase Storage
  7. POST /api/recordings → salva metadados no Postgres
       ↓
Dataset pronto para exportação
```

## 🌐 Deploy na Vercel

1. Conecte repo GitHub na Vercel
2. Adicione Environment Variables (mesmas do `.env.local`)
3. Deploy automático a cada push

## 📝 Scripts Úteis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # ESLint
```

## 📄 Licença

Projeto acadêmico — Mestrado em Computação Aplicada.
Dataset final será publicado sob licença aberta (CC BY 4.0 ou similar).

---

**Dúvidas?** Consulte a documentação do [Next.js](https://nextjs.org/docs), [Supabase](https://supabase.com/docs) e [Tailwind CSS](https://tailwindcss.com/docs).