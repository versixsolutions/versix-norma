#!/usr/bin/env python3
"""
Validação de Sincronização de Tipos
====================================
Este script valida que todos os tipos customizados estão sincronizados com database.types.ts

Uso: python3 scripts/validate-type-sync.py
Retorna: 0 (sucesso) ou 1 (erro encontrado)
"""

import re
import sys
import os
from pathlib import Path
from typing import Dict, List, Tuple

# Caminho do projeto
PROJECT_ROOT = Path(__file__).parent.parent

# Arquivos a validar
CUSTOM_TYPES_DIR = PROJECT_ROOT / "packages/shared/src/types"
DATABASE_TYPES_FILE = PROJECT_ROOT / "packages/shared/database.types.ts"

def extract_imports(file_path: Path) -> Dict[str, str]:
    """Extrai imports de database.types.ts"""
    imports = {}
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            # Procura por: export type <Name> = Tables['<table>']['Row']
            pattern = r"export type Tables = Database\['public'\]\['Tables'\]"
            if pattern in content:
                imports['Tables'] = 'database.types'
    except Exception as e:
        print(f"❌ Erro ao ler {file_path}: {e}")
    return imports

def extract_interface_definitions(file_path: Path) -> List[Tuple[str, str]]:
    """Extrai definições de interfaces/types de um arquivo"""
    definitions = []
    try:
        with open(file_path, 'r') as f:
            content = f.read()

            # Pattern para: export interface X extends DatabaseTypeRow { }
            pattern = r"export (?:interface|type) (\w+)\s+(?:extends\s+(\w+)|=)"
            matches = re.finditer(pattern, content)

            for match in matches:
                name = match.group(1)
                extends = match.group(2) or "N/A"
                definitions.append((name, extends))
    except Exception as e:
        print(f"❌ Erro ao ler {file_path}: {e}")
    return definitions

def check_imports_database_types(file_path: Path) -> Tuple[bool, str]:
    """Verifica se o arquivo importa de database.types"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            if "from '../database.types'" in content or "from '@versix/shared/database.types'" in content:
                return True, "✅"
            else:
                return False, "⚠️  Não importa database.types"
    except Exception as e:
        return False, f"❌ Erro: {e}"

def validate_type_extension(file_path: Path) -> List[str]:
    """Valida que tipos customizados estendem de database.types"""
    issues = []
    try:
        with open(file_path, 'r') as f:
            content = f.read()

            # Encontra interfaces que parecem duplicar banco de dados
            # Pattern: interface XYZ { id: string; ... } sem extends
            pattern = r"export interface (\w+)\s*\{(?![^}]*extends)"
            matches = re.finditer(pattern, content)

            for match in matches:
                interface_name = match.group(1)
                # Verificar se é um tipo de dados que deveria estender database.types
                # Tipo heurístico: se tem 'Config', 'Log', 'Row', 'Data' no nome, deveria estender
                if any(keyword in interface_name for keyword in ['Config', 'Log', 'Row', 'Data', 'Status']):
                    # Verificar se está estendendo algo
                    pattern_extends = fr"export interface {interface_name}\s+extends\s+\w+"
                    if not re.search(pattern_extends, content):
                        issues.append(f"⚠️  {interface_name}: Interface pode estar duplicando campos do banco")
    except Exception as e:
        issues.append(f"❌ Erro ao validar {file_path}: {e}")

    return issues

def main():
    """Função principal"""
    print("\n" + "="*60)
    print("🔍 Validação de Sincronização de Tipos")
    print("="*60 + "\n")

    errors = []
    warnings = []

    # 1. Verificar se database.types.ts existe e tem tamanho mínimo
    print("📋 Validações Básicas:")
    if not DATABASE_TYPES_FILE.exists():
        errors.append("❌ database.types.ts não encontrado!")
    else:
        size = os.path.getsize(DATABASE_TYPES_FILE)
        if size < 5000:
            warnings.append(f"⚠️  database.types.ts muito pequeno ({size} bytes) - verificar se foi regenerado")
        else:
            print(f"✅ database.types.ts encontrado ({size} bytes)")

    # 2. Verificar tipos customizados
    if CUSTOM_TYPES_DIR.exists():
        print(f"\n📂 Analisando tipos customizados em {CUSTOM_TYPES_DIR}:")

        for type_file in sorted(CUSTOM_TYPES_DIR.glob("*.ts")):
            if type_file.name.startswith("_"):
                continue

            print(f"\n  📄 {type_file.name}:")

            # Verificar imports
            has_import, status = check_imports_database_types(type_file)
            print(f"     {status} Imports database.types")

            # Analisar definições
            definitions = extract_interface_definitions(type_file)
            if definitions:
                print(f"     Encontradas {len(definitions)} definições")
                for name, extends in definitions[:3]:  # Mostrar primeiras 3
                    extends_text = f"extends {extends}" if extends != "N/A" else "❌ sem extends"
                    print(f"       - {name} {extends_text}")

            # Validar extensões
            validation_issues = validate_type_extension(type_file)
            for issue in validation_issues[:2]:
                print(f"     {issue}")
                warnings.append(issue)
    else:
        errors.append(f"❌ Diretório de tipos não encontrado: {CUSTOM_TYPES_DIR}")

    # Resultado final
    print("\n" + "="*60)
    print("📊 Resumo:")
    print("="*60)

    if errors:
        print(f"\n❌ ERROS ({len(errors)}):")
        for error in errors:
            print(f"   {error}")

    if warnings:
        print(f"\n⚠️  AVISOS ({len(warnings)}):")
        for warning in warnings[:5]:
            print(f"   {warning}")

    if not errors:
        print("\n✅ Validação passou!")
        print("\n💡 Próximos passos:")
        print("   1. Executar: npx supabase gen types typescript --local")
        print("   2. Verificar que database.types.ts foi atualizado")
        print("   3. Rodar build local: pnpm build")
        return 0
    else:
        print("\n❌ Validação falhou!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
