
# memory_handler.py
# Ezra - Sistema de Memória Manual com Especialidades Temporárias

from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurações do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://<sua-instancia>.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "<sua-chave-api-secreta>")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def detect_fixe_na_memoria(message):
    return "fixe na memória" in message.lower()

def collect_messages_since_last_fixe_na_memoria(history):
    collected = []
    for i in range(len(history) - 1, -1, -1):
        msg = history[i]
        if detect_fixe_na_memoria(msg['message']):
            break
        collected.insert(0, msg)
    return collected

def generate_summary(messages, specialty=None):
    summary = ""
    for msg in messages:
        summary += f"{msg['sender']}: {msg['message']}\n"
    if specialty:
        summary = f"[Resumo especializado: {specialty}]\n" + summary
    return summary.strip()

def save_to_memory(customer_id, sender, message):
    print("📤 Tentando salvar memória no Supabase...")
    print(f"📌 URL: {SUPABASE_URL}")
    print(f"🔑 KEY prefixo: {SUPABASE_KEY[:6]}...")
    print(f"📄 Dados: customer_id={customer_id}, sender={sender}")

    data = {
        "customer_id": customer_id,
        "sender": sender,
        "message": message
    }

    response = supabase.table("agent_settings").insert(data).execute()

    if response.error:
        print("❌ Erro ao salvar no Supabase:")
        print(response.error)
        raise Exception(f"Erro ao salvar no Supabase: {response.error.message}")
    
    print(f"✅ Memória salva com sucesso para {customer_id}")

# Teste local
if __name__ == "__main__":
    history = [
        {'sender': 'Usuário', 'message': 'Olá Ezra'},
        {'sender': 'Ezra', 'message': 'Olá! Como posso ajudar?'},
        {'sender': 'Usuário', 'message': 'fixe na memória'},
        {'sender': 'Ezra', 'message': 'Resumo anterior gerado.'},
        {'sender': 'Usuário', 'message': 'Por favor, analise este contrato como advogado.'},
        {'sender': 'Usuário', 'message': 'fixe na memória'}
    ]

    last_message = history[-1]['message']

    if detect_fixe_na_memoria(last_message):
        messages_to_summarize = collect_messages_since_last_fixe_na_memoria(history[:-1])
        specialty = None
        for msg in reversed(messages_to_summarize):
            if "como" in msg['message']:
                specialty = msg['message'].split("como")[-1].strip('. ')
                break
        summary = generate_summary(messages_to_summarize, specialty)
        print("Resumo gerado:\n", summary)

        user_response = input("Resumo gerado. Deseja fixar na memória? (Sim/Não): ").strip().lower()
        if user_response == "sim":
            save_to_memory("123e4567-e89b-12d3-a456-426614174000", "Ezra", summary)
        else:
            print("Resumo descartado.")

