"""
API de Monitoramento da Horta — FastAPI
Proxy e camada de estatísticas sobre a API externa server-horta.onrender.com
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from routers import telemetria, historico, controle, estatisticas

app = FastAPI(
    title="Horta Monitorada — API",
    description=(
        "API intermediária que integra com a API de simulação da horta "
        "(server-horta.onrender.com) e disponibiliza dados de telemetria, "
        "histórico e estatísticas para o frontend."
    ),
    version="1.0.0",
    contact={
        "name": "Equipe Projeto Integrador",
    },
    license_info={"name": "MIT"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(telemetria.router)
app.include_router(historico.router)
app.include_router(controle.router)
app.include_router(estatisticas.router)


@app.get("/", tags=["Root"], summary="Status da API")
async def root():
    """Verifica se a API está online."""
    return {
        "status": "online",
        "descricao": "API de Monitoramento da Horta",
        "versao": "1.0.0",
        "documentacao": "/docs",
    }
