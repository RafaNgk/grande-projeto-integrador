from datetime import datetime
from typing import Literal, Optional
from uuid import uuid4

from fastapi import FastAPI, status
from pydantic import BaseModel, Field


app = FastAPI(
    title="Sistema de Monitoramento de Horta",
    version="0.1.0",
)


class LeituraEntrada(BaseModel):
    device_id: str = Field(..., min_length=3)
    timestamp: datetime
    sensor: Literal["umidade_solo", "temperatura", "umidade_ar"]
    valor: float
    unidade: Optional[str] = None


class LeituraResposta(BaseModel):
    id: str
    device_id: str
    timestamp: datetime
    sensor: str
    valor: float
    unidade: Optional[str]
    status: str


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post(
    "/leituras",
    response_model=LeituraResposta,
    status_code=status.HTTP_201_CREATED,
)
def criar_leitura(leitura: LeituraEntrada):
    return {
        "id": str(uuid4()),
        "device_id": leitura.device_id,
        "timestamp": leitura.timestamp,
        "sensor": leitura.sensor,
        "valor": leitura.valor,
        "unidade": leitura.unidade,
        "status": "recebida",
    }