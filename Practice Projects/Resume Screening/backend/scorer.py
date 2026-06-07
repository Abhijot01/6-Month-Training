import json
import os
import re

import streamlit as st
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq


load_dotenv()


def get_llm(temperature=0.1):
    """
    Create Groq LLM instance.
    """

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError(
            "GROQ_API_KEY is missing from environment variables."
        )

    return ChatGroq(
        groq_api_key=api_key,
        model_name="llama-3.3-70b-versatile",
        temperature=temperature,
        max_tokens=1000
    )


def extract_json_from_text(text: str) -> dict:
    """
    Extract JSON safely from LLM response.
    """

    fallback = {
    "score": 60,

    "score_breakdown": {
        "skills_match": 20,
        "experience_match": 15,
        "education_match": 10,
        "domain_match": 10
    },

    "strengths": [
        "Unable to parse structured strengths"
    ],

    "weaknesses": [
        "LLM response formatting issue"
    ],

    "missing_skills": [],

    "learning_roadmap": [],

    "overall_summary":
        "Candidate evaluation completed with formatting issues."
}

    try:

        if not text:
            return fallback

        cleaned_text = text.strip()

        cleaned_text = re.sub(
            r"^```json",
            "",
            cleaned_text,
            flags=re.IGNORECASE
        )

        cleaned_text = re.sub(
            r"```$",
            "",
            cleaned_text
        )

        match = re.search(
            r"\{[\s\S]*\}",
            cleaned_text
        )

        if not match:
            print("\n❌ No JSON found in response")
            return fallback

        json_text = match.group(0)

        print("\n========== EXTRACTED JSON ==========")
        print(json_text)
        print("===================================\n")

        parsed = json.loads(json_text)
        print("\n========== EXTRACTED JSON ==========\n")
        print(json.dumps(parsed, indent=4))
        print("\n===================================\n")
        
        return {
            "score": int(parsed.get("score", 60)),

            "score_breakdown":
                parsed.get(
                    "score_breakdown",
                    {
                        "skills_match": 20,
                        "experience_match": 15,
                        "education_match": 10,
                        "domain_match": 10
                    }
                ),

            "strengths": parsed.get("strengths", []),

            "weaknesses": parsed.get("weaknesses", []),

            "missing_skills": parsed.get(
                "missing_skills",
                []
            ),

            "learning_roadmap": parsed.get(
                "learning_roadmap",
                []
            ),

            "overall_summary": parsed.get(
                "overall_summary",
                "No summary available"
            )
        }

    except Exception as e:

        print(f"\n❌ JSON parsing error: {e}\n")

        return fallback


def rank_candidate(
    resume_text: str,
    job_description: str
) -> dict:
    """
    Rank candidate against job description.
    """

    prompt = PromptTemplate.from_template(
        """
You are a professional HR recruiter and ATS evaluator.

Analyze the candidate resume against the job description.

JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

Provide a score_breakdown.

Rules:

skills_match: 0-40
experience_match: 0-30
education_match: 0-15
domain_match: 0-15

Total should approximately equal score.

Instructions:

1. Score candidate between 0 and 100.
2. Identify strengths.
3. Identify weaknesses.
4. Identify missing skills from the job description.
5. Generate a learning roadmap for missing skills.
6. Provide a concise summary.
7. missing_skills MUST be a list.
8. learning_roadmap MUST be a list.
9. Return ONLY valid JSON.
10. Do not return markdown.

Required JSON Format:

{{
    "score": 85,
    "strengths": [
        "Strong Python background",
        "Experience with NLP"
    ],
    "weaknesses": [
        "Missing cloud deployment experience"
    ],
    "missing_skills": [
        "AWS",
        "Docker"
    ],
    "learning_roadmap": [
        "Learn AWS fundamentals",
        "Build Docker projects"
    ],
    "overall_summary": "Candidate demonstrates strong backend AI development skills."
}}

"""
    )

    try:

        llm = get_llm()

        chain = prompt | llm

        response = chain.invoke({
            "job_description": job_description[:4000],
            "resume_text": resume_text[:7000]
        })

        print("\n====================================")
        print("RAW LLM RESPONSE")
        print("====================================")
        print(response.content)
        print("====================================\n")

        if response and response.content:

            print("\n========== RAW LLM RESPONSE ==========\n")
            print(response.content)
            print("\n=====================================\n")

            return extract_json_from_text(
                response.content
            )

    except Exception as e:

        print(f"\n❌ LLM Error: {e}\n")

        st.error(f"LLM Error: {e}")

    return {
        "score": 50,

        "score_breakdown": {
        "skills_match": 35,
        "experience_match": 25,
        "education_match": 10,
        "domain_match": 15},

        "strengths": [
            "Resume parsed successfully"
        ],
        "weaknesses": [
            "LLM evaluation unavailable"
        ],
        "missing_skills": [],
        "learning_roadmap": [],
        "overall_summary":
            "Fallback evaluation generated because the AI endpoint failed."
    }