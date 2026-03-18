import os

try:
    from fpdf import FPDF
except ImportError:
    import sys
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf2"])
    from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("helvetica", "B", 18)
pdf.cell(0, 12, "TypeMotion AI - Project Setup and Details", ln=True, align='C')
pdf.ln(10)

# Section 1: Admin Credentials
pdf.set_font("helvetica", "B", 14)
pdf.cell(0, 10, "1. Admin Credentials", ln=True)
pdf.set_font("helvetica", "", 12)
pdf.cell(0, 8, "Admin ID / Email: srivastavvaibhaw17@gmail.com", ln=True)
pdf.cell(0, 8, "Password: adminji@8539", ln=True)
pdf.cell(0, 8, "Role: Full access to Video Generation and Admin Dashboard.", ln=True)
pdf.ln(5)

# Section 2: Tech Stack
pdf.set_font("helvetica", "B", 14)
pdf.cell(0, 10, "2. Tech Stack Overview", ln=True)
pdf.set_font("helvetica", "B", 12)
pdf.cell(0, 8, "Frontend:")
pdf.set_font("helvetica", "", 12)
pdf.cell(0, 8, " Next.js (React), Tailwind CSS, TypeScript, Axios, js-cookie", ln=True)
pdf.set_font("helvetica", "B", 12)
pdf.cell(0, 8, "Backend:")
pdf.set_font("helvetica", "", 12)
pdf.cell(0, 8, " Python, FastAPI, Uvicorn, MoviePy, Pillow", ln=True)
pdf.set_font("helvetica", "B", 12)
pdf.cell(0, 8, "Database:")
pdf.set_font("helvetica", "", 12)
pdf.cell(0, 8, " JSON-based local DB (db.json)", ln=True)
pdf.ln(5)

# Section 3: How to Run
pdf.set_font("helvetica", "B", 14)
pdf.cell(0, 10, "3. Run Commands", ln=True)

pdf.set_fill_color(240, 240, 240)
# Backend
pdf.set_font("helvetica", "B", 12)
pdf.cell(0, 8, "Backend Initialization:", ln=True)
pdf.set_font("helvetica", "", 12)
pdf.multi_cell(0, 8, "1. Open a terminal and navigate to the 'python_backend' folder.\n2. Create a virtual environment (optional but recommended).\n3. Install dependencies:  pip install -r requirements.txt\n4. Start the server:  python main.py\n\nThe backend will be running at http://localhost:5000", border=1, fill=True)
pdf.ln(5)

# Frontend
pdf.set_font("helvetica", "B", 12)
pdf.cell(0, 8, "Frontend Initialization:", ln=True)
pdf.set_font("helvetica", "", 12)
pdf.multi_cell(0, 8, "1. Open a new terminal and navigate to the 'frontend' folder.\n2. Install Node packages:  npm install\n3. Start the dev server:  npm run dev\n\nThe frontend will be accessible at http://localhost:3000", border=1, fill=True)
pdf.ln(5)

# Section 4: Features
pdf.set_font("helvetica", "B", 14)
pdf.cell(0, 10, "4. Important Details & Roles", ln=True)
pdf.set_font("helvetica", "", 12)
pdf.multi_cell(0, 8, "- Normal Users: Must sign up with a unique phone number. They cannot generate videos instantly; instead, they are presented with a Payment Page and QR code upon clicking 'Unlock Video Generation'.\n- Payment Submission: Normal users fill out their Payer Name and Phone Number along with the payment, sending a request to the backend.\n- Admin Portal: The Admin can use the 'Admin Panel' to monitor user signups, overview generated videos, and track manual QR payment requests.")

pdf.output("d:/vscode/Typography app/TypeMotion_Project_Details.pdf")
print("PDF created successfully!")
