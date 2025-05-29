from fastapi import APIRouter
from pydantic import BaseModel
from ezra.backend.memoria_ezra.memory_handler import save_to_memory  # ajuste se o nome da pasta diferir

router = APIRouter()

class MemoryRequest(BaseModel):
    user_id: str
    autor: str
    conteudo: str

@router.post("/save_memory")
async def save_memory(req: MemoryRequest):
    try:
        save_to_memory(req.user_id, req.autor, req.conteudo)
        return {"status": "ok", "mensagem": "Memória salva com sucesso"}
    except Exception as e:
        return {"status": "erro", "mensagem": str(e)}
