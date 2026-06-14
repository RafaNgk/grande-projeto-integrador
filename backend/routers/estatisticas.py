"""
Router de Estatísticas
Calcula métricas e resumos a partir do histórico completo da horta.
Não existe na API externa — é computado aqui pela FastAPI.
"""

from fastapi import APIRouter, Query, HTTPException
import client

router = APIRouter(prefix="/estatisticas", tags=["Estatísticas"])


# ── Helpers ────────────────────────────────────────────────────────────────────

def _extrair_numero(registro: dict, *chaves: str) -> float | None:
    """Tenta extrair um valor numérico de um registro usando múltiplas chaves candidatas."""
    for chave in chaves:
        val = registro.get(chave)
        if val is not None:
            try:
                return float(val)
            except (TypeError, ValueError):
                continue
    return None


def _estatisticas_serie(valores: list[float]) -> dict:
    """Calcula min, max, média e desvio padrão de uma lista de floats."""
    if not valores:
        return {"min": None, "max": None, "media": None, "desvio_padrao": None, "total": 0}
    n = len(valores)
    media = sum(valores) / n
    variancia = sum((x - media) ** 2 for x in valores) / n
    desvio = variancia ** 0.5
    return {
        "min": round(min(valores), 2),
        "max": round(max(valores), 2),
        "media": round(media, 2),
        "desvio_padrao": round(desvio, 2),
        "total": n,
    }


def _classificar_saude(temp: float | None, umidade: float | None) -> str:
    """Classifica o estado geral com base nos últimos valores."""
    if temp is None or umidade is None:
        return "desconhecido"
    critico = temp > 32 or umidade < 35
    atencao = temp < 16 or umidade > 80
    if critico:
        return "critico"
    if atencao:
        return "atencao"
    return "normal"


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get(
    "/resumo",
    summary="Resumo geral da horta",
    description=(
        "Retorna um resumo consolidado com os últimos valores medidos, "
        "estatísticas de temperatura e umidade, classificação de saúde "
        "e contagem de alertas ativos baseados nos limiares padrão."
    ),
)
async def resumo():
    """
    Compilação de métricas calculadas a partir do histórico completo.

    Campos retornados:
    - **ultima_leitura** — dados do registro mais recente
    - **temperatura** — min, max, média e desvio padrão históricos
    - **umidade** — min, max, média e desvio padrão históricos
    - **saude** — classificação: `normal`, `atencao` ou `critico`
    - **alertas_ativos** — quantidade de registros fora dos limiares padrão
    - **total_registros** — número total de registros no histórico
    """
    historico: list[dict] = await client.get("/historico/completo")

    if not historico:
        raise HTTPException(status_code=404, detail="Histórico vazio. A simulação pode não ter sido iniciada.")

    temperaturas = [v for r in historico if (v := _extrair_numero(r, "temperatura", "temperature")) is not None]
    umidades = [v for r in historico if (v := _extrair_numero(r, "umidade", "humidity", "umidade_solo")) is not None]

    ultima = historico[-1] if historico else {}
    ultima_temp = _extrair_numero(ultima, "temperatura", "temperature")
    ultima_umidade = _extrair_numero(ultima, "umidade", "humidity", "umidade_solo")

    # Alertas usando limiares padrão do frontend
    alertas = sum(
        1 for r in historico
        if (
            (t := _extrair_numero(r, "temperatura", "temperature")) is not None and (t < 16 or t > 32)
        ) or (
            (u := _extrair_numero(r, "umidade", "humidity", "umidade_solo")) is not None and (u < 35 or u > 80)
        )
    )

    return {
        "ultima_leitura": {
            "timestamp": ultima.get("timestamp") or ultima.get("createdAt") or ultima.get("created_at"),
            "temperatura": ultima_temp,
            "umidade": ultima_umidade,
        },
        "temperatura": _estatisticas_serie(temperaturas),
        "umidade": _estatisticas_serie(umidades),
        "saude": _classificar_saude(ultima_temp, ultima_umidade),
        "alertas_ativos": alertas,
        "total_registros": len(historico),
    }


@router.get(
    "/temperatura",
    summary="Estatísticas de temperatura",
    description=(
        "Retorna min, max, média, desvio padrão e distribuição por faixas "
        "para a série histórica de temperatura. Aceita filtro por número "
        "de registros mais recentes via parâmetro `ultimos`."
    ),
)
async def estatisticas_temperatura(
    ultimos: int = Query(
        default=0,
        ge=0,
        description="Número de registros mais recentes a considerar. 0 = todos.",
    )
):
    """
    Análise estatística da temperatura ao longo do histórico.

    - **ultimos=0** — usa todo o histórico
    - **ultimos=N** — usa apenas os N registros mais recentes

    Distribuição por faixas:
    - `abaixo_minimo`: temp < 16°C
    - `ideal`: 16°C ≤ temp ≤ 32°C
    - `acima_maximo`: temp > 32°C
    """
    historico: list[dict] = await client.get("/historico/completo")

    if not historico:
        raise HTTPException(status_code=404, detail="Histórico vazio.")

    serie = historico[-ultimos:] if ultimos > 0 else historico
    valores = [v for r in serie if (v := _extrair_numero(r, "temperatura", "temperature")) is not None]

    distribuicao = {
        "abaixo_minimo": sum(1 for v in valores if v < 16),
        "ideal": sum(1 for v in valores if 16 <= v <= 32),
        "acima_maximo": sum(1 for v in valores if v > 32),
    }

    return {
        **_estatisticas_serie(valores),
        "unidade": "°C",
        "limiar_minimo": 16,
        "limiar_maximo": 32,
        "distribuicao": distribuicao,
        "registros_analisados": len(serie),
    }


@router.get(
    "/umidade",
    summary="Estatísticas de umidade",
    description=(
        "Retorna min, max, média, desvio padrão e distribuição por faixas "
        "para a série histórica de umidade do solo. Aceita filtro por número "
        "de registros mais recentes via parâmetro `ultimos`."
    ),
)
async def estatisticas_umidade(
    ultimos: int = Query(
        default=0,
        ge=0,
        description="Número de registros mais recentes a considerar. 0 = todos.",
    )
):
    """
    Análise estatística da umidade ao longo do histórico.

    Distribuição por faixas:
    - `seco`: umidade < 35%
    - `ideal`: 35% ≤ umidade ≤ 80%
    - `encharcado`: umidade > 80%
    """
    historico: list[dict] = await client.get("/historico/completo")

    if not historico:
        raise HTTPException(status_code=404, detail="Histórico vazio.")

    serie = historico[-ultimos:] if ultimos > 0 else historico
    valores = [v for r in serie if (v := _extrair_numero(r, "umidade", "humidity", "umidade_solo")) is not None]

    distribuicao = {
        "seco": sum(1 for v in valores if v < 35),
        "ideal": sum(1 for v in valores if 35 <= v <= 80),
        "encharcado": sum(1 for v in valores if v > 80),
    }

    return {
        **_estatisticas_serie(valores),
        "unidade": "%",
        "limiar_minimo": 35,
        "limiar_maximo": 80,
        "distribuicao": distribuicao,
        "registros_analisados": len(serie),
    }


@router.get(
    "/alertas",
    summary="Lista de alertas ativos",
    description=(
        "Varre o histórico e retorna os registros que violam os limiares "
        "padrão de temperatura (16–32°C) ou umidade (35–80%). "
        "Cada alerta inclui tipo, nível de severidade e o valor medido."
    ),
)
async def alertas(
    ultimos: int = Query(
        default=50,
        ge=1,
        le=500,
        description="Número de registros mais recentes a analisar (padrão: 50, máx: 500).",
    )
):
    """
    Detecção de condições fora dos limiares operacionais.

    Níveis de severidade:
    - `critico` — temperatura alta (>32°C) ou umidade baixa (<35%)
    - `atencao` — temperatura baixa (<16°C) ou umidade alta (>80%)

    Retorna no máximo os `ultimos` registros analisados e lista
    os alertas encontrados em ordem cronológica.
    """
    historico: list[dict] = await client.get("/historico/completo")

    if not historico:
        raise HTTPException(status_code=404, detail="Histórico vazio.")

    serie = historico[-ultimos:]
    resultado: list[dict] = []

    for registro in serie:
        temp = _extrair_numero(registro, "temperatura", "temperature")
        umidade = _extrair_numero(registro, "umidade", "humidity", "umidade_solo")
        ts = registro.get("timestamp") or registro.get("createdAt") or registro.get("created_at")

        if temp is not None:
            if temp > 32:
                resultado.append({"tipo": "temperatura_alta", "nivel": "critico", "valor": temp, "unidade": "°C", "timestamp": ts})
            elif temp < 16:
                resultado.append({"tipo": "temperatura_baixa", "nivel": "atencao", "valor": temp, "unidade": "°C", "timestamp": ts})

        if umidade is not None:
            if umidade < 35:
                resultado.append({"tipo": "umidade_baixa", "nivel": "critico", "valor": umidade, "unidade": "%", "timestamp": ts})
            elif umidade > 80:
                resultado.append({"tipo": "umidade_alta", "nivel": "atencao", "valor": umidade, "unidade": "%", "timestamp": ts})

    return {
        "total_alertas": len(resultado),
        "registros_analisados": len(serie),
        "alertas": resultado,
    }


@router.get(
    "/tendencia",
    summary="Tendência recente",
    description=(
        "Compara a média das últimas N leituras com a média do período anterior "
        "de mesmo tamanho, calculando a variação percentual de temperatura "
        "e umidade. Útil para indicar se as condições estão melhorando ou piorando."
    ),
)
async def tendencia(
    janela: int = Query(
        default=10,
        ge=2,
        le=100,
        description="Tamanho da janela de comparação (número de registros por período).",
    )
):
    """
    Análise de tendência por comparação de janelas temporais.

    Divide o histórico recente em dois blocos de tamanho `janela`:
    - **periodo_atual** — os `janela` registros mais recentes
    - **periodo_anterior** — os `janela` registros imediatamente antes

    Retorna a variação percentual de temperatura e umidade entre os dois períodos.
    Valores positivos indicam aumento; negativos indicam queda.
    """
    historico: list[dict] = await client.get("/historico/completo")

    if len(historico) < janela * 2:
        raise HTTPException(
            status_code=422,
            detail=f"Histórico insuficiente. São necessários pelo menos {janela * 2} registros para calcular tendência com janela={janela}.",
        )

    periodo_atual = historico[-janela:]
    periodo_anterior = historico[-(janela * 2):-janela]

    def media_campo(serie, *chaves):
        vals = [v for r in serie if (v := _extrair_numero(r, *chaves)) is not None]
        return round(sum(vals) / len(vals), 2) if vals else None

    def variacao_pct(atual, anterior):
        if atual is None or anterior is None or anterior == 0:
            return None
        return round(((atual - anterior) / anterior) * 100, 2)

    temp_atual = media_campo(periodo_atual, "temperatura", "temperature")
    temp_anterior = media_campo(periodo_anterior, "temperatura", "temperature")
    umid_atual = media_campo(periodo_atual, "umidade", "humidity", "umidade_solo")
    umid_anterior = media_campo(periodo_anterior, "umidade", "humidity", "umidade_solo")

    var_temp = variacao_pct(temp_atual, temp_anterior)
    var_umid = variacao_pct(umid_atual, umid_anterior)

    def tendencia_label(var: float | None) -> str:
        if var is None:
            return "desconhecido"
        if var > 1:
            return "subindo"
        if var < -1:
            return "caindo"
        return "estavel"

    return {
        "janela": janela,
        "temperatura": {
            "periodo_atual": temp_atual,
            "periodo_anterior": temp_anterior,
            "variacao_pct": var_temp,
            "tendencia": tendencia_label(var_temp),
        },
        "umidade": {
            "periodo_atual": umid_atual,
            "periodo_anterior": umid_anterior,
            "variacao_pct": var_umid,
            "tendencia": tendencia_label(var_umid),
        },
    }
