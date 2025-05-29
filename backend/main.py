from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from memory_router import router as memory_router

app = FastAPI()

# Libera o frontend para acessar o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Substitua por domínio específico em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui as rotas de memória
app.include_router(memory_router, prefix="/memoria")
