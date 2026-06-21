from pathlib import Path
import sys

required_files = [
    Path('docs/scm-plan.md'),
    Path('docs/scm-evidence.md'),
    Path('.github/pull_request_template.md'),
    Path('.github/ISSUE_TEMPLATE/bug_report.md'),
    Path('.github/ISSUE_TEMPLATE/feature_request.md'),
]

required_sections = {
    Path('docs/scm-plan.md'): [
        '## 1.1 Política de Branching',
        '## 1.2 Proteção da branch `main`',
        '## 1.3 Convenção de Commits',
        '## 1.4 Definição de "Pronto" para um PR',
        '## 1.5 Papéis',
    ],
    Path('.github/pull_request_template.md'): [
        '## Qual problema isso resolve?',
        '## Como foi testado?',
        '## Checklist de pronto',
    ],
}

errors = []

for path in required_files:
    if not path.exists():
        errors.append(f'Arquivo obrigatório ausente: {path}')
        continue
    if not path.read_text(encoding='utf-8').strip():
        errors.append(f'Arquivo obrigatório vazio: {path}')

for path, sections in required_sections.items():
    if not path.exists():
        continue
    content = path.read_text(encoding='utf-8')
    for section in sections:
        if section not in content:
            errors.append(f'Seção obrigatória ausente em {path}: {section}')

if errors:
    print('Validação de SCM falhou:')
    for err in errors:
        print(f'- {err}')
    sys.exit(1)

print('Validação de SCM concluída com sucesso.')
