# KSTVET Student Portal (Group 6)

React (client/) + Flask JSON API (server/) + MySQL. Dummy data only.

## Backend
cd server
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then edit the values
mysql -u portal_user -p portal_db < schema.sql
python seed.py
flask --app app run --debug --port 5000

## Frontend
cd client
npm install
npm run dev
