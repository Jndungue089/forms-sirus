// A app corre como um SPA puramente estático (deploy na Vercel sem backend próprio).
// Os dados vivem numa base SQLite local ao browser (ver ./localDb.ts) — serve para
// demonstração/apresentação, não é partilhada entre visitantes. Esta camada mantém a
// mesma forma que uma API HTTP teria, para o resto da app não precisar de saber a
// diferença. Para um ambiente multi-utilizador real, o backend Express + Postgres em
// /server continua disponível e pode voltar a ser ligado aqui.

import { localApi } from "./localDb";

export const api = localApi;
