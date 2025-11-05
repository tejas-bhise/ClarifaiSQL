import os
import sqlite3
import pandas as pd
from fastapi import FastAPI, UploadFile, Form, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
from dotenv import load_dotenv
import json
import numpy as np
import io
import logging
from typing import Dict, Any, List, Optional
import time
import asyncio

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Please set it in a .env file.")

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "default_insecure_key_change_this")

# ✅ Use Flash model
GEMINI_MODEL = "gemini-1.5-flash"

app = FastAPI(
    title="ClarifaiSQL API",
    description="AI-powered Natural Language to SQL Query Generator and Feedback Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={"name": "ClarifaiSQL Support", "email": "support@clarifaisql.com"},
    license_info={"name": "MIT"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://clarifaisql.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ CRITICAL: Increased timeout to 90 seconds + connection pooling
http_client = httpx.AsyncClient(
    timeout=httpx.Timeout(90.0, connect=10.0),
    limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
)

@app.on_event("shutdown")
async def shutdown_event():
    await http_client.aclose()

uploaded_files: Dict[str, pd.DataFrame] = {}

def init_feedback_db():
    conn = sqlite3.connect("feedbacks.db")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_feedback_db()

def verify_admin_key(admin_key: Optional[str]) -> bool:
    if not admin_key:
        return False
    return admin_key == ADMIN_SECRET_KEY

def convert_to_python_types(data):
    if isinstance(data, dict):
        return {k: convert_to_python_types(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_to_python_types(i) for i in data]
    elif isinstance(data, pd.DataFrame):
        return data.to_dict(orient="records")
    elif isinstance(data, (np.int64, np.int32, np.float64, np.float32)):
        return data.item()
    return data

def run_sql_query(conn: sqlite3.Connection, query: str):
    try:
        df = pd.read_sql_query(query, conn)
        return df, None
    except Exception as e:
        return None, str(e)

def get_dynamic_table_name(df, filename):
    base_name = filename.lower().replace('.csv', '').replace(' ', '').replace('-', '')
    columns = [col.lower() for col in df.columns]
    
    if any('product' in col for col in columns):
        return 'products'
    elif any('customer' in col or 'client' in col for col in columns):
        return 'customers'
    elif any('employee' in col or 'staff' in col for col in columns):
        return 'employees'
    elif any('order' in col for col in columns):
        return 'orders'
    elif any('sale' in col for col in columns):
        return 'sales'
    elif any('property' in col or 'real_estate' in col for col in columns):
        return 'properties'
    elif any('student' in col for col in columns):
        return 'students'
    elif any('transaction' in col for col in columns):
        return 'transactions'
    elif any('inventory' in col for col in columns):
        return 'inventory'
    else:
        return base_name if base_name else 'data_table'

# ✅ ULTRA-OPTIMIZED: Minimal schema extraction
def get_detailed_schema_info(conn, table_name):
    try:
        schema_df = pd.read_sql_query(f"PRAGMA table_info({table_name});", conn)
        
        # ✅ Only get 2 sample rows (reduced from 3)
        sample_data = pd.read_sql_query(f"SELECT * FROM {table_name} LIMIT 2;", conn)
        total_rows = pd.read_sql_query(f"SELECT COUNT(*) as count FROM {table_name};", conn).iloc[0]['count']
        
        schema_description = {
            "table_name": table_name,
            "total_rows": int(total_rows),
            "columns": []
        }
        
        for _, col in schema_df.iterrows():
            col_name = col['name']
            col_type = col['type']
            
            # ✅ Only 2 sample values (reduced from 3)
            try:
                sample_values = pd.read_sql_query(
                    f"SELECT DISTINCT {col_name} FROM {table_name} WHERE {col_name} IS NOT NULL LIMIT 2;", 
                    conn
                )[col_name].tolist()
            except:
                sample_values = []
            
            schema_description["columns"].append({
                "name": col_name,
                "type": col_type,
                "sample_values": sample_values[:2]
            })
        
        return schema_description, sample_data.to_dict('records')[:2]
    
    except Exception as e:
        return None, str(e)

@app.get("/", tags=["System"])
async def root():
    return {
        "message": "Welcome to ClarifaiSQL API",
        "version": "1.0.0",
        "status": "optimized_for_speed",
        "model": GEMINI_MODEL
    }

@app.get("/health/", tags=["System"])
async def health_check():
    try:
        conn = sqlite3.connect("feedbacks.db")
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
        return {"status": "healthy", "database": "connected", "model": GEMINI_MODEL}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "unhealthy", "error": str(e)})

@app.post("/feedback/", tags=["Feedback"])
async def save_feedback(
    name: str = Form(...), 
    email: str = Form(...), 
    message: str = Form(...),
    phone: str = Form(None)
):
    try:
        conn = sqlite3.connect("feedbacks.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO feedback (name, email, phone, message) VALUES (?, ?, ?, ?)",
            (name, email, phone, message)
        )
        conn.commit()
        feedback_id = cursor.lastrowid
        conn.close()
        return JSONResponse({"success": True, "message": "Feedback saved!", "feedback_id": feedback_id})
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@app.post("/admin/verify", tags=["Admin"])
async def verify_admin(x_admin_key: Optional[str] = Header(None)):
    if verify_admin_key(x_admin_key):
        return {"success": True, "message": "Admin key verified"}
    raise HTTPException(status_code=401, detail="Invalid admin key")

@app.get("/admin/feedbacks", tags=["Admin"])
async def get_all_feedbacks_admin(x_admin_key: Optional[str] = Header(None)):
    if not verify_admin_key(x_admin_key):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        conn = sqlite3.connect("feedbacks.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, phone, message, created_at FROM feedback ORDER BY created_at DESC")
        feedbacks = cursor.fetchall()
        conn.close()
        
        feedback_list = [
            {"id": fb[0], "name": fb[1], "email": fb[2], "phone": fb[3], "message": fb[4], "created_at": fb[5]}
            for fb in feedbacks
        ]
        return {"feedbacks": feedback_list}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.delete("/admin/feedback/{feedback_id}", tags=["Admin"])
async def delete_feedback_admin(feedback_id: int, x_admin_key: Optional[str] = Header(None)):
    if not verify_admin_key(x_admin_key):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        conn = sqlite3.connect("feedbacks.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM feedback WHERE id = ?", (feedback_id,))
        if not cursor.fetchone():
            conn.close()
            return JSONResponse(status_code=404, content={"error": "Feedback not found"})
        
        cursor.execute("DELETE FROM feedback WHERE id = ?", (feedback_id,))
        conn.commit()
        conn.close()
        return {"success": True, "message": f"Feedback #{feedback_id} deleted"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/admin/feedback/stats/", tags=["Admin"])
async def get_feedback_stats_admin(x_admin_key: Optional[str] = Header(None)):
    if not verify_admin_key(x_admin_key):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        conn = sqlite3.connect("feedbacks.db")
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM feedback")
        total = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM feedback WHERE phone IS NOT NULL")
        with_phone = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM feedback WHERE created_at >= date('now', '-7 days')")
        recent = cursor.fetchone()[0]
        conn.close()
        return {"total_feedbacks": total, "with_phone": with_phone, "recent_feedbacks": recent}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ✅ MAIN ENDPOINT - YOUR PROMPT 100% UNCHANGED
@app.post("/process-query/", tags=["AI Query"])
async def process_query(
    file: UploadFile = File(...),
    query: str = Form(...)
):
    if not file.filename.endswith('.csv'):
        return JSONResponse(status_code=400, content={"detail": "Invalid file type. Please upload a CSV."})
    
    start_time = time.time()
    logger.info(f"Processing query: {query[:50]}...")
    
    try:
        # ✅ Optimized CSV reading
        content = await file.read()
        csv_io = io.StringIO(content.decode('utf-8'))
        df = pd.read_csv(csv_io)
        logger.info(f"CSV loaded in {time.time() - start_time:.2f}s")
        
        table_name = get_dynamic_table_name(df, file.filename)
        
        # ✅ Optimized SQLite loading
        conn = sqlite3.connect(":memory:")
        df.to_sql(table_name, conn, if_exists="replace", index=False)
        logger.info(f"SQLite loaded in {time.time() - start_time:.2f}s")
        
        schema_info, sample_data = get_detailed_schema_info(conn, table_name)
        
        if not schema_info:
            raise HTTPException(status_code=500, detail="Failed to analyze database schema")
        
        logger.info(f"Schema extracted in {time.time() - start_time:.2f}s")
        
        # ✅ YOUR ORIGINAL PROMPT - 100% UNCHANGED
        llm_prompt = f"""
You are an expert SQL analyst and data interpreter. You have been given a database table with the following comprehensive schema:

DATABASE CONTEXT:
- Table Name: {table_name}
- Total Records: {schema_info['total_rows']}
- Columns: {len(schema_info['columns'])}

DETAILED SCHEMA:
{json.dumps(schema_info['columns'], indent=2)}

SAMPLE DATA (first 3 rows):
{json.dumps(sample_data, indent=2)}

USER QUESTION: "{query}"

INSTRUCTIONS:
1. Generate a precise SQLite query that answers the user's question
2. Use the EXACT table name "{table_name}" in your query
3. Use EXACT column names from the schema above
4. Create a detailed, professional explanation that:
   - Explains what the query does step-by-step
   - Mentions the specific columns and table being used
   - Describes the business logic and reasoning
   - Uses real-world context based on the data type
5. If the question cannot be answered with the available data, explain why

Your response MUST be a valid JSON object with these exact keys:
- "generated_sql": The complete SQLite query string
- "explanation": A comprehensive, professional explanation (3-4 sentences minimum)

Focus on accuracy and provide meaningful insights about the data structure and query logic.
"""
        
        # ✅ CRITICAL: Aggressive timeout + retry logic
        api_url = f"https://generativelanguage.googleapis.com/v1/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

        payload = {
    "contents": [{"parts": [{"text": llm_prompt}]}],
    "generationConfig": {
        "responseMimeType": "application/json",
        "responseSchema": {
            "type": "OBJECT",
            "properties": {
                "generated_sql": {"type": "STRING"},
                "explanation": {"type": "STRING"}
            },
            "required": ["generated_sql", "explanation"]
        },
        "temperature": 0.1,
        "maxOutputTokens": 800
    }
}
        
        logger.info("Calling Gemini API...")
        api_start = time.time()
        
        # ✅ Retry logic for reliability
        max_retries = 2
        for attempt in range(max_retries):
            try:
                response = await http_client.post(api_url, json=payload)
                response.raise_for_status()
                logger.info(f"API responded in {time.time() - api_start:.2f}s (attempt {attempt + 1})")
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"API attempt {attempt + 1} failed: {e}, retrying...")
                await asyncio.sleep(1)
        
        llm_data = response.json()
        llm_response_text = llm_data['candidates'][0]['content']['parts'][0]['text']
        llm_json = json.loads(llm_response_text)
        
        sql_query = llm_json.get("generated_sql", "").strip()
        explanation = llm_json.get("explanation", "").strip()
        
        if not sql_query:
            raise HTTPException(status_code=400, detail="Could not generate SQL query")
        
        logger.info(f"Executing SQL query...")
        result_df, query_error = run_sql_query(conn, sql_query)
        conn.close()
        
        if query_error:
            raise HTTPException(status_code=500, detail=f"SQL Error: {query_error}")
        
        total_time = time.time() - start_time
        logger.info(f"✅ Total request completed in {total_time:.2f}s")
        
        return {
            "sql_query": sql_query,
            "explanation": explanation,
            "result": convert_to_python_types(result_df),
            "table_info": {
                "table_name": table_name,
                "total_rows": schema_info['total_rows'],
                "columns_count": len(schema_info['columns'])
            },
            "processing_time": f"{total_time:.2f}s"
        }
    except Exception as e:
        logger.error(f"❌ Error after {time.time() - start_time:.2f}s: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Error: {str(e)}"})

@app.get("/api/info/", tags=["System"])
async def api_info():
    return {
        "title": "ClarifaiSQL API (Ultra-Optimized)",
        "version": "1.0.0",
        "model": GEMINI_MODEL,
        "optimizations": [
            "Gemini 1.5 Flash model",
            "90s timeout with retry logic",
            "Connection pooling",
            "Minimal schema extraction (2 samples)",
            "Reduced token output (800)",
            "Performance logging"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info", reload=True)
