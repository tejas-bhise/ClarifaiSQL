# START PROJECT (MAC)

# BACKEND
cd ~/Desktop/clarifaisql/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload


# FRONTEND (new terminal)
cd ~/Desktop/clarifaisql/frontend
npm install
npm run dev


# OPEN IN BROWSER
http://localhost:3000/ai-tool