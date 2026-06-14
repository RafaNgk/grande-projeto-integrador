"""
Router de Histórico
Expõe o histórico completo e por minuto da API externa.
"""

from fastapi import APIRouter, Path
import client

router = APIRouter(prefix="/historico", tags=["Histórico"])


@router.get(
    "/completo",
    summary="Histórico completo",
    description=(
        "Retorna todos os registros da simulação ordenados por tempo, "
        "ideal para alimentar gráficos e dashboards. Pode conter centenas "
        "de entradas dependendo do tempo de execução da simulação."
    ),
)
async def historico_completo():
    """
    Proxy para `/api/historico/completo` da API externa.

    Cada item do array contém temperatura, umidade, timestamp e demais
    campos registrados durante a simulação. Use este endpoint para
    renderizar séries temporais no frontend.
    """
    return await client.get("/historico/completo")


@router.get(
    "/minuto/{id}",
    summary="Registro por ID",
    description=(
        "Retorna os dados detalhados de um único registro do histórico "
        "identificado pelo seu `id` numérico."
    ),
)
async def historico_por_minuto(
    id: int = Path(..., ge=1, description="ID do registro no histórico (inteiro positivo)"),
):
    """
    Proxy para `/api/historico/minuto/:id` da API externa.

    Use para inspecionar um ponto específico da série temporal —
    útil ao clicar em um ponto do gráfico no frontend para exibir
    detalhes daquela leitura.
    """
    return await client.get(f"/historico/minuto/{id}")
