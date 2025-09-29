import os
import sqlite3
import pandas as pd
from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx  # Use httpx for asynchronous HTTP requests
from dotenv import load_dotenv
import json
import numpy as np
import io
import logging
from typing import Dict, Any, List

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Check if the API key is set
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Please set it in a .env file.")

# Initialize FastAPI app with proper documentation configuration
app = FastAPI(
    title="ClarifaiSQL API",
    description="AI-powered Natural Language to SQL Query Generator and Feedback Management System",
    version="1.0.0",
    docs_url="/docs",  # This enables Swagger UI at /docs
    redoc_url="/redoc",  # This enables ReDoc at /redoc
    openapi_url="/openapi.json",  # OpenAPI schema endpoint
    contact={
        "name": "ClarifaiSQL Support",
        "email": "support@clarifaisql.com",
    },
    license_info={
        "name": "MIT",
    },
)

# Add CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://clarifaisql-pikzk8y0b-tejas-bhises-projects.vercel.app"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo (use database in production)
uploaded_files: Dict[str, pd.DataFrame] = {}

# Initialize feedback database on startup
def init_feedback_db():
    """Initialize the feedback SQLite database with required table."""
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

# Initialize database on startup
init_feedback_db()

# --- Helper Functions ---
def convert_to_python_types(data):
    """Recursively converts numpy data types to standard Python types for JSON serialization."""
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
    """Runs a SQL query against the provided SQLite connection."""
    try:
        df = pd.read_sql_query(query, conn)
        return df, None
    except Exception as e:
        return None, str(e)

def get_dynamic_table_name(df, filename):
    """Generate a meaningful table name based on the file content and name."""
    # Remove file extension and clean filename
    base_name = filename.lower().replace('.csv', '').replace(' ', '').replace('-', '')
    
    # Try to infer table purpose from columns
    columns = [col.lower() for col in df.columns]
    
    # Common patterns to detect table type
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
        # Use filename if no pattern matches
        return base_name if base_name else 'data_table'

def get_detailed_schema_info(conn, table_name):
    """Get comprehensive schema information including sample data."""
    try:
        # Get basic schema
        schema_df = pd.read_sql_query(f"PRAGMA table_info({table_name});", conn)
        
        # Get sample data (first 3 rows)
        sample_data = pd.read_sql_query(f"SELECT * FROM {table_name} LIMIT 3;", conn)
        
        # Get table statistics
        total_rows = pd.read_sql_query(f"SELECT COUNT(*) as count FROM {table_name};", conn).iloc[0]['count']
        
        # Build comprehensive schema description
        schema_description = {
            "table_name": table_name,
            "total_rows": int(total_rows),
            "columns": []
        }
        
        for _, col in schema_df.iterrows():
            col_name = col['name']
            col_type = col['type']
            
            # Get unique values count for categorical columns
            try:
                unique_count = pd.read_sql_query(
                    f"SELECT COUNT(DISTINCT {col_name}) as unique_count FROM {table_name};", 
                    conn
                ).iloc[0]['unique_count']
            except:
                unique_count = 0
            
            # Get sample values
            try:
                sample_values = pd.read_sql_query(
                    f"SELECT DISTINCT {col_name} FROM {table_name} WHERE {col_name} IS NOT NULL LIMIT 5;", 
                    conn
                )[col_name].tolist()
            except:
                sample_values = []
            
            schema_description["columns"].append({
                "name": col_name,
                "type": col_type,
                "unique_count": int(unique_count),
                "sample_values": sample_values[:5]  # Limit to 5 sample values
            })
        
        return schema_description, sample_data.to_dict('records')[:3]
    
    except Exception as e:
        return None, str(e)

# --- Root and Documentation Endpoints ---
@app.get("/", tags=["System"], summary="API Welcome")
async def root():
    """
    Root endpoint returning API information and navigation.
    
    Returns welcome message with links to documentation and key endpoints.
    """
    return {
        "message": "Welcome to ClarifaiSQL API",
        "version": "1.0.0",
        "description": "AI-powered Natural Language to SQL Query Generator",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_schema": "/openapi.json"
        },
        "key_endpoints": {
            "process_query": "/process-query/",
            "feedback": "/feedback/",
            "health": "/health/",
            "api_info": "/api/info/"
        }
    }

@app.get("/health/", tags=["System"], summary="Health Check")
async def health_check():
    """
    Health check endpoint for monitoring and load balancing.
    
    Returns:
    - Service status
    - Database connectivity
    - Timestamp
    """
    try:
        # Test database connection
        conn = sqlite3.connect("feedbacks.db")
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "service": "ClarifaiSQL API",
            "version": "1.0.0",
            "timestamp": pd.Timestamp.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
                "timestamp": pd.Timestamp.now().isoformat()
            }
        )

# --- Feedback API Endpoints ---
@app.post("/feedback/", tags=["Feedback"], summary="Submit Feedback")
async def save_feedback(
    name: str = Form(..., description="User's full name"), 
    email: str = Form(..., description="User's email address"), 
    message: str = Form(..., description="Feedback message content"),
    phone: str = Form(None, description="Optional phone number")
):
    """
    Save user feedback to the database.
    
    - **name**: User's full name (required)
    - **email**: Valid email address (required)
    - **message**: Detailed feedback message (required)
    - **phone**: Optional contact phone number
    
    Returns confirmation with feedback ID.
    """
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
        return JSONResponse({
            "success": True, 
            "message": "Feedback saved successfully!",
            "feedback_id": feedback_id
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@app.get("/feedbacks/", tags=["Feedback"], summary="Get All Feedbacks")
async def get_all_feedbacks():
    """
    Retrieve all feedback entries for admin dashboard.
    
    Returns list of all feedback entries with full details, ordered by creation date.
    """
    try:
        conn = sqlite3.connect("feedbacks.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, phone, message, created_at FROM feedback ORDER BY created_at DESC")
        feedbacks = cursor.fetchall()
        conn.close()
        
        # Convert to list of dictionaries
        feedback_list = []
        for fb in feedbacks:
            feedback_list.append({
                "id": fb[0],
                "name": fb[1],
                "email": fb[2],
                "phone": fb[3], 
                "message": fb[4],
                "created_at": fb[5]
            })
        
        return {"feedbacks": feedback_list}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/feedback/{feedback_id}", tags=["Feedback"], summary="Get Specific Feedback")
async def get_feedback_by_id(feedback_id: int):
    """
    Retrieve a specific feedback entry by ID.
    
    - **feedback_id**: Unique feedback identifier
    
    Returns detailed feedback information or 404 if not found.
    """
    try:
        conn = sqlite3.connect("feedbacks.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, phone, message, created_at FROM feedback WHERE id = ?", (feedback_id,))
        feedback = cursor.fetchone()
        conn.close()
        
        if not feedback:
            return JSONResponse(status_code=404, content={"error": "Feedback not found"})
        
        return {
            "id": feedback[0],
            "name": feedback[1],
            "email": feedback[2],
            "phone": feedback[3],
            "message": feedback[4],
            "created_at": feedback[5]
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.delete("/feedback/{feedback_id}", tags=["Feedback"], summary="Delete Feedback")
async def delete_feedback(feedback_id: int):
    """
    Delete a specific feedback entry by ID.
    
    - **feedback_id**: Unique feedback identifier to delete
    
    Returns success confirmation or 404 if not found.
    """
    try:
        conn = sqlite3.connect("feedbacks.db")
        cursor = conn.cursor()
        
        # First check if feedback exists
        cursor.execute("SELECT id FROM feedback WHERE id = ?", (feedback_id,))
        if not cursor.fetchone():
            conn.close()
            return JSONResponse(status_code=404, content={"error": "Feedback not found"})
        
        # Delete the feedback
        cursor.execute("DELETE FROM feedback WHERE id = ?", (feedback_id,))
        conn.commit()
        conn.close()
        
        return {
            "success": True, 
            "message": f"Feedback #{feedback_id} deleted successfully"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/feedback/stats/", tags=["Feedback"], summary="Feedback Statistics")
async def get_feedback_stats():
    """
    Get comprehensive feedback statistics for admin dashboard.
    
    Returns:
    - Total feedback count
    - Feedbacks with/without phone numbers
    - Recent activity metrics
    - Daily breakdown
    """
    try:
        conn = sqlite3.connect("feedbacks.db")
        cursor = conn.cursor()
        
        # Total feedbacks
        cursor.execute("SELECT COUNT(*) FROM feedback")
        total_feedbacks = cursor.fetchone()[0]
        
        # Feedbacks with phone numbers
        cursor.execute("SELECT COUNT(*) FROM feedback WHERE phone IS NOT NULL AND phone != ''")
        with_phone = cursor.fetchone()[0]
        
        # Recent feedbacks (last 7 days)
        cursor.execute("SELECT COUNT(*) FROM feedback WHERE created_at >= date('now', '-7 days')")
        recent_feedbacks = cursor.fetchone()[0]
        
        # Today's feedbacks
        cursor.execute("SELECT COUNT(*) FROM feedback WHERE date(created_at) = date('now')")
        today_feedbacks = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "total_feedbacks": total_feedbacks,
            "with_phone": with_phone,
            "without_phone": total_feedbacks - with_phone,
            "recent_feedbacks": recent_feedbacks,
            "today_feedbacks": today_feedbacks
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# --- Main AI Query API Endpoint ---
@app.post("/process-query/", tags=["AI Query"], summary="Process Natural Language Query")
async def process_query(
    file: UploadFile = File(..., description="CSV file containing the dataset to analyze"),
    query: str = Form(..., description="Natural language question about the data")
):
    """
    Process a natural language query against an uploaded CSV file using AI.
    
    This endpoint:
    1. Accepts a CSV file upload
    2. Analyzes the data structure and schema
    3. Uses AI to convert natural language to SQL
    4. Executes the query and returns results
    5. Provides detailed explanations
    
    - **file**: CSV file to analyze (required)
    - **query**: Natural language question about the data (required)
    
    Returns:
    - Generated SQL query
    - Human-readable explanation
    - Query execution results
    - Table metadata
    
    Example queries:
    - "Show me the top 5 customers by sales"
    - "What's the average price by category?"
    - "How many orders were placed last month?"
    """
    if not file.filename.endswith('.csv'):
        return JSONResponse(status_code=400, content={"detail": "Invalid file type. Please upload a CSV."})
    
    try:
        # 1. Process CSV in memory
        content = await file.read()
        csv_io = io.StringIO(content.decode('utf-8'))
        df = pd.read_csv(csv_io)
        
        # 2. Determine appropriate table name
        table_name = get_dynamic_table_name(df, file.filename)
        
        # Create an in-memory SQLite database with dynamic table name
        conn = sqlite3.connect(":memory:")
        df.to_sql(table_name, conn, if_exists="replace", index=False)
        
        # 3. Get comprehensive schema information
        schema_info, sample_data = get_detailed_schema_info(conn, table_name)
        
        if not schema_info:
            raise HTTPException(status_code=500, detail="Failed to analyze database schema")
        
        # 4. Create a sophisticated LLM prompt with actual schema understanding
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
        
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}"
        
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
                "temperature": 0.1,  # Lower temperature for more consistent results
                "maxOutputTokens": 2048
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url, json=payload, timeout=60.0)
            response.raise_for_status()
            llm_data = response.json()
            llm_response_text = llm_data['candidates'][0]['content']['parts'][0]['text']
            llm_json = json.loads(llm_response_text)
        
        sql_query = llm_json.get("generated_sql", "").strip()
        explanation = llm_json.get("explanation", "").strip()
        
        if not sql_query:
            raise HTTPException(status_code=400, detail="The AI could not generate a valid SQL query for this question.")
        
        # 5. Execute the generated query
        result_df, query_error = run_sql_query(conn, sql_query)
        conn.close() # Close the in-memory connection
        
        if query_error:
            raise HTTPException(status_code=500, detail=f"Error executing SQL: {query_error}")
        
        # 6. Format and return the final response
        return {
            "sql_query": sql_query,
            "explanation": explanation,
            "result": convert_to_python_types(result_df),
            "table_info": {
                "table_name": table_name,
                "total_rows": schema_info['total_rows'],
                "columns_count": len(schema_info['columns'])
            }
        }
    except Exception as e:
        # Catch any other exceptions
        return JSONResponse(status_code=500, content={"detail": f"An unexpected error occurred: {str(e)}"})

# --- API Information Endpoint ---
@app.get("/api/info/", tags=["System"], summary="API Information")
async def api_info():
    """
    Get comprehensive API information and available endpoints.
    
    Returns detailed information about all API endpoints, their purposes,
    and usage examples for developers.
    """
    return {
        "title": "ClarifaiSQL API",
        "version": "1.0.0",
        "description": "AI-powered SQL query generation and feedback management system",
        "documentation_urls": {
            "swagger_ui": "/docs",
            "redoc": "/redoc", 
            "openapi_schema": "/openapi.json"
        },
        "endpoints": {
            "feedback": {
                "POST /feedback/": "Save user feedback",
                "GET /feedbacks/": "Get all feedbacks (admin)",
                "GET /feedback/{id}": "Get feedback by ID",
                "DELETE /feedback/{id}": "Delete feedback by ID",
                "GET /feedback/stats/": "Get feedback statistics"
            },
            "ai_query": {
                "POST /process-query/": "Process CSV and generate AI-powered SQL queries"
            },
            "system": {
                "GET /": "Root endpoint with API navigation",
                "GET /health/": "Health check for monitoring",
                "GET /api/info/": "API information and endpoint reference"
            }
        },
        "features": [
            "Automatic API documentation with Swagger UI",
            "AI-powered natural language to SQL conversion", 
            "CSV file processing and analysis",
            "Feedback collection and management",
            "Health monitoring and status checks",
            "Interactive API testing interface"
        ]
    }

# Optional: Add a datasets endpoint for better API completeness
@app.get("/api/datasets", tags=["AI Query"], summary="List Uploaded Datasets")
async def list_datasets():
    """
    List all currently uploaded datasets in memory.
    
    Note: This is a demo endpoint. In production, datasets would be
    stored in a persistent database or file system.
    """
    return {
        "datasets": list(uploaded_files.keys()),
        "count": len(uploaded_files),
        "note": "This endpoint shows in-memory datasets for demo purposes"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)