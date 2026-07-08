from fastapi import FastAPI

app = FastAPI(
    title="AI Eligibility Agent API",
    description="Microservice for predicting fraud or dropout risk using Neo4j and Random Forest.",
    version="1.0.0"
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-eligibility-agent"}
