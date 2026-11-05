import os
import sys

# Ensure backend root directory is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Set VERCEL environment variable and safe fallback database URL
os.environ["VERCEL"] = "1"
if not os.environ.get("DATABASE_URL") or "localhost" in os.environ.get("DATABASE_URL", ""):
    os.environ["DATABASE_URL"] = "sqlite+aiosqlite:////tmp/social_commerce.db"

try:
    from app.main import app
except Exception as e:
    import traceback
    err_trace = traceback.format_exc()
    print("CRITICAL: Failed to import app.main:", err_trace)
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI(title="SellerBhai AI Engine")
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Backend failed to initialize on Vercel.",
                "error": str(e),
                "traceback": err_trace
            }
        )
