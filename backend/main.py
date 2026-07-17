import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models
from app.routers import auth, candidates, agents, dashboard

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agentix HR Backend")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
origins = [o.strip() for o in frontend_origin.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(candidates.router)
app.include_router(agents.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"status": "Agentix backend is working"}
