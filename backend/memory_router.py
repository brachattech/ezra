from fastapi import APIRouter
from pydantic import BaseModel
from memory_handler import detect_fixe_na_memoria, collect_messages_since_last_fixe_na_memoria, generate_summary, save_to_memory

router = APIRouter()

class MessageHistory(BaseModel):
    customer_id: str
    history: list[dict]  # [{'sender': 'Usuário', 'message': 'texto'}]

@router.post("/fixar")
def fixar_na_memoria(payload: MessageHistory):
    history = payload.history
    customer_id = payload.customer_id

    if not history or not detect_fixe_na_memoria(history[-1]['message']):
        return {"status": "ignorado", "motivo": "sem comando de memória"}

    mensagens = collect_messages_since_last_fixe_na_memoria(history[:-1])
    specialty = None
    for msg in reversed(mensagens):
        if "como" in msg['message']:
            specialty = msg['message'].split("como")[-1].strip('. ')
            break

    resumo = generate_summary(mensagens, specialty)
    save_to_memory(customer_id, "Ezra", resumo)

    return {"status": "ok", "resumo": resumo}
