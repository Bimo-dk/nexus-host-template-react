/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REGISTRY_URL?: string;
  readonly VITE_NEXUS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
