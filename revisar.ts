#!/usr/bin/env ts-node

import * as fs from "fs";
import * as path from "path";

type Problema = {
    arquivo: string;
    itens: string[];
};

const EXTENSOES_VALIDAS = [".ts", ".tsx", ".js", ".jsx"];

const REGRAS: { nome: string; regex: RegExp }[] = [
    { nome: "atribuição_em_if", regex: /if\s*\(.*=.*\)/ },
    { nome: "try_catch_vazio", regex: /try\s*{[\s\S]*?}\s*catch\s*\([^)]*\)\s*{[\s]*}/ },
    { nome: "await_faltando", regex: /async\s+function|async\s*\(.*\)\s*=>|Promise\.then/ },
    { nome: "console_log", regex: /console\.log|console\.debug/ },
    { nome: "todo_fixme", regex: /TODO|FIXME/ },
    { nome: "any_excessivo", regex: /\bany\b/ },
    { nome: "null_undefined_risco", regex: /!\.|as\s+\w+/ }
];

function analisarArquivo(caminho: string): string[] {
    const problemas: string[] = [];

    try {
        const conteudo = fs.readFileSync(caminho, "utf8");

        for (const regra of REGRAS) {
            if (regra.regex.test(conteudo)) {
                problemas.push(regra.nome);
            }
        }
    } catch (e) {
        problemas.push("erro_ao_ler_arquivo");
    }

    return problemas;
}

function revisarDiretorio(dir: string, resultados: Problema[]) {
    const itens = fs.readdirSync(dir);

    for (const item of itens) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            revisarDiretorio(fullPath, resultados);
        } else if (EXTENSOES_VALIDAS.includes(path.extname(item))) {
            const problemas = analisarArquivo(fullPath);
            if (problemas.length > 0) {
                resultados.push({ arquivo: fullPath, itens: problemas });
            }
        }
    }
}

function main() {
    const alvo = process.argv[2];

    if (!alvo) {
        console.error("Uso: ts-node revisar.ts <diretorio>");
        process.exit(1);
    }

    const resultados: Problema[] = [];
    revisarDiretorio(alvo, resultados);

    if (resultados.length === 0) {
        console.log("✔ Nenhum problema óbvio encontrado. Bug provavelmente é lógico ou de integração.");
        return;
    }

    console.log("\n❌ PROBLEMAS ENCONTRADOS:\n");

    for (const r of resultados) {
        console.log(`- ${r.arquivo}`);
        for (const item of r.itens) {
            console.log(`   • ${item}`);
        }
        console.log();
    }

    console.log("Revisão finalizada. Corrija isso antes de tentar debugar comportamento.");
}

main();
