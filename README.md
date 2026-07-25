# AgriTech Farming Dashboard (KrishiNidhi)

An intelligent smart-farming portal featuring machine learning crop recommendations, AI vision leaf disease detection, and generative AI conversational assistance.

## Interfaces Available

1. **Streamlit Premium Dashboard (Recommended for Quick Deployment)**
   - A single-page data app combining real-time IoT monitoring, crop advice sliders, leaf disease analysis with translated action plans, SMS alert dispatching, and the KrishiNidhi chatbot.
   - Designed for easy deployment to **Streamlit Community Cloud** directly from your GitHub repository.
2. **Next.js Frontend & FastAPI Backend Stack**
   - High-scale production layout with a detached React/Next.js client and modular API endpoints.

---

## Project Structure

- `streamlit_app.py` - Single-entry Streamlit application (root level).
- `requirements.txt` - Python dependencies for Streamlit and general services.
- `backend/` - FastAPI backend directory with ML, database schemas, and AI services.
- `frontend/` - Next.js 14 client application with Tailwind CSS and Recharts.

---

## Getting Started

### Option A: Running the Streamlit Application (Recommended)

1. **Install Python dependencies:**
   Make sure you are in the project root directory:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the project root (or inside `backend/` as `.env` is loaded automatically) with the following keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   TWILIO_ACCOUNT_SID=your_twilio_sid_here
   TWILIO_AUTH_TOKEN=your_twilio_token_here
   TWILIO_FROM_NUMBER=your_twilio_sender_number
   TWILIO_TO_NUMBER=your_operator_number
   ```

3. **Run Streamlit:**
   ```bash
   streamlit run streamlit_app.py
   ```
   The portal will be available at `http://localhost:8501`.

---

### Option B: Running Next.js + FastAPI Stack

#### 1. Start the FastAPI Backend
Open a terminal and navigate to the `backend/` directory:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The FastAPI server will start at `http://localhost:8000`.

#### 2. Start the Next.js Frontend
Open a new terminal and navigate to the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:3000`.

---

## Deployment to Streamlit Community Cloud

The repository is pre-configured for direct Streamlit deployment:
1. Push your changes to GitHub (with `streamlit_app.py` at the root and `requirements.txt` in the root).
2. Log in to [Streamlit Share](https://share.streamlit.io/).
3. Connect your repository and select `streamlit_app.py` as the entrypoint.
4. Add your secrets (`GEMINI_API_KEY`, etc.) in the Streamlit Cloud Dashboard settings under "Secrets".
