"""
Router de Controle
Permite interagir com o motor físico da simulação (chuva, irrigação, reset).
"""

from fastapi import APIRouter, Body
from pydantic import BaseModel, Field
import client

router = APIRouter(prefix="/controle", tags=["Controle"])


# ── Schemas de entrada ─────────────────────────────────────────────────────────

class ChuvaPayload(BaseModel):
    duracao: int = Field(
        ...,
        ge=1,
        le=120,
        description="Duração do evento de chuva em minutos (1–120).",
        examples=[20],
    )
    intensidade: str = Field(
        ...,
        pattern="^(fraca|moderada|forte)$",
        description="Intensidade da chuva: 'fraca', 'moderada' ou 'forte'.",
        examples=["forte"],
    )


class IrrigacaoPayload(BaseModel):
    ligar: str | None = Field(
        default=None,
        pattern="^(true|false)$",
        description="'true' para ligar a bomba, 'false' para desligar. "
                    "Ignorado quando automatico='true'.",
        examples=["true"],
    )
    automatico: str = Field(
        ...,
        pattern="^(true|false)$",
        description=(
            "'true' para devolver o controle ao sistema automático; "
            "'false' para entrar em modo manual (requer o campo `ligar`)."
        ),
        examples=["false"],
    )


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post(
    "/chuva",
    summary="Forçar evento de chuva",
    description=(
        "Injeta um evento climático de chuva na simulação com duração "
        "e intensidade configuráveis. Útil para testar a resposta "
        "do sistema de irrigação automática."
    ),
)
async def forcar_chuva(payload: ChuvaPayload = Body(...)):
    """
    Envia um evento de chuva ao motor da simulação.

    - **duracao**: quantos minutos o evento deve durar
    - **intensidade**: `fraca`, `moderada` ou `forte`

    A simulação ajusta a umidade do solo progressivamente durante
    o evento e reverte ao comportamento padrão após o término.
    """
    return await client.post("/controle/chuva", payload.model_dump())


@router.post(
    "/irrigacao",
    summary="Controlar bomba de irrigação",
    description=(
        "Liga/desliga a bomba em modo manual ou devolve o controle "
        "ao sistema automático. Para ativar o modo manual, envie "
        "`automatico: 'false'` com o campo `ligar`. "
        "Para retornar ao automático, envie apenas `automatico: 'true'`."
    ),
)
async def controlar_irrigacao(payload: IrrigacaoPayload = Body(...)):
    """
    Controla a bomba de irrigação.

    **Modo manual — ligar:**
    ```json
    { "ligar": "true", "automatico": "false" }
    ```

    **Modo manual — desligar:**
    ```json
    { "ligar": "false", "automatico": "false" }
    ```

    **Devolver ao automático:**
    ```json
    { "automatico": "true" }
    ```
    """
    return await client.post("/controle/irrigacao", payload.model_dump(exclude_none=True))


@router.post(
    "/reset",
    summary="Reset total da simulação",
    description=(
        "⚠️ **Ação destrutiva.** Apaga todo o histórico do banco de dados "
        "e reinicia a simulação do zero. Use apenas em ambiente de testes "
        "ou quando precisar recomeçar o ciclo de simulação."
    ),
)
async def reset_total():
    """
    Reinicia a simulação completamente.

    - Remove todos os registros do histórico
    - Reinicia os contadores e estado dos atuadores
    - A simulação volta ao estado inicial como se acabasse de ser ligada

    Não há payload necessário — basta fazer o POST vazio.
    """
    return await client.post("/controle/reset-total")
