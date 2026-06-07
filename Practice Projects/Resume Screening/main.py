# main.py
import streamlit as st
import os
import pandas as pd
from datetime import datetime

# Backend imports
from backend.parser import extract_text, extract_basic_info
from backend.embeddings import create_vector_store, save_vector_store, load_vector_store
from backend.scorer import rank_candidate
from backend.interview_generator import generate_interview_questions
from backend.similarity import (
    build_candidate_embeddings,
    find_similar_candidates
)

st.set_page_config(page_title="AI Resume Screener", layout="wide")
if "results" not in st.session_state:
    st.session_state.results = []

if "candidate_embeddings" not in st.session_state:
    st.session_state.candidate_embeddings = {}
st.title("🚀 AI-Powered Resume Screener")
st.markdown("### Using LLMs for Smart Candidate Ranking")

# Sidebar
with st.sidebar:
    st.header("Settings")
    api_key = st.text_input("GROQ API Key", type="password", value=os.getenv("GROQ_API_KEY", ""))
    if api_key:
        os.environ["GROQ_API_KEY"] = api_key
    
    st.divider()
    if st.button("Clear Vector Store"):
        if os.path.exists("vector_store"):
            import shutil
            shutil.rmtree("vector_store")
            st.success("Vector store cleared!")

# Main Tabs (Only 2 tabs now)
tab1, tab2 = st.tabs(["📤 Upload & Process Resumes", "🔍 Job Matching"])

# ------------------- TAB 1: Upload Resumes -------------------
with tab1:
    st.header("Upload Resumes")
    
    uploaded_files = st.file_uploader(
        "Upload PDF or DOCX resumes (multiple allowed)", 
        type=["pdf", "docx"],
        accept_multiple_files=True
    )
    
    if uploaded_files:
        if st.button("Process All Resumes", type="primary"):
            with st.spinner("Parsing resumes and creating vector store..."):
                texts = []
                metadatas = []
                
                for file in uploaded_files:
                    temp_path = f"temp_{file.name}"
                    with open(temp_path, "wb") as f:
                        f.write(file.getbuffer())
                    
                    text = extract_text(temp_path)
                    
                    # UPDATE: Added temp_path configuration mapping so parser fallback can resolve
                    # Kaggle files accurately if spaCy encounters nameless files
                    info = extract_basic_info(text, file_path=temp_path)
                    
                    texts.append(text)
                    metadatas.append({
                    "filename": file.name,
                    "name": info["name"],
                    "email": info["email"],
                    "skills": info["skills"],
                    "text": text,
                    "upload_date": datetime.now().strftime("%Y-%m-%d")
                })
                    
                    os.remove(temp_path)
                
                vector_store = create_vector_store(texts, metadatas)
                save_vector_store(vector_store)
                
                st.success(f"✅ Successfully processed {len(uploaded_files)} resumes!")
                st.balloons()

# ------------------- TAB 2: Job Matching -------------------
with tab2:
    st.header("Enter Job Description")
    
    job_description = st.text_area(
        "Paste the Job Description here:",
        height=250,
        placeholder="We are looking for candidates interested in teaching, agriculture and technology..."
    )
    
    top_k = st.slider("Number of candidates to shortlist", 3, 15, 5)
    
    if st.button("🔥 Rank Candidates", type="primary") and job_description:
        if not os.path.exists("vector_store"):
            st.error("No resumes found! Please upload and process resumes first in Tab 1.")
        else:
            with st.spinner("Analyzing candidates using AI..."):
                vector_store = load_vector_store()
                
                retriever = vector_store.as_retriever(search_kwargs={"k": top_k * 2})
                docs = retriever.invoke(job_description)
                
                results = []
                seen = set()
                
                for doc in docs:
                    metadata = doc.metadata
                    filename = metadata.get("filename")
                    if filename in seen:
                        continue
                    seen.add(filename)
                    
                    resume_text = metadata.get("text")

                    if not resume_text:
                        resume_text = doc.page_content

                    score_data = rank_candidate(
                        resume_text,
                        job_description
                    )

                    questions = generate_interview_questions(
                        resume_text,
                        job_description
                    )

                    score = score_data.get("score", 60)
                    score_breakdown = score_data.get(
                        "score_breakdown",
                        {}
                    )

                    summary = score_data.get(
                        "overall_summary",
                        "Candidate profile analyzed"
                    )

                    strengths = score_data.get("strengths", [])

                    weaknesses = score_data.get("weaknesses", [])

                    missing_skills = score_data.get(
                        "missing_skills",
                        []
                    )

                    learning_roadmap = score_data.get(
                        "learning_roadmap",
                        []
                    )

                    results.append({
                        "Name": metadata.get("name", "N/A"),
                        "Email": metadata.get("email", "N/A"),
                        "Score": score,
                        "Skills": ", ".join(metadata.get("skills", []))[:120],
                        "Strengths": ", ".join(strengths)[:150],
                        "Weaknesses": ", ".join(weaknesses)[:120],
                        "Missing Skills": ", ".join(missing_skills)[:200],
                        "Learning Roadmap": ", ".join(learning_roadmap)[:200],
                        "Summary": (
                            summary[:200] + "..."
                            if len(summary) > 200
                            else summary
                        ),
                        "Skills Match":
                            score_breakdown.get(
                                "skills_match",
                                0
                            ),

                        "Experience Match":
                            score_breakdown.get(
                                "experience_match",
                                0
                            ),

                        "Education Match":
                            score_breakdown.get(
                                "education_match",
                                0
                            ),

                        "Domain Match":
                            score_breakdown.get(
                                "domain_match",
                                0
                            ),
                        "Filename": filename,

                        "Technical Questions":
                        "\n".join(
                            questions.get(
                                "resume_technical_questions",
                                []
                            )
                        ),

                    "Behavioral Questions":
                        "\n".join(
                            questions.get(
                                "behavioral_questions",
                                []
                            )
                        ),

                    "HR Questions":
                        "\n".join(
                            questions.get(
                                "hr_questions",
                                []
                            )
                        ),
                    "Skill Gap Questions":
                        "\n".join(
                            questions.get(
                                "skill_gap_questions",
                                []
                            )
                        ),
                    })
                
                # Final Display
                st.session_state.results = results
                st.session_state.candidate_embeddings = (
                    build_candidate_embeddings(
                        results
                    )
                )

                if st.session_state.results:

                    results = st.session_state.results

                    results_df = pd.DataFrame(results)

                    results_df = results_df.sort_values(
                        by="Score",
                        ascending=False
                    )

                    st.success("✅ Ranking Complete!")

                    st.dataframe(
                        results_df,
                        width="stretch",
                        hide_index=True,
                        column_config={
                            "Score":
                            st.column_config.ProgressColumn(
                                "Match Score",
                                min_value=0,
                                max_value=100,
                                format="%d"
                            )
                        }
                    )

                    st.divider()

                    st.subheader(
                        "🔍 Candidate Similarity Search"
                    )

                    candidate_names = [
                        r["Name"]
                        for r in results
                    ]

                    selected_candidate = st.selectbox(
                        "Select Candidate",
                        candidate_names,
                        key="similarity_select"
                    )

                    similar_candidates = find_similar_candidates(
                        selected_candidate,
                        st.session_state.candidate_embeddings,
                        top_k=3
                    )

                    if similar_candidates:

                        st.write(
                            f"Candidates most similar to "
                            f"**{selected_candidate}**"
                        )

                        for name, score in similar_candidates:

                            st.progress(
                                min(score / 100, 1.0)
                            )

                            st.write(
                                f"**{name}** — {score:.2f}% similarity"
                            )

                    for result in results:

                        st.subheader(
                        "📊 ATS Score Breakdown"
                        )

                        st.write(
                            f"Skills Match: "
                            f"{result['Skills Match']}/40"
                        )

                        st.progress(
                            result["Skills Match"] / 40
                        )

                        st.write(
                            f"Experience Match: "
                            f"{result['Experience Match']}/30"
                        )

                        st.progress(
                            result["Experience Match"] / 30
                        )

                        st.write(
                            f"Education Match: "
                            f"{result['Education Match']}/15"
                        )

                        st.progress(
                            result["Education Match"] / 15
                        )

                        st.write(
                            f"Domain Match: "
                            f"{result['Domain Match']}/15"
                        )

                        st.progress(
                            result["Domain Match"] / 15
                        )


                        with st.expander(
                            f"Interview Questions - {result['Name']}"
                        ):

                            st.subheader(
                                "Technical Questions"
                            )

                            for q in result[
                                "Technical Questions"
                            ].split("\n"):

                                if q.strip():
                                    st.write(f"• {q}")

                            st.subheader(
                                "Skill Gap Questions"
                            )

                            for q in result[
                                "Skill Gap Questions"
                            ].split("\n"):

                                if q.strip():
                                    st.write(f"• {q}")

                            st.subheader(
                                "Behavioral Questions"
                            )

                            for q in result[
                                "Behavioral Questions"
                            ].split("\n"):

                                if q.strip():
                                    st.write(f"• {q}")

                            st.subheader(
                                "HR Questions"
                            )

                            for q in result[
                                "HR Questions"
                            ].split("\n"):

                                if q.strip():
                                    st.write(f"• {q}")
                    

st.caption("AI Resume Screener • Built with LangChain + Streamlit")