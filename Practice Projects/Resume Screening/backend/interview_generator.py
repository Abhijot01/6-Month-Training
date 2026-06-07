from langchain_core.prompts import PromptTemplate
from backend.scorer import get_llm
import json
import re


def generate_interview_questions(
    resume_text: str,
    job_description: str
):
    """
    Generate interview questions based on
    candidate resume and JD.
    """

    prompt = PromptTemplate.from_template(
    """
    You are a senior technical interviewer.

    Analyze BOTH:

    JOB DESCRIPTION: {job_description}

    CANDIDATE RESUME: {resume_text}

    Generate interview questions that are highly personalized.

    Rules:

    1. Generate 5 Resume-Based Technical Questions
    based on candidate skills, projects,
    technologies and experience.

    2. Generate 1 Skill-Gap Questions
    based on important skills missing from
    the candidate profile.

    3. Generate 3 Behavioral Questions.

    4. Generate 3 HR Questions.

    5. Questions must be specific to the candidate.

    6. Avoid generic questions.

    Return ONLY valid JSON.

    {{
        "resume_technical_questions": [
            "",
            "",
            "",
            "",
            ""
        ],

        "skill_gap_questions": [
            ""
        ],

        "behavioral_questions": [
            "",
            "",
            ""
        ],

        "hr_questions": [
            "",
            "",
            ""
        ]
    }}
    """
    )

    fallback = {
    "resume_technical_questions": [],
    "skill_gap_questions": [],
    "behavioral_questions": [],
    "hr_questions": []
    }

    try:

        llm = get_llm()

        chain = prompt | llm

        response = chain.invoke({
            "resume_text": resume_text[:7000],
            "job_description": job_description[:4000]
        })

        content = response.content

        match = re.search(
            r"\{[\s\S]*\}",
            content
        )

        if not match:
            return fallback

        parsed = json.loads(match.group())

        return {

            "resume_technical_questions":
                parsed.get(
                    "resume_technical_questions",
                    []
                ),

            "skill_gap_questions":
                parsed.get(
                    "skill_gap_questions",
                    []
                ),

            "behavioral_questions":
                parsed.get(
                    "behavioral_questions",
                    []
                ),

            "hr_questions":
                parsed.get(
                    "hr_questions",
                    []
                )
        }

    except Exception as e:

        print(
            f"Interview Generator Error: {e}"
        )

        return fallback