import os
import re
from typing import Dict

from docx import Document
from pypdf import PdfReader
import spacy


# Load spaCy model once
nlp = spacy.load("en_core_web_sm")


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from PDF file.
    """

    try:
        reader = PdfReader(pdf_path)
        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text.strip()

    except Exception as e:
        return f"Error reading PDF: {str(e)}"


def extract_text_from_docx(docx_path: str) -> str:
    """
    Extract text from DOCX file.
    """

    try:
        doc = Document(docx_path)

        text = "\n".join([
            para.text for para in doc.paragraphs
            if para.text.strip()
        ])

        return text.strip()

    except Exception as e:
        return f"Error reading DOCX: {str(e)}"


def extract_text(file_path: str) -> str:
    """
    Extract text from supported file formats.
    """

    if not os.path.exists(file_path):
        return f"File not found: {file_path}"

    extension = file_path.lower()

    if extension.endswith(".pdf"):
        return extract_text_from_pdf(file_path)

    elif extension.endswith((".docx", ".doc")):
        return extract_text_from_docx(file_path)

    return "Unsupported file format"


def clean_candidate_name(name: str) -> str:
    """
    Clean extracted names.
    """

    name = re.sub(r"[^A-Za-z\s]", "", name)
    name = re.sub(r"\s+", " ", name).strip()

    return name.title()


def extract_basic_info(text: str, file_path: str = "") -> Dict:
    """
    Extract candidate information.
    """

    info = {
        "name": "Not Found",
        "email": "Not Found",
        "phone": "Not Found",
        "skills": []
    }

    if not text:
        return info

    # EMAIL
    email_match = re.search(
        r"[\w\.-]+@[\w\.-]+\.\w+",
        text
    )

    if email_match:
        info["email"] = email_match.group(0)

    # PHONE
    phone_match = re.search(
        r"(?:\+91[-\s]?)?[6-9]\d{9}",
        text
    )

    if phone_match:
        info["phone"] = phone_match.group(0)

    # NAME EXTRACTION

    extracted_name = None

    blacklist = {
        "summary",
        "experience",
        "skills",
        "manager",
        "developer",
        "engineer",
        "associate",
        "profile",
        "resume",
        "curriculum",
        "vitae",
        "intern",

        # location words
        "ludhiana",
        "punjab",
        "india",
        "expected",
        "model",
        "town",
        "college",
        "university",
        "road",
        "street",
        "district"
    }

    # --------------------------------------------------
    # STEP 1
    # Check first lines of resume
    # --------------------------------------------------

    lines = [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]

    for line in lines[:10]:

        clean_line = clean_candidate_name(line)

        words = clean_line.split()

        if not (2 <= len(words) <= 4):
            continue

        # reject locations / headings
        if any(
            word.lower() in blacklist
            for word in words
        ):
            continue

        # candidate names are usually alphabetic
        if all(word.isalpha() for word in words):

            extracted_name = clean_line
            break

    # --------------------------------------------------
    # STEP 2
    # spaCy fallback
    # --------------------------------------------------

    if not extracted_name:

        try:

            doc = nlp(text[:1500])

            for ent in doc.ents:

                if ent.label_ != "PERSON":
                    continue

                candidate = clean_candidate_name(ent.text)

                words = candidate.split()

                if not (2 <= len(words) <= 4):
                    continue

                if any(
                    word.lower() in blacklist
                    for word in words
                ):
                    continue

                extracted_name = candidate
                break

        except Exception:
            pass

    # --------------------------------------------------
    # STEP 3
    # filename fallback
    # --------------------------------------------------

    if not extracted_name and file_path:

        filename = os.path.splitext(
            os.path.basename(file_path)
        )[0]

        filename = filename.replace("_", " ")
        filename = filename.replace("-", " ")

        extracted_name = clean_candidate_name(
            filename
        )

    info["name"] = extracted_name or "Not Found"

    # SKILLS
    common_skills = [
        "python",
        "java",
        "javascript",
        "react",
        "angular",
        "sql",
        "mysql",
        "postgresql",
        "machine learning",
        "deep learning",
        "nlp",
        "aws",
        "azure",
        "docker",
        "kubernetes",
        "git",
        "pandas",
        "numpy",
        "tensorflow",
        "pytorch",
        "django",
        "flask",
        "html",
        "css",
        "streamlit",
        "langchain",
        "faiss",
        "communication",
        "leadership"
    ]

    text_lower = text.lower()

    found_skills = []

    for skill in common_skills:

        if re.search(rf"\b{re.escape(skill)}\b", text_lower):
            found_skills.append(skill.title())

    info["skills"] = sorted(list(set(found_skills)))

    return info