# AI BORA - Proposal and Client Management System

AI BORA is a web platform developed to manage budgets, handle client work, manage tasks, and provide a "Client Area" where clients can track the status of their requested services.

## 🚀 Main Technologies
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **Backend / BaaS**: Firebase (Auth, Firestore, Storage)
- **Language**: TypeScript
- **Routing**: Wouter

## ⚙️ Application Structure
- **Sales/Collab Dashboard:** (`/vendas`).
- **Admin Dashboard:** (`/admin`).
- **Client Portal:** (`/c/:id`) where the client views task progress, descriptions, and deliverable links.
- **Portfolio / Landing:** Various pages such as `/servicos`, `/packs`, `/prompts`, `/orcamento`.

## 🛠️ Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Variables:
   Copy the base environment content (or what you have configured in Firebase/EmailJS) to your local `.env` file.

3. Run the Project:
   ```bash
   npm run dev
   ```
   The server will start on local port 3000.
