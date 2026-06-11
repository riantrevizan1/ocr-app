# OCR App

Aplicação web para extração de texto de PDFs e imagens usando OCR.

![Light mode](https://i.imgur.com/placeholder.png)

## Funcionalidades

- Upload de PDF ou imagem (JPG, PNG, WEBP)
- Extração de texto com Tesseract OCR
- Pré-processamento de imagem para melhor precisão
- Suporte a português e inglês
- Dark mode
- Copiar ou baixar o texto extraído em `.txt`
- Histórico de documentos processados
- Validação de tipo e tamanho de arquivo

## Tecnologias

**Frontend**
- React
- Tailwind CSS

**Backend**
- Python + FastAPI
- Tesseract OCR
- pdf2image + Pillow

## Como rodar localmente

### Pré-requisitos
- Node.js
- Python 3.9+
- Tesseract instalado (`brew install tesseract tesseract-lang`)
- Poppler instalado (`brew install poppler`)

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Acesse `http://localhost:3000`

## Estrutura

```
ocr-app/
├── backend/
│   ├── main.py
│   └── requirements.txt
└── frontend/
    └── src/
        └── App.js
```