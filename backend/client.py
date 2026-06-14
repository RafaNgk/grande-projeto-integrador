"""
Cliente HTTP para a API externa da horta.
Centraliza a URL base e o tratamento de erros de conectividade.
"""

import httpx
from fastapi import HTTPException

BASE_URL = "https://server-horta.onrender.com/api"
TIMEOUT = 15.0


async def get(path: str) -> dict | list:
    """Faz um GET na API externa e retorna o JSON."""
    url = f"{BASE_URL}{path}"
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=f"Timeout ao conectar com a API externa ({url}). Tente novamente.",
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Erro na API externa: {exc.response.text}",
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Erro de conexão com a API externa: {str(exc)}",
        )


async def post(path: str, payload: dict | None = None) -> dict | list:
    """Faz um POST na API externa e retorna o JSON."""
    url = f"{BASE_URL}{path}"
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            kwargs = {"json": payload} if payload is not None else {}
            response = await client.post(url, **kwargs)
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=f"Timeout ao conectar com a API externa ({url}). Tente novamente.",
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Erro na API externa: {exc.response.text}",
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Erro de conexão com a API externa: {str(exc)}",
        )
