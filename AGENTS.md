# AGENTS.md — Documentação Técnica Completa do Projeto Libras Dataset

> **Projeto**: Plataforma web para coleta de gravações de Libras (Língua Brasileira de Sinais) para dataset científico
> **Stack**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (PostgreSQL + Storage)
> **Design System**: Baseado no **Pinterest Design System** (cream `#fbfbf9`, card `#f6f6f3`, red `#e60023`, Inter/Pin Sans, radius 16px/32px/pill, masonry grid)
> **Deploy**: Vercel

---

## 1. Visão Geral do Projeto

### 1.1 Objetivo
Criar um site onde **intérpretes de Libras** possam:
1. Ver uma lista de frases em português com vídeo de referência (execução do sinal em Libras)
2. Gravar a si mesmos executando esses sinais usando a webcam
3. Enviar as gravações para compor um **dataset aberto** para pesquisa em:
   - Reconhecimento automático de sinais (Sign Language Recognition)
   - Tradução Libras ↔ Português
   - Acessibilidade digital

### 1.2 Requisitos Funcionais

| RF | Descrição | Implementado |
|----|-----------|--------------|
| RF01 | Listar frases de referência com vídeo player | ✅ `PhraseList` + `PhraseCard` |
| RF02 | Gravar vídeo via webcam (MediaRecorder API) | ✅ `/record/[id]` page |
| RF03 | Preview da gravação antes de enviar | ✅ Blob URL + `<video>` player |
| RF04 | Upload direto para storage (signed URL) | ✅ `/api/storage/sign-upload` |
| RF05 | Salvar metadados no banco (PostgreSQL) | ✅ `/api/recordings` POST |
| RF06 | Admin: CRUD de frases (texto, glosa, vídeo, ordem) | ✅ `/admin` page |
| RF07 | Consentimento LGPD (banner + localStorage) | ✅ `ConsentBanner` |
| RF08 | Política de privacidade completa | ✅ `/privacidade` page |
| RF09 | Design system Pinterest (cream, red CTA, masonry grid, 16px/32px radius) | ✅ Tailwind config + globals.css |

### 1.3 Requisitos Não-Funcionais

| RNF | Detalhe | Solução |
|-----|---------|---------|
| Performance | Upload sem passar pelo servidor | Signed URLs → browser → Supabase Storage |
| Segurança | RLS no Postgres, service role só no backend | Policies + API Routes com `createAdminClient()` |
| Privacidade | Zero dados pessoais, anonimização por UUID | Sem auth, UUIDs aleatórios, consentimento explícito |
| Escalabilidade | Serverless (Vercel) + Supabase managed | Auto-scale, pay-per-use |
| Acessibilidade | Semântico, ARIA, keyboard navigation, **mobile-first, surdos** | HTML5 semântico, focus-visible, labels, `prefers-contrast`, `prefers-reduced-motion`, controles de vídeo ampliados, touch targets 48px |
| Manutenibilidade | TypeScript strict, ESLint, componentes isolados | Strict mode, barrel exports, colocation |

---

## 2. Arquitetura Técnica

### 2.1 Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USUÁRIO (Navegador)                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Homepage  │───▶│ PhraseCard  │───▶│Record Studio│───▶│  Preview    │  │
│  │  (Lista)    │    │  (Player)   │    │(MediaRecorder)│   │  (Blob URL) │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘  │
└───────────────────────────────────────────────────────────────────│──────────┘
                                                                    │
                    ┌───────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS API ROUTES (Serverless)                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ /api/phrases     │  │ /api/recordings  │  │ /api/storage/sign-upload │  │
│  │ GET, POST        │  │ GET, POST        │  │ POST (signed URL)        │  │
│  │ PATCH, DELETE    │  │                  │  │                          │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────────┬─────────────┘  │
└───────────│─────────────────────│─────────────────────────│──────────────────┘
            │                     │                         │
            ▼                     ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE (Managed)                              │
│  ┌──────────────────────┐         ┌──────────────────────────────────────┐  │
│  │   PostgreSQL         │         │         Supabase Storage (S3)        │  │
│  │  • phrases (RLS)     │         │  • reference-videos (public)         │  │
│  │  • recordings (RLS)  │         │  • user-recordings (private)         │  │
│  │  • indexes, triggers │         │  • Signed PUT URLs                   │  │
│  └──────────────────────┘         └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Fluxo de Dados Detalhado

#### Cadastro de Frase (Admin)
```
Admin → /admin → Modal Form → POST /api/phrases
                                    │
                                    ▼
                          Supabase Admin Client (service_role)
                                    │
                                    ▼
                          INSERT INTO phrases (text_pt, text_gloss,
                          video_url, video_duration, order_index,
                          is_active)
                                    │
                                    ▼
                          Return phrase object → UI update
```

#### Gravação do Usuário (Público)
```
1. GET /api/phrases → Lista de frases ativas (RLS: is_active=true)
2. Usuário clica "Gravar" → /record/[id]
3. GET /api/phrases/[id] → Dados da frase + video_url
4. getUserMedia() → Stream da câmera
5. MediaRecorder.start() → Chunks webm (100ms)
6. Usuário para → MediaRecorder.stop() → Blob
7. Preview local: URL.createObjectURL(blob)
8. POST /api/storage/sign-upload {filename, contentType}
   → Supabase createSignedUploadUrl(path)
   → Return {signedUrl, publicUrl, path}
9. PUT signedUrl + blob → Supabase Storage (direto, CDN)
10. POST /api/recordings {phrase_id, video_url, duration, size, mime, ua, metadata}
    → INSERT INTO recordings (RLS: phrase must be active)
11. Success → UI "Concluído" + links para gravar outra/voltar
```

---

## 3. Estrutura de Arquivos Completa

```
libras-dataset/
├── .env.example                    # Template de variáveis de ambiente
├── .gitignore                      # Git ignore padrão Next.js
├── AGENTS.md                       # ESTE ARQUIVO
├── README.md                       # Documentação usuário final
├── next.config.js                  # Config Next.js (images, headers)
├── package.json                    # Dependências + scripts
├── postcss.config.js               # PostCSS + Tailwind + Autoprefixer
├── tailwind.config.js              # Design System Coinbase (cores, fonts, radius, spacing)
├── tsconfig.json                   # TypeScript strict + path aliases @/*
├── supabase/
│   └── schema.sql                  # Schema completo: tabelas, RLS, triggers, storage policies
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── phrases/
    │   │   │   ├── route.ts                    # GET (list), POST (create)
    │   │   │   └── [id]/route.ts               # GET, PATCH, DELETE single
    │   │   ├── recordings/route.ts             # GET (list), POST (create)
    │   │   └── storage/sign-upload/route.ts    # POST (generate signed URL)
    │   ├── admin/page.tsx                      # Admin panel (passcode protected)
    │   ├── privacidade/page.tsx                # Política LGPD
    │   ├── record/[id]/page.tsx                # Recording studio (client component)
    │   ├── globals.css                         # Tailwind layers + component classes
    │   ├── layout.tsx                          # Root layout + fonts (Inter, JetBrains Mono)
    │   └── page.tsx                            # Homepage pública
    ├── components/
    │   ├── ConsentBanner.tsx                   # Banner LGPD (localStorage versionado)
    │   ├── PhraseCard.tsx                      # Card: video player + info + CTA
    │   └── PhraseList.tsx                      # Grid responsivo + loading skeletons
    └── lib/
        └── supabase/
            ├── client.ts                       # Browser client (anon key)
            ├── server.ts                       # Server client (cookies, SSR)
            ├── admin.ts                        # Admin client (service role key)
            └── database.types.ts               # TypeScript interfaces
```

---

## 4. Detalhamento por Camada

### 4.1 Database Schema (supabase/schema.sql)

```sql
-- Tabela de frases de referência (gerenciada pelo admin)
CREATE TABLE phrases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text_pt TEXT NOT NULL,              -- "Bom dia, como vai você?"
  text_gloss TEXT,                    -- "BOM-DIA COMO VOCÊ" (glosa Libras)
  video_url TEXT NOT NULL,            -- URL do vídeo de referência
  video_duration INTEGER,             -- Duração em segundos
  order_index INTEGER DEFAULT 0,      -- Ordem de exibição
  is_active BOOLEAN DEFAULT true,     -- Visível ao público?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de gravações dos usuários (público envia)
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phrase_id UUID NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,            -- URL da gravação no Storage
  video_duration INTEGER,             -- Duração em segundos
  video_size_bytes BIGINT,            -- Tamanho em bytes
  mime_type TEXT,                     -- video/webm, video/mp4
  user_agent TEXT,                    -- Info do browser/device
  metadata JSONB DEFAULT '{}',        -- Extensível: {recordedAt, resolution, etc}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_phrases_active_order ON phrases(is_active, order_index);
CREATE INDEX idx_recordings_phrase ON recordings(phrase_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Políticas phrases: público lê só ativas
CREATE POLICY "public_read_active_phrases" ON phrases
  FOR SELECT USING (is_active = true);

-- Políticas recordings: público insere (se frase ativa) e lê tudo
CREATE POLICY "public_insert_recordings" ON recordings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM phrases WHERE phrases.id = recordings.phrase_id AND phrases.is_active = true)
  );
CREATE POLICY "public_read_recordings" ON recordings FOR SELECT USING (true);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER update_phrases_updated_at BEFORE UPDATE ON phrases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Storage Buckets** (criar via Dashboard ou SQL):
- `reference-videos` — **público** (vídeos de referência do admin)
- `user-recordings` — **privado** (gravações dos usuários, signed URLs)

**Storage Policies**:
```sql
-- reference-videos: leitura pública
CREATE POLICY "public_read_reference_videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'reference-videos');

-- user-recordings: leitura pública + insert via signed URL
CREATE POLICY "public_read_user_recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-recordings');
CREATE POLICY "signed_upload_user_recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-recordings');
```

---

### 4.2 Supabase Clients (src/lib/supabase/)

#### client.ts — Browser (Anon Key)
```typescript
'use client';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```
- Usado em **Client Components** (`'use client'`)
- Chave `anon` — respeita RLS policies
- Para: leitura pública de frases, realtime (se necessário)

#### server.ts — Server Components / Server Actions (Cookies)
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (...) } }
  );
}
```
- Usado em **Server Components** e **Server Actions**
- Gerencia cookies de sessão (para auth futuro)
- Mesma chave `anon`, RLS ativo

#### admin.ts — API Routes / Backend Only (Service Role)
```typescript
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```
- **NUNCA** importar em Client Components
- Só em: `src/app/api/**/route.ts`, Server Actions
- Chave `service_role` — **bypassa RLS**, acesso total
- Usado para: INSERT/UPDATE/DELETE admin, signed URLs, stats

#### database.types.ts — TypeScript Interfaces
```typescript
export interface Phrase {
  id: string;
  text_pt: string;
  text_gloss: string | null;
  video_url: string;
  video_duration: number | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recording {
  id: string;
  phrase_id: string;
  video_url: string;
  video_duration: number | null;
  video_size_bytes: number | null;
  mime_type: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
```
- Tipagem forte em todo o projeto
- Evita `any` em responses da API

---

### 4.3 API Routes (src/app/api/)

#### GET /api/phrases → Lista pública
```typescript
const { data, error } = await supabase
  .from('phrases')
  .select('*')
  .eq('is_active', true)
  .order('order_index', { ascending: true });
```
- Usa `createAdminClient()` (service role) — mas RLS filtra `is_active=true`
- Retorna: `{ phrases: Phrase[] }`

#### POST /api/phrases → Criar (Admin)
```typescript
const parsed = phraseSchema.safeParse(body); // Zod validation
const { data, error } = await supabase
  .from('phrases')
  .insert(parsed.data)
  .select()
  .single();
```
- Validação Zod: `text_pt` obrigatório, `video_url` URL válida
- Requer service role (bypassa RLS)

#### PATCH /api/phrases/[id] → Atualizar (Admin)
```typescript
const { data, error } = await supabase
  .from('phrases')
  .update(parsed.data)
  .eq('id', id)
  .select()
  .single();
```
- Partial update (campos opcionais via Zod `.optional()`)

#### DELETE /api/phrases/[id] → Excluir (Admin)
```typescript
const { error } = await supabase.from('phrases').delete().eq('id', id);
```
- CASCADE apaga recordings associadas (FK ON DELETE CASCADE)

#### GET /api/recordings → Lista (com filtro opcional)
```typescript
let query = supabase.from('recordings').select('*').order('created_at', { ascending: false });
if (phraseId) query = query.eq('phrase_id', phraseId);
```

#### POST /api/recordings → Criar (Público)
```typescript
// 1. Verifica se frase existe e está ativa
const { data: phrase } = await supabase
  .from('phrases').select('id').eq('id', phrase_id).eq('is_active', true).single();

// 2. Insere recording
const { data, error } = await supabase
  .from('recordings')
  .insert(parsed.data)
  .select()
  .single();
```
- RLS policy garante que `phrase_id` corresponde a frase ativa
- Validação Zod: `phrase_id` UUID, `video_url` URL, campos numéricos positivos

#### POST /api/storage/sign-upload → Signed URL
```typescript
// 1. Valida contentType (só video/*)
const allowedTypes = ['video/webm', 'video/mp4', 'video/quicktime', 'video/x-matroska'];

// 2. Gera path único
const path = `recordings/${crypto.randomUUID()}.${ext}`;

// 3. Cria signed URL (expira em 1h por padrão)
const { data, error } = await supabase.storage
  .from(bucket)
  .createSignedUploadUrl(path);

// 4. Retorna signedUrl + publicUrl + path
```
- **Crítico**: Upload direto browser → Storage (não passa pelo servidor Next.js)
- Economiza banda, escala automaticamente, CDN global

---

### 4.4 Frontend — Páginas Principais

#### Homepage (src/app/page.tsx)
- **Hero Band Dark**: Título, descrição, card com stats dinâmicos (fetch via client)
- **Seção Frases**: `<PhraseList />` — grid responsivo (1 col mobile, 2 tablet, 3-4 desktop)
- **Seção Como Funciona**: 4 passos com **ícones SVG acessíveis** (não emoji), textos em português simples
- **Footer**: Links, privacidade, contato
- **Linguagem simplificada**: "banco de dados" em vez de "dataset", "sinal" em vez de "interpretação"

#### PhraseList (src/components/PhraseList.tsx)
- Client Component (`'use client'`)
- `useEffect` → `fetch('/api/phrases')` → `setPhrases()`
- Loading: **Skeleton cards** (animate-pulse)
- Error: Botão "Tentar novamente" (reload)
- Empty state: Mensagem amigável
- Map → `<PhraseCard key={phrase.id} phrase={phrase} index={i+1} />`

#### PhraseCard (src/components/PhraseCard.tsx)
- `<video>` nativo com `controls`, `controlsList="nodownload nofullscreen noremoteplayback"`
- `preload="metadata"` — carrega duração sem baixar vídeo todo
- **Controles ampliados via CSS global** (`video::-webkit-media-controls-*` — touch 48px)
- Badge duração (MM:SS) no canto com `touch-target-min`
- **Glosa destacada**: card `bg-primary/5 border-primary/20` com label "Sinal em Libras:"
- Texto PT em `font-body` leading-relaxed
- **CTA mobile-first**: `w-full min-h-[56px] text-lg` + ícone play SVG
- `aria-label` descritivo no link

#### Recording Studio (src/app/record/[id]/page.tsx) — **Mais Complexo**
**Estado (useState):**
```typescript
stage: 'idle' | 'recording' | 'preview' | 'uploading' | 'done'
mediaRecorder: MediaRecorder | null
recordedChunks: BlobPart[]
recordingTime: number (segundos)
previewUrl: string | null (blob URL)
uploadProgress: number (0-100)
facingMode: 'user' | 'environment'  // Trocar câmera frontal/traseira
stream: MediaStream | null          // Referência para cleanup
```

**Fluxo de Gravação:**
1. **Idle**: Botão "Começar gravação" → `handleStartRecording()`
2. **Recording**:
   - `getUserMedia({video: {facingMode, width: {ideal: 1280}, height: {ideal: 720}}, audio: true})`
   - `new MediaRecorder(stream, {mimeType: 'video/webm;codecs=vp9,opus'})`
   - `ondataavailable` → push chunks no array (100ms)
   - `onstop` → `new Blob(chunks, {type: 'video/webm'})` → `URL.createObjectURL()` → preview
   - Timer `setInterval` + auto-stop em `phrase.video_duration + 5s`
   - **Layout mobile-first**: Referência (topo) + Câmera (baixo) — 1 coluna no mobile
   - **Indicador REC grande**: Vermelho, pulsante, com tempo formatado
   - **Barra de progresso visual grossa**: Verde→Amarelo→Vermelho (semantic colors)
   - **Botão trocar câmera** (topo-direita): Frontal ↔ Traseira
3. **Preview**:
   - Mantém stream ativo (para regravar rápido)
   - Mostra blob URL com controles nativos ampliados
   - Botões: "Gravar de novo" / "Enviar" — full-width mobile, min-height 56px
4. **Uploading**:
   - `fetch('/api/storage/sign-upload', ...)` → signed URL
   - `fetch(signedUrl, {method: 'PUT', body: blob})` → Storage direto
   - `fetch('/api/recordings', ...)` → metadados no Postgres
   - Progress bar grossa (0→50→100%)
5. **Done**: Sucesso → botões "Gravar outro" / "Escolher outra frase"

**Acessibilidade Mobile + Surdos:**
- `role="progressbar"` com `aria-valuenow/min/max` no stepper + barra visual
- Textos em **português simples**: "Começar gravação", "Parar", "Gravar de novo", "Enviar"
- **Touch targets ≥ 56px** (`min-h-[56px]`) em todos os botões
- Controles de vídeo nativos ampliados via CSS (`video::-webkit-media-controls-*`)
- `prefers-contrast: more` → alto contraste automático (CSS global)
- `prefers-reduced-motion: reduce` → animações desligadas
- `aria-label` descritivos em todos botões e vídeos
- Stepper com **números** (1,2,3,4,✓) não apenas símbolos
- Cleanup automático: `useEffect` unmount para streams + blob URLs

#### Admin Panel (src/app/admin/page.tsx)
- **Autenticação**: Passcode simples em `sessionStorage` (`admin-auth: true`)
- Passcode em `NEXT_PUBLIC_ADMIN_PASSCODE` (default: `libras2026`)
- **CRUD Completo**:
  - Tabela responsiva (horizontal scroll mobile)
  - Colunas: #, Texto PT, Glosa, Vídeo (thumb), Duração, Status, Ações
  - Ações: ↑↓ (reorder), Editar, Excluir
  - Modal único para Criar/Editar (form controlled)
  - Validação Zod-like client-side + server-side
  - Toast notifications (success/error, auto-dismiss 3s)
- **Reorder**: PATCH em duas frases trocando `order_index`
- **Stats Cards**: Total, Ativas, Tempo total referência

#### Privacy Page (src/app/privacidade/page.tsx)
- 8 seções LGPD: Dados coletados, Uso, Armazenamento, Anonimização, Direitos, Retenção, Consentimento, Contato/DPO
- Semântico: `<article>`, `<section>`, `<h2>`, `<ul>`, `<time>`
- Link de volta à homepage

#### ConsentBanner (src/components/ConsentBanner.tsx)
- `localStorage.getItem('libras-consent')` → `{accepted: boolean, timestamp, version}`
- Versionado (`version: '1.0'`) — permite forçar re-consentimento mudando versão
- **Mobile-first**: `fixed bottom-0` (bottom sheet nativo), overlay em mobile
- **Botões grandes**: `min-h-[56px]`, full-width, textos simples ("Entendi, pode gravar" / "Só olhar, não gravar")
- Ícone de check no header, foco automático no botão principal
- `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- Não bloqueia navegação, só gravação

---

### 4.5 Design System (tailwind.config.js + globals.css) — Pinterest

#### Cores (Pinterest Palette)
```javascript
colors: {
  primary: '#e60023',              // Pinterest Red - único CTA primário
  'primary-pressed': '#cc001f',    // Pressed state
  'on-primary': '#ffffff',

  ink: '#000000',                  // Headlines, botões, nav
  'ink-soft': '#211922',           // Inline links (única "cor" além do red)
  body: '#33332e',                 // Body copy padrão
  charcoal: '#262622',             // Body mais suave
  mute: '#62625b',                 // Metadata, footer
  ash: '#91918c',                  // Disabled text, placeholders
  stone: '#c8c8c1',                // Least emphasis

  canvas: '#ffffff',               // True white - nav, modais, feature cards
  'surface-soft': '#fbfbf9',       // Cream off-white - page wash
  'surface-card': '#f6f6f3',       // Warm cream - pin cards, chips, secondary bg
  'surface-elevated': '#ffffff',   // Elevated surfaces
  'secondary-bg': '#e5e5e0',       // Secondary button bg
  'secondary-pressed': '#c8c8c1',  // Secondary button pressed

  'surface-dark': '#262622',       // Dark CTA strip
  'on-dark': '#ffffff',
  'on-dark-mute': 'rgba(255,255,255,0.7)',

  hairline: '#dadad3',             // 1px dividers
  'hairline-soft': '#e5e5e0',      // Lighter divider = secondary-bg

  // Semantic
  success: '#103c25',
  'success-pale': '#c7f0da',
  error: '#9e0a0a',
  'error-deep': '#cc001f',
  'focus-outer': '#435ee5',        // Focus ring blue
  'focus-inner': '#ffffff',        // Focus ring inner gap

  // Accent (sparingly in content)
  'accent-blue': '#617bff',
  'accent-purple': '#7e238b',
  'accent-purple-deep': '#6845ab',
}
```

#### Tipografia (Pin Sans → Inter substitute)
```javascript
fontFamily: {
  sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
}

fontSize: {
  'display-xl': ['70px', { lineHeight: '1.1', letterSpacing: '-1.2px', fontWeight: '600' }],
  'display-lg': ['44px', { lineHeight: '1.15', letterSpacing: '-0.8px', fontWeight: '700' }],
  'heading-xl': ['28px', { lineHeight: '1.2', letterSpacing: '-1.2px', fontWeight: '700' }],
  'heading-lg': ['22px', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '600' }],
  'heading-md': ['18px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
  'body-md': ['16px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
  'body-strong': ['16px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
  'body-sm': ['14px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
  'body-sm-strong': ['14px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '700' }],
  'caption-md': ['12px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
  'caption-sm': ['12px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
  'link-md': ['16px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
  'button-md': ['14px', { lineHeight: '1', letterSpacing: '0', fontWeight: '700' }],
  'button-sm': ['12px', { lineHeight: '1', letterSpacing: '0', fontWeight: '700' }],
}
```
- `next/font/google` em `layout.tsx`: `Inter` (variable: `--font-inter`) — Pin Sans substitute
- Aplica `-1.2px` tracking em `display-xl` e `heading-xl` (brand voice)
- Hierarquia via weight (400→600→700) e size, não cor

#### Border Radius Scale (3 valores apenas)
```javascript
borderRadius: {
  none: '0px',        // Footer, nav, structural
  sm: '8px',          // Rare medium
  md: '16px',         // DOMINANTE: buttons, inputs, pin cards, feature cards
  lg: '32px',         // Large pins, modals
  full: '9999px',     // Search bar, chips, avatars, circular buttons
}
```

#### Spacing (8px base)
```javascript
spacing: {
  xxs: '4px',
  xs: '6px',
  sm: '8px',          // Pin grid gutters
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',        // Modal/card padding
  section: '64px',    // Vertical rhythm entre sections
}
```

#### Component Classes (globals.css @layer components)
```css
/* Buttons - Pinterest style */
.btn-primary       /* Red #e60023, 16px radius, 40px height, 14px/700 */
.btn-secondary     /* Gray-cream #e5e5e0, 16px radius, 40px height */
.btn-tertiary      /* Ghost, 16px radius */
.btn-icon-circular /* 40px, full radius, surface-card bg */
.btn-pill-on-image /* Pill on photography, canvas bg */
.btn-disabled      /* surface-card, ash text */

/* Inputs */
.input             /* 44px, 16px radius, double-ring focus (ink + focus-outer) */
.search-bar        /* 48px, pill radius, surface-card → canvas on focus */

/* Cards - pin-first */
.pin-card          /* 16px radius, NO padding, image IS the card */
.pin-card-large    /* 32px radius for feature pins */
.category-tile     /* 16px radius, 16px padding */
.feature-card      /* 16px radius, 32px padding, canvas bg */
.feature-card-soft /* surface-card bg variant */
.modal-card        /* 32px radius, 32px padding, canvas, modal shadow */
.hero-cta-strip    /* Dark strip, no radius, surface-dark */

.pin-overlay-pill  /* Pill on imagery, canvas bg, button-sm */
.filter-chip       /* Pill, surface-card, flips to ink on active */

/* Navigation & Footer */
.primary-nav       /* 64px, canvas, hairline bottom border */
.footer-section    /* canvas, mute text, hairline top */

/* Layout */
.section           /* py-section (64px) + responsive px */
.container-max     /* max-w-[1280px] */
.masonry-grid      /* auto-fill minmax(280px,1fr), gap-sm (8px) */
.progress-bar-thick /* h-3 rounded-full, thick visual timer */
.touch-target-min  /* min-w-[48px] min-h-[48px] WCAG AAA */
```

#### Acessibilidade Global (globals.css @layer base)
```css
/* Alto contraste automático */
@media (prefers-contrast: more) {
  :root { --primary: #cc001f; --ink: #000; --hairline: #000; --surface-card: #e5e5e0; }
  .btn-primary, .btn-secondary, .pin-card, .input, .search-bar { @apply border-2 border-ink; }
}

/* Reduzir movimento */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Controles de vídeo nativos ampliados */
video::-webkit-media-controls-panel { @apply bg-ink/95 backdrop-blur-sm; }
video::-webkit-media-controls-play-button,
video::-webkit-media-controls-mute-button,
video::-webkit-media-controls-fullscreen-button,
video::-webkit-media-controls-pip-button { @apply p-3 rounded-lg min-w-[48px] min-h-[48px]; }
video::-webkit-media-controls-timeline { @apply h-3 rounded-full cursor-pointer; }
video::-webkit-media-controls-volume-slider { @apply h-3 rounded-full cursor-pointer w-24; }
```

---

## 5. Configuração e Deploy

### 5.1 Variáveis de Ambiente (.env.local)
```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin (mude em produção!)
NEXT_PUBLIC_ADMIN_PASSCODE=seu-codigo-seguro-aqui

# Opcionais
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 5.2 Setup Supabase (Checklist)

1. **Criar projeto** em https://supabase.com
2. **SQL Editor** → Executar `supabase/schema.sql` completo
3. **Storage** → Criar buckets:
   - `reference-videos` → Public bucket ✓
   - `user-recordings` → Private bucket ✓
4. **Storage Policies** → Adicionar policies (ver schema.sql comentários)
5. **Settings > API** → Copiar:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`
6. **Authentication** → Desabilitar "Enable email confirmations" (não usado)
7. **Database** → Verificar se RLS habilitado nas tabelas

### 5.3 Deploy Vercel

1. **Push para GitHub** (repo público ou privado)
2. **Vercel Dashboard** → "Add New Project" → Import Git Repository
3. **Environment Variables** → Adicionar todas do `.env.local`
4. **Deploy** → Automático
5. **Domínio customizado** (opcional) → Settings > Domains

**Vercel Config** (next.config.js já inclui):
```javascript
images: {
  remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
},
headers: [
  { source: '/:path*', headers: [
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
  ]}
]
```

### 5.4 Scripts Disponíveis
```json
"scripts": {
  "dev": "next dev",           // http://localhost:3000
  "build": "next build",       // Produção (.next/)
  "start": "next start",       // Servidor produção
  "lint": "next lint"          // ESLint
}
```

---

## 6. Segurança e Boas Práticas Implementadas

### 6.1 Row Level Security (RLS)
- **phrases**: Público só lê `is_active=true`; Admin (service role) faz tudo
- **recordings**: Público insere só se frase ativa; Lê tudo (dataset público)
- **storage.objects**: Policies por bucket (público/privado)

### 6.2 Chaves de API
| Chave | Onde Usa | Permissão |
|-------|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser (client.ts), Server Components (server.ts) | Respeita RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **Apenas** API Routes (admin.ts), Server Actions | **Bypassa RLS** — Nunca no browser |

### 6.3 Validação
- **Zod** em todas as API Routes (request body)
- **Client-side** validação espelhada no Admin modal
- **Content-Type** restrito no upload (só `video/*`)

### 6.4 Upload Direto (Signed URLs)
- Browser → Supabase Storage (PUT signed URL)
- **Zero banda** no servidor Next.js
- Expiração padrão 1h (configurável)
- Arquivo renomeado para UUID + extensão original

### 6.5 LGPD / Privacidade
- **Zero dados pessoais** coletados
- **UUID aleatório** por gravação (sem link com usuário)
- **Consentimento explícito** versionado (localStorage)
- **Direito à exclusão** via contato (email no privacy policy)
- **Anonimização** no dataset final (só vídeo + glosa)

### 6.6 Headers de Segurança
```javascript
// next.config.js
headers: [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Adicionar em produção:
  // { key: 'Content-Security-Policy', value: "..." },
  // { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

---

## 7. Testes e Qualidade

### 7.1 Checklist Manual (Pré-Deploy)

**Funcionalidades Core:**
- [ ] Homepage carrega frases do Supabase
- [ ] Vídeos de referência tocam (controles nativos ampliados)
- [ ] Clique "Gravar" → `/record/[id]` carrega frase correta
- [ ] Permissão câmera/microfone solicitada
- [ ] Gravação inicia (badge REC grande + timer + barra progresso)
- [ ] **Botão trocar câmera** (frontal ↔ traseira) funciona
- [ ] Auto-stop no tempo limite
- [ ] Preview toca gravação local
- [ ] "Gravar de novo" limpa e volta ao idle
- [ ] "Enviar" → progress bar → success → botões finais
- [ ] Admin `/admin` → passcode funciona
- [ ] Admin CRUD: Criar, Editar, Excluir, Reordenar
- [ ] Modal validação (campos obrigatórios, URL válida)
- [ ] Toast notifications aparecem
- [ ] Consent banner aparece na primeira visita (bottom sheet mobile)
- [ ] Privacy page acessível via footer

**Mobile + Acessibilidade (Surdos):**
- [ ] Responsivo: mobile (375px), tablet (768px), desktop (1440px)
- [ ] **Touch targets ≥ 48px** em todos botões/links (WCAG AAA)
- [ ] **Botões CTA ≥ 56px** altura (`min-h-[56px]`)
- [ ] **Controles de vídeo nativos ampliados** (play, mute, fullscreen, timeline)
- [ ] **Barra de progresso visual grossa** durante gravação (verde→amarelo→vermelho)
- [ ] **Textos em português simples** ("Começar gravação", "Parar", "Gravar de novo", "Enviar")
- [ ] **Alto contraste automático**: DevTools → Rendering → "Emulate CSS prefers-contrast: more"
- [ ] **Reduzir movimento**: DevTools → Rendering → "Emulate prefers-reduced-motion: reduce"
- [ ] **Stepper com números** (1,2,3,4,✓) não apenas símbolos
- [ ] **aria-label** descritivos em vídeos e botões
- [ ] Dark hero band renderiza corretamente
- [ ] Fontes Inter + JetBrains Mono carregam

### 7.2 Linting e Type Check
```bash
npm run lint      # ESLint (next/core-web-vitals + typescript-eslint)
npx tsc --noEmit  # TypeScript strict check
```

### 7.3 Build de Produção
```bash
npm run build
# Verificar:
# - Nenhum erro de tipo
# - Tamanho de bundles razoável
# - Static pages geradas onde possível
# - API routes funcionando
```

---

## 8. Extensões Futuras (Roadmap)

| Feature | Esforço | Descrição |
|---------|---------|-----------|
| **Auth real** | Médio | Supabase Auth (email/magic link) para admin + usuários recorrentes |
| **Dashboard analytics** | Médio | Gráficos de gravações/dia, por frase, tempo total (Chart.js) |
| **Export dataset** | Baixo | Botão admin → gera CSV/JSONL + ZIP dos vídeos (signed URLs batch) |
| **Transcrição/Anotação** | Alto | Interface para pesquisadores anotarem glossas, timestamps, qualidade |
| **Moderação** | Médio | Fila de revisão (aprovar/rejeitar gravações) antes de ir pro dataset |
| **PWA** | Baixo | Service worker + manifest → instalável, offline-first para gravação |
| **i18n** | Baixo | EN/ES/PT — next-intl ou routing manual |
| **Rate limiting** | Baixo | Middleware Next.js + Upstash Redis (10 uploads/hora/IP) |
| **Webhooks** | Baixo | Supabase Database Webhooks → notificar Slack/Discord nova gravação |
| **Video thumbnails** | Médio | Supabase Edge Function + FFmpeg.wasm → gerar poster frame no upload |
| **Instruções em Libras (vídeo)** | Alto | Gravar vídeos curtos de instrução em Libras para cada tela |
| **Player customizado** | Médio | Speed, loop, PiP button, keyboard shortcuts além dos nativos |

---

## 9. Troubleshooting Comum

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| `createBrowserClient` erro hydration | Import fora de `'use client'` | Mover para Client Component ou usar `server.ts` |
| RLS bloqueia INSERT público | Policy `public_insert_recordings` faltando | Executar schema.sql policies |
| Upload falha 403 | Bucket `user-recordings` sem policy INSERT | Adicionar `signed_upload_user_recordings` policy |
| Vídeo não toca no card | `preload="metadata"` + CORS | Verificar bucket `reference-videos` público + CORS no Supabase |
| Admin passcode não funciona | `NEXT_PUBLIC_ADMIN_PASSCODE` não setado | Adicionar no `.env.local` e Vercel |
| `service_role` key vazada no bundle | Import `admin.ts` em Client Component | **Nunca** importar `admin.ts` fora de `src/app/api/**` |
| Timer não para | `recordingIntervalRef` não limpo | `clearInterval` no `handleStopRecording` + `useEffect` cleanup |
| Blob URL memory leak | `URL.revokeObjectURL()` não chamado | Chamar em `handleRetry`, `handleUpload` success, unmount |

---

## 10. Referências e Créditos

### Documentações Oficiais
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Supabase JavaScript Client v2](https://supabase.com/docs/reference/javascript)
- [Supabase Storage Signed URLs](https://supabase.com/docs/guides/storage/uploads/upload-files#upload-files-with-signed-urls)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MediaRecorder API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder_API)
- [Row Level Security (PostgreSQL)](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### Design System Reference
- [Pinterest Design System (este arquivo DESIGN2.md)](./DESIGN2.md) — Cores, tipografia, spacing, componentes, princípios, masonry grid, radius system

### Licenças de Fontes (via next/font/google)
- **Inter** — SIL Open Font License 1.1
- **JetBrains Mono** — SIL Open Font License 1.1

---

## 11. Contato e Manutenção

**Projeto**: Mestrado em Computação Aplicada — Dataset de Libras
**Responsável Técnico**: [Seu Nome]
**Email**: contato@exemplo.com
**Repositório**: GitHub (privado/público)
**Deploy**: Vercel (preview + production)

### Versionamento
- `main` → Produção (Vercel auto-deploy)
- `develop` → Preview (Vercel preview deployments)
- Feature branches → PR → Preview → Merge

### Backup e Recuperação
- **Database**: Supabase Point-in-Time Recovery (PITR) — 7 dias grátis
- **Storage**: Versionamento de objetos habilitado no bucket
- **Código**: Git history completo

---

> **Última atualização**: 19 de novembro de 2026 — Versão 1.2 (Pinterest Design System)
> **Principais melhorias v1.2**: Refatoração completa para Pinterest Design System — paleta cream/red, masonry grid pin cards, radius 16px/32px/pill, tipografia Pin Sans/Inter (70px display), double-ring focus, feature cards alternados, CTA strip dark, hero 70px headline, search bar pill, filter chips, modal 32px radius, componentes button/input/card Pinterest-style
> **Próxima revisão planejada**: Após validação com usuários pilotos (intérpretes de Libras)