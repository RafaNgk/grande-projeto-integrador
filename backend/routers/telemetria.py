"""
Router de Telemetria
Expõe os dados de aquisição básica e avançada da API externa.
"""

from fastapi import APIRouter
import client

router = APIRouter(prefix="/telemetria", tags=["Telemetria"])


@router.get(
    "/basica",
    summary="Telemetria básica",
    description=(
        "Retorna os dados simplificados e estruturados de aquisição da horta: "
        "temperatura, umidade do solo, timestamp e identificador do dispositivo."
    ),
)
async def telemetria_basica():
    """
    Proxy para `/api/aquisicao` da API externa.

    Retorna a leitura mais recente com os campos essenciais:
    - **temperatura** — temperatura ambiente em °C
    - **umidade** — umidade do solo em %
    - **timestamp** — horário da leitura (ISO 8601)
    - **dispositivo** — identificador do ESP32
    """
    return await client.get("/aquisicao")


@router.get(
    "/avancada",
    summary="Telemetria avançada",
    description=(
        "Retorna o conjunto completo de metadados: condições ambientais, "
        "leituras detalhadas dos sensores do solo e estado atual dos atuadores "
        "(bomba de irrigação, válvulas)."
    ),
)
async def telemetria_avancada():
    """
    Proxy para `/api/aquisicao/avancada` da API externa.

    Inclui todos os campos da telemetria básica, mais:
    - **sensores_solo** — múltiplas leituras de umidade por zona
    - **atuadores** — estado da bomba e das válvulas
    - **condicoes_ambientais** — luminosidade, pressão atmosférica (quando disponível)
    """
    return await client.get("/aquisicao/avancada")
