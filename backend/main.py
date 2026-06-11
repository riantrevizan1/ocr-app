from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image, ImageFilter, ImageEnhance
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TAMANHO_MAXIMO = 10 * 1024 * 1024  # 10MB
TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/tiff"]

def preprocessar(img: Image.Image) -> Image.Image:
    img = img.convert("L")
    img = ImageEnhance.Contrast(img).enhance(2.0)
    img = img.filter(ImageFilter.SHARPEN)
    largura, altura = img.size
    if largura < 1000:
        img = img.resize((largura * 2, altura * 2), Image.LANCZOS)
    return img

@app.get("/")
def root():
    return {"message": "OCR API rodando!"}

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    contents = await file.read()

    if len(contents) > TAMANHO_MAXIMO:
        raise HTTPException(status_code=400, detail="Arquivo muito grande. Limite é 10MB.")

    if file.content_type not in TIPOS_PERMITIDOS:
        raise HTTPException(status_code=400, detail=f"Tipo de arquivo não suportado: {file.content_type}. Use PDF, JPG, PNG ou WEBP.")

    try:
        if file.content_type == "application/pdf":
            images = convert_from_bytes(contents)
        else:
            images = [Image.open(io.BytesIO(contents))]
    except Exception:
        raise HTTPException(status_code=422, detail="Não foi possível abrir o arquivo. Ele pode estar corrompido.")

    try:
        texto = ""
        for img in images:
            img_processada = preprocessar(img)
            texto += pytesseract.image_to_string(img_processada, lang="por+eng") + "\n"
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao processar o OCR. Tente com outro arquivo.")

    if not texto.strip():
        raise HTTPException(status_code=422, detail="Nenhum texto encontrado no arquivo.")

    return {"filename": file.filename, "text": texto.strip()}