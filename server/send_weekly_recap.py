"""Run once a week (for example from cron) to email the weekly recap to subscribers.

Example crontab line (every Monday at 8:00), edit the path to match your computer:
0 8 * * 1 cd /home/YOUR_USER/Desktop/client/server && venv/bin/python send_weekly_recap.py >> recap.log 2>&1
"""
from mailer import build_weekly_recap, send_to_subscribers

recap = build_weekly_recap()
if recap is None:
    print("No notices in the last 7 days. Nothing sent.")
else:
    print(send_to_subscribers(*recap))
