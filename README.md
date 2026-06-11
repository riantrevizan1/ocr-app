# ocr-app

Extrai texto de PDFs e imagens direto no browser. Construído com React, FastAPI e Tesseract OCR.

## stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Python, FastAPI
- **OCR:** Tesseract + pdf2image + Pillow

## funcionalidades

- upload de PDF ou imagem (JPG, PNG, WEBP)
- pré-processamento automático de imagem para melhorar a leitura
- suporte a português e inglês
- dark mode
- copiar ou baixar o resultado em `.txt`
- histórico da sessão
- validação de tipo e tamanho (máx. 10MB)

## rodar localmente

**requisitos:** Node.js, Python 3.9+, Tesseract e Poppler instalados

```bash
# backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# frontend
cd frontend
npm install
npm start
```

Acesse `http://localhost:3000`

## estrutura

```
ocr-app/
├── backend/
│   ├── main.py
│   └── requirements.txt
└── frontend/
    └── src/
        └── App.js
```