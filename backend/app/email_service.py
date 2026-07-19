import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)


def send_email(to_email: str, subject: str, body_html: str) -> bool:
    if not SMTP_USER or not SMTP_PASS:
        print("[email] SMTP not configured - set SMTP_USER and SMTP_PASS")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = FROM_EMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(body_html, "html"))
        ctx = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=ctx)
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())
        print(f"[email] Sent to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"[email] Failed to send to {to_email}: {e}")
        return False


def send_screening_result(candidate_name: str, to_email: str, score: int, verdict: str, notes: str) -> bool:
    subject = f"Agentix AI - Your Screening Result: {verdict}"
    body = f"""<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #2563eb;">
            <h1 style="color: #2563eb; margin: 0;">Agentix AI</h1>
            <p style="color: #666; margin: 5px 0 0;">HR Manager - Automated Screening</p>
        </div>
        <div style="padding: 20px 0;">
            <h2>Hello {candidate_name},</h2>
            <p>Your application has been screened by our AI recruitment system.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Match Score</td><td style="padding: 10px; border-bottom: 1px solid #eee;">{score}/100</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Verdict</td><td style="padding: 10px; border-bottom: 1px solid #eee;">{verdict}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Notes</td><td style="padding: 10px; border-bottom: 1px solid #eee;">{notes}</td></tr>
            </table>
            <p>We will be in touch with next steps regarding your application.</p>
            <p style="color: #888; font-size: 12px; margin-top: 30px;">This is an automated message from Agentix AI HR Manager.</p>
        </div>
    </div>"""
    return send_email(to_email, subject, body)


def send_interview_invite(candidate_name: str, to_email: str, job_title: str, interview_date: Optional[str] = None) -> bool:
    date_str = interview_date or "to be scheduled"
    subject = f"Interview Invitation - {job_title} at Agentix"
    body = f"""<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #2563eb;">
            <h1 style="color: #2563eb; margin: 0;">Agentix AI</h1>
            <p style="color: #666; margin: 5px 0 0;">HR Manager - Interview Scheduling</p>
        </div>
        <div style="padding: 20px 0;">
            <h2>Congratulations {candidate_name}!</h2>
            <p>Based on your strong profile, we would like to invite you for an interview.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Position</td><td style="padding: 10px; border-bottom: 1px solid #eee;">{job_title}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Interview Date</td><td style="padding: 10px; border-bottom: 1px solid #eee;">{date_str}</td></tr>
            </table>
            <p>Please reply to this email to confirm your availability.</p>
            <p style="color: #888; font-size: 12px; margin-top: 30px;">This is an automated message from Agentix AI HR Manager.</p>
        </div>
    </div>"""
    return send_email(to_email, subject, body)
