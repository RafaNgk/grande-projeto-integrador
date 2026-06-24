import json
from pathlib import Path

from fastapi.testclient import TestClient
from jsonschema import validate

from app.main import app


client = TestClient(app)


def test_post_leituras_valida_contrato_da_api():
    """
    Valida o contrato mínimo do endpoint POST /leituras.

    Este teste cobre:
    - status code esperado;
    - schema JSON da resposta;
    - presença de campos obrigatórios.
    """

    payload = {
        "device_id": "esp32-horta-01",
        "timestamp": "2026-05-10T22:47:13-03:00",
        "sensor": "umidade_solo",
        "valor": 41.5,
        "unidade": "%",
    }

    response = client.post("/leituras", json=payload)

    assert response.status_code == 201

    body = response.json()

    schema_path = Path("tests/contract/schemas/leitura_response.schema.json")
    schema = json.loads(schema_path.read_text(encoding="utf-8"))

    validate(instance=body, schema=schema)

    assert "device_id" in body
    assert "timestamp" in body
    assert "sensor" in body
    assert "valor" in body
    assert body["device_id"] == payload["device_id"]
    assert body["sensor"] == payload["sensor"]
    assert body["status"] == "recebida"