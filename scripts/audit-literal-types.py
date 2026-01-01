#!/usr/bin/env python3
"""
Auditoria: Verifica tipos literais TypeScript vs ENUMs do PostgreSQL
Identifica campos que usam tipo literal mas não têm ENUM no banco
"""

import re
from pathlib import Path

# Mapear tipos TypeScript para ENUMs do banco
TYPE_TO_ENUM_MAP = {
    # Core (20240101000001_create_enums.sql)
    'tier_type': 'tier_type',
    'user_role': 'user_role',
    'user_status': 'user_status',
    'tipo_residente': 'tipo_residente',
    'unidade_tipo': 'unidade_tipo',
    'ata_status': 'ata_status',
    'comunicado_categoria': 'comunicado_categoria',
    'prioridade': 'prioridade',

    # Operational (20240101000006_operational_modules.sql)
    'ComunicadoStatus': 'comunicado_status',
    'ComunicadoCategoria': 'comunicado_categoria',
    'OcorrenciaStatus': 'ocorrencia_status',
    'OcorrenciaCategoria': 'ocorrencia_categoria',
    'Prioridade': 'prioridade',
    'ChamadoStatus': 'chamado_status',
    'ChamadoCategoria': 'chamado_categoria',

    # Financial (20240101000008_financial_module.sql)
    'CategoriaTipo': 'categoria_tipo',
    'LancamentoTipo': 'lancamento_tipo',
    'LancamentoStatus': 'lancamento_status',
    'PrestacaoStatus': 'prestacao_status',
    'TaxaTipo': 'taxa_tipo',
    'CobrancaStatus': 'cobranca_status',

    # Assembleias (20240101000012_assembleias_module.sql)
    'AssembleiaTipo': 'assembleia_tipo',
    'AssembleiaStatus': 'assembleia_status',
    'PautaTipoVotacao': 'pauta_tipo_votacao',
    'PautaStatus': 'pauta_status',
    'QuorumEspecial': 'quorum_especial',
    'PresencaTipo': 'presenca_tipo',
    'AssinaturaTipo': None,  # NÃO TEM ENUM NO BANCO!
    'ComentarioTipo': None,  # NÃO TEM ENUM NO BANCO!

    # Comunicação (20240101000014_comunicacao_module.sql)
    'CanalNotificacao': 'canal_notificacao',
    'PrioridadeComunicado': 'prioridade_comunicado',
    'StatusEntrega': 'status_entrega',
    'DigestFrequencia': None,  # NÃO TEM ENUM NO BANCO!
    'TipoEmergencia': None,  # NÃO TEM ENUM NO BANCO!

    # Integrações (20240101000016_integracoes_module.sql)
    'IntegracaoTipo': 'integracao_tipo',
    'IntegracaoStatus': 'integracao_status',
    'ConectorTipo': 'conector_tipo',
    'ExportacaoFormato': None,  # NÃO TEM ENUM NO BANCO!
    'ExportacaoTipo': None,  # NÃO TEM ENUM NO BANCO!
}

def check_type_usage():
    """Verifica uso de tipos literais sem ENUM no banco"""

    print("=" * 80)
    print("🔍 AUDITORIA: Tipos Literais sem ENUM no Banco")
    print("=" * 80)
    print()

    # Tipos sem ENUM
    no_enum_types = [k for k, v in TYPE_TO_ENUM_MAP.items() if v is None]

    print(f"❌ TIPOS SEM ENUM NO BANCO ({len(no_enum_types)}):")
    print()
    for type_name in no_enum_types:
        print(f"  - {type_name}")
    print()

    # Buscar onde esses tipos são usados em interfaces
    types_dir = Path('/workspaces/versix-norma/packages/shared/src/types')

    issues = []

    for ts_file in types_dir.glob('*.ts'):
        content = ts_file.read_text()

        # Procurar campos que usam esses tipos
        for type_name in no_enum_types:
            # Padrão: campo: TipoSemEnum
            pattern = rf'(\w+)\s*:\s*{type_name}\b'
            matches = re.finditer(pattern, content)

            for match in matches:
                field_name = match.group(1)
                line_num = content[:match.start()].count('\n') + 1

                issues.append({
                    'file': ts_file.name,
                    'line': line_num,
                    'field': field_name,
                    'type': type_name
                })

    if issues:
        print("=" * 80)
        print(f"⚠️  CAMPOS QUE USAM TIPOS SEM ENUM ({len(issues)}):")
        print("=" * 80)
        print()

        by_file = {}
        for issue in issues:
            if issue['file'] not in by_file:
                by_file[issue['file']] = []
            by_file[issue['file']].append(issue)

        for filename, file_issues in sorted(by_file.items()):
            print(f"📄 {filename}")
            for issue in file_issues:
                print(f"   Linha {issue['line']:4d}: {issue['field']:30s} → {issue['type']}")
            print()

    # Verificar tipo_conta especificamente
    print("=" * 80)
    print("🔍 VERIFICAÇÃO ESPECIAL: tipo_conta")
    print("=" * 80)
    print()

    financial_file = types_dir / 'financial.ts'
    if financial_file.exists():
        content = financial_file.read_text()

        # Buscar uso de tipo_conta com tipo literal
        pattern = r"tipo_conta\??\s*:\s*['\"](\w+)['\"]\s*\|"
        matches = list(re.finditer(pattern, content))

        if matches:
            print("❌ ENCONTRADO: tipo_conta com tipo literal restrito")
            for match in matches:
                line_num = content[:match.start()].count('\n') + 1
                print(f"   Linha {line_num}: tipo_conta com tipo literal")
            print()
            print("   RECOMENDAÇÃO: Alterar para 'string' (não há ENUM no banco)")
        else:
            print("✅ OK: tipo_conta não usa tipo literal restrito")

    print()
    print("=" * 80)
    print("📊 RESUMO")
    print("=" * 80)
    print(f"Tipos sem ENUM: {len(no_enum_types)}")
    print(f"Campos afetados: {len(issues)}")
    print()

    if issues:
        print("⚠️  AÇÃO NECESSÁRIA:")
        print("   Esses tipos precisam ser verificados no banco de dados.")
        print("   Se não existir ENUM, considerar:")
        print("   1. Criar ENUM no banco (requer migration)")
        print("   2. Alterar TypeScript para string (mais seguro)")
    else:
        print("✅ Nenhum problema encontrado")

    return len(issues)

if __name__ == '__main__':
    num_issues = check_type_usage()
    exit(0 if num_issues == 0 else 1)
