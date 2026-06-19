from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
import sqlite3

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# DATABASE
# -----------------------

import os

os.makedirs("data", exist_ok=True)

conn = sqlite3.connect(
    "data/travel.db",
    check_same_thread=False
)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS history(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    answer TEXT
)
""")

conn.commit()

# -----------------------
# GROQ
# -----------------------

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# -----------------------
# REQUEST MODEL
# -----------------------

class TravelRequest(BaseModel):
    text: str

# -----------------------
# AI GENERATE
# -----------------------

@app.post("/generate")
def generate(data: TravelRequest):

    prompt = f"""
You are an AI Travel Planner.

Create a BEAUTIFULLY STRUCTURED travel plan.

🌍 DESTINATION OVERVIEW

📍 Location:
...

🌤 Best Time to Visit:
...

🚗 How to Reach:
...

🏨 Recommended Hotels:
• Hotel 1
• Hotel 2
• Hotel 3

📅 DAY 1:
• Activity
• Activity

📅 DAY 2:
• Activity
• Activity

🍽 Famous Foods:
• Food
• Food

💰 Estimated Budget:
...

⚠ Travel Tips:
• Tip
• Tip

Generate a detailed plan for:

{data.text}

"""

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    response = completion.choices[0].message.content

    cursor.execute(
        "INSERT INTO history(question,answer) VALUES (?,?)",
        (data.text, response)
    )

    conn.commit()

    return {
        "response": response
    }

# -----------------------
# HISTORY
# -----------------------

@app.get("/history")
def history():

    cursor.execute(
        "SELECT * FROM history ORDER BY id DESC"
    )

    return {
        "history": cursor.fetchall()
    }

# -----------------------
# CLEAR HISTORY
# -----------------------

@app.delete("/clear")
def clear():

    cursor.execute("DELETE FROM history")
    conn.commit()

    return {
        "message": "History cleared"
    }

# -----------------------
# DESTINATIONS
# -----------------------

@app.get("/destinations")
def destinations():

    return {
        "destinations": [
            {
                "name": "Munnar",
                "description": "Tea plantations, hills and lakes",
                "best_time": "September - March",
                "budget": "₹5000 - ₹10000"
            },
            {
                "name": "Goa",
                "description": "Beaches, nightlife and water sports",
                "best_time": "November - February",
                "budget": "₹7000 - ₹15000"
            },
            {
                "name": "Wayanad",
                "description": "Nature, waterfalls and trekking",
                "best_time": "October - May",
                "budget": "₹4000 - ₹8000"
            },
            {
                "name": "Kashmir",
                "description": "Snow mountains, lakes and gardens",
                "best_time": "March - October",
                "budget": "₹10000 - ₹25000"
            }
        ]
    }

# -----------------------
# TRAVEL TIPS
# -----------------------

@app.get("/tips/{place}")
def tips(place: str):

    tips_data = {
        "munnar": [
            "Carry warm clothes",
            "Visit Top Station early",
            "Book hotels in advance",
            "Try local tea plantations"
        ],
        "goa": [
            "Use sunscreen",
            "Book water sports early",
            "Avoid isolated beaches at night",
            "Carry light clothes"
        ],
        "wayanad": [
            "Carry trekking shoes",
            "Keep rain protection ready",
            "Visit waterfalls early"
        ],
        "kashmir": [
            "Carry winter clothes",
            "Check weather forecast",
            "Keep ID proof ready"
        ]
    }

    return {
        "tips": tips_data.get(place.lower(), [])
    }