import json
import logging
import uuid
from typing import List, Dict, Any, Tuple
from groq import Groq
from backend import config
from backend.services.rag_service import RAGService

logger = logging.getLogger(__name__)

# Initialize Groq client if key is available
groq_client = None
if config.GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=config.GROQ_API_KEY)
        print("[AI Agent] Groq Client initialized successfully with Llama 3.3 70B.")
    except Exception as e:
        logger.warning(f"[AI Agent] Failed to initialize Groq Client: {str(e)}")

SYSTEM_PROMPT = (
    "You are an expert HR recruiter and senior technical interviewer with 10+ years of experience "
    "helping students and freshers prepare for internships and jobs. Your goals are to deliver rigorous, "
    "constructive, highly professional, and recruiter-grade feedback."
)

class InterviewAgent:
    @staticmethod
    def _call_llm(system_prompt: str, user_prompt: str, json_mode: bool = True) -> str:
        """Call the Groq API using Llama 3.3 70B."""
        if not groq_client:
            raise ValueError("Groq API client is not configured.")

        try:
            response_format = {"type": "json_object"} if json_mode else None
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.3,
                response_format=response_format
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"[AI Agent] Groq API call failed: {str(e)}")
            raise e

    @staticmethod
    def analyze_resume(parsed_text: str) -> Dict[str, Any]:
        """Analyzes a resume to extract skills, compute ATS score, find strengths, weaknesses, and suggestions."""
        user_prompt = (
            "You are an expert ATS (Applicant Tracking System) optimizer and senior tech recruiter. "
            "Thoroughly analyze the following resume plaintext and deliver a rigorous, recruiter-grade analysis. "
            "Provide quantitative feedback on technical formatting, core credentials, and actionable ATS advice. "
            "Return a structural JSON object that matches this exact schema:\n"
            "{\n"
            "  \"ats_score\": number (out of 100, be strict and realistic),\n"
            "  \"skills\": [\"skill1\", \"skill2\", ...],\n"
            "  \"strengths\": [\"strength1\", \"strength2\", ...],\n"
            "  \"weakness\": [\"weakness1\", \"weakness2\", ...],\n"
            "  \"suggestions\": [\"suggestion1\", \"suggestion2\", ...]\n"
            "}\n\n"
            f"Resume Text:\n{parsed_text}"
        )

        if not groq_client:
            # Fallback Mock Resume Analysis
            print("[AI Agent] Running Mock Resume Analysis (No Groq API Key found)...")
            # Deduce mock skills by scanning the text
            mock_skills = []
            skills_to_check = ["Python", "JavaScript", "React", "Next.js", "Node.js", "Java", "C++", "SQL", "MongoDB", "Firebase", "Machine Learning", "AI", "LangChain", "FastAPI", "Docker", "Git", "Tailwind"]
            for skill in skills_to_check:
                if skill.lower() in parsed_text.lower():
                    mock_skills.append(skill)
            
            if not mock_skills:
                mock_skills = ["Python", "FastAPI", "Software Engineering"]

            return {
                "ats_score": 75 + (len(mock_skills) * 2) if len(mock_skills) < 10 else 92,
                "skills": mock_skills,
                "strengths": [
                    "Has practical experience with modern programming constructs.",
                    "Demonstrates solid educational credentials.",
                    f"Shows proficiency in key skills: {', '.join(mock_skills[:3])}."
                ],
                "weakness": [
                    "Missing explicitly detailed cloud deployment (AWS/GCP/Azure) experience.",
                    "Lacks quantitative metrics (e.g. '% optimization', 'scale numbers') in project achievements."
                ],
                "suggestions": [
                    "Integrate metrics and business impact figures inside project descriptions.",
                    "Add certification keywords for professional cloud architecture or Git workflows.",
                    "Ensure Git repositories are linked for your featured core projects."
                ]
            }

        try:
            raw_response = InterviewAgent._call_llm(SYSTEM_PROMPT, user_prompt, json_mode=True)
            return json.loads(raw_response)
        except Exception:
            # Graceful error fallback
            return InterviewAgent.analyze_resume(parsed_text)

    @staticmethod
    def generate_questions(user_id: str, skills: List[str], category: str, difficulty: str, count: int = 10) -> List[Dict[str, Any]]:
        """Generates structured interview questions customized to user skills and retrieved resume projects."""
        # Retrieve context from vector database
        query = f"projects education skills {category} {difficulty}"
        chunks = RAGService.retrieve_relevant_chunks(user_id, query, k=4)
        context = "\n---\n".join(chunks)

        user_prompt = (
            f"You are conducting a strict technical mock interview. Generate exactly {count} professional interview questions "
            f"in the category '{category}' at a '{difficulty}' level for a candidate with the following skills: {', '.join(skills)}.\n\n"
            f"Here is some relevant context from the candidate's resume:\n{context}\n\n"
            "Make questions highly specific. Formulate a mix of pure technical designs, project scenarios, "
            "and behavioral situations. Do not generate generic questions.\n"
            "Return a JSON object containing a list of questions, matching this exact schema:\n"
            "{\n"
            "  \"questions\": [\n"
            "    {\n"
            "      \"id\": \"string (unique, e.g. q1, q2...)\",\n"
            "      \"question_text\": \"string\",\n"
            "      \"category\": \"string (Technical | Behavioral | Project-based)\",\n"
            "      \"difficulty\": \"string (Beginner | Intermediate | Advanced)\"\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        if not groq_client:
            # Fallback Mock Question Generator
            print("[AI Agent] Generating Mock Questions (No Groq API Key found)...")
            mock_qs = []
            tech_skills = skills if skills else ["Python", "Web Development"]
            
            for i in range(1, count + 1):
                q_id = f"q{i}"
                if i % 3 == 1:
                    skill = tech_skills[(i // 3) % len(tech_skills)]
                    q_text = f"Can you explain the difference between a traditional approach and using {skill} in a scalable architecture?"
                    cat = "Technical"
                elif i % 3 == 2:
                    q_text = f"Describe a challenging project you built (possibly related to {tech_skills[0]}). What was the architecture and how did you resolve technical constraints?"
                    cat = "Project-based"
                else:
                    q_text = "Tell me about a time you worked in a team and faced a major conflict in design decisions. How did you negotiate and reach a resolution?"
                    cat = "Behavioral"

                mock_qs.append({
                    "id": q_id,
                    "question_text": q_text,
                    "category": cat,
                    "difficulty": difficulty
                })
            return mock_qs

        try:
            raw_response = InterviewAgent._call_llm(SYSTEM_PROMPT, user_prompt, json_mode=True)
            res_dict = json.loads(raw_response)
            return res_dict.get("questions", [])
        except Exception:
            return InterviewAgent.generate_questions(user_id, skills, category, difficulty, count)

    @staticmethod
    def evaluate_answer(question_text: str, user_answer: str, category: str) -> Dict[str, Any]:
        """Evaluates a single answer, providing scores and detailed recruiter critique."""
        user_prompt = (
            f"You are conducting a recruiter-grade job interview. Evaluate the candidate's answer to the following question:\n"
            f"Question: \"{question_text}\"\n"
            f"Question Category: \"{category}\"\n"
            f"Candidate's Answer: \"{user_answer}\"\n\n"
            "Assess the response with strict senior interviewer guidelines. Be critical about technical terminology, "
            "clarity, confidence, and metric-backed descriptions. Deduct score heavily for extremely short or circular answers.\n"
            "Provide a granular critique in the exact structural JSON schema below:\n"
            "{\n"
            "  \"score\": number (overall rating from 1.0 to 10.0, be critical),\n"
            "  \"feedback\": {\n"
            "    \"strengths\": [\"strength1\", \"strength2\"],\n"
            "    \"improvements\": [\"improvement1\", \"improvement2\"],\n"
            "    \"technical_accuracy\": \"string summary of technical performance\",\n"
            "    \"clarity\": \"string summary of communication clarity\"\n"
            "  }\n"
            "}"
        )

        if not groq_client:
            # Fallback Mock Answer Evaluation
            print("[AI Agent] Running Mock Answer Evaluation (No Groq API Key found)...")
            word_count = len(user_answer.split())
            if word_count < 5:
                score = 3.0
                strengths = ["Responded to the prompt."]
                improvements = ["Your answer is extremely short. Please explain in greater depth, ideally offering structural steps or code-level details."]
                accuracy = "Incomplete and lacking technical details."
                clarity = "Too brief to evaluate effectively."
            elif word_count < 20:
                score = 6.0
                strengths = ["Answered directly.", "Good basic vocabulary."]
                improvements = ["Expand with concrete examples from your past projects.", "Explain core underlying mechanics or trade-offs."]
                accuracy = "Acceptable high-level summary, but missing rigorous depth."
                clarity = "Clear but requires more elaboration."
            else:
                score = 8.5
                strengths = ["Detailed explanation.", "Structured response with architectural terms.", "Clear confidence in articulating the concept."]
                improvements = ["Specify performance implications or edge cases.", "Reduce minor filler words to improve communication flow."]
                accuracy = "Excellent accuracy! Captures all the main technical dimensions of the question."
                clarity = "Well structured, easy to follow, and professionally phrased."

            return {
                "score": score,
                "feedback": {
                    "strengths": strengths,
                    "improvements": improvements,
                    "technical_accuracy": accuracy,
                    "clarity": clarity
                }
            }

        try:
            raw_response = InterviewAgent._call_llm(SYSTEM_PROMPT, user_prompt, json_mode=True)
            return json.loads(raw_response)
        except Exception:
            return {
                "score": 7.0,
                "feedback": {
                    "strengths": ["Answered the question directly."],
                    "improvements": ["Flesh out technical descriptions with practical examples."],
                    "technical_accuracy": "Satisfactory explanation of primary concepts.",
                    "clarity": "Decent clarity, but formatting could be optimized."
                }
            }

    @staticmethod
    def generate_internship_recommendations(parsed_text: str, skills: List[str]) -> Dict[str, Any]:
        """Generates tailored internship recommendations, missing skills, suggested techs, and a weekly roadmap."""
        user_prompt = (
            "You are a senior tech recruiter helping freshers secure technical internships. Analyze the candidate's skills "
            "and resume text to formulate custom role alignments, identify technical skill gaps, and write a structured week-by-week learning roadmap.\n\n"
            "You MUST return a JSON object conforming exactly to this schema:\n"
            "{\n"
            "  \"recommended_roles\": [\"role1\", \"role2\", ...],\n"
            "  \"missing_skills\": [\"skill1\", \"skill2\", ...],\n"
            "  \"suggested_technologies\": [\"tech1\", \"tech2\", ...],\n"
            "  \"learning_roadmap\": [\n"
            "    {\n"
            "      \"week\": \"Week 1: [Topic Title]\",\n"
            "      \"focus\": \"string (focus description)\",\n"
            "      \"tasks\": [\"task1\", \"task2\", ...]\n"
            "    }\n"
            "  ]\n"
            "}\n\n"
            f"Candidate Skills: {', '.join(skills)}\n"
            f"Resume Text:\n{parsed_text}"
        )

        if not groq_client:
            # Local Mock Fallback
            print("[AI Agent] Running Mock Internship Recommendations (No Groq API Key found)...")
            return {
                "recommended_roles": ["Junior Python Developer", "FastAPI Backend Engineering Intern", "AI Engineer Associate"],
                "missing_skills": ["Docker Containerization", "CI/CD Pipeline Configurations", "Advanced System Design"],
                "suggested_technologies": ["Docker", "GitHub Actions", "Redis", "PostgreSQL"],
                "learning_roadmap": [
                    {
                        "week": "Week 1: Containerization with Docker",
                        "focus": "Master the basics of containerizing full-stack Python/FastAPI applications.",
                        "tasks": [
                            "Write multi-stage Dockerfiles for FastAPI backends and Next.js frontends.",
                            "Learn Docker Compose to orchestrate local MySQL and Redis services.",
                            "Optimize image build sizes using lightweight alpine/slim distributions."
                        ]
                    },
                    {
                        "week": "Week 2: Backend Caching & Redis Integration",
                        "focus": "Introduce caching layers to scale REST API response latency.",
                        "tasks": [
                            "Integrate Redis as an in-memory database cache in FastAPI.",
                            "Implement cache-invalidation strategies for dynamic data queries.",
                            "Measure request speedups using stress testing tools like Locust."
                        ]
                    },
                    {
                        "week": "Week 3: Continuous Integration & Deployments",
                        "focus": "Automate linting, unit tests, and remote cloud builds.",
                        "tasks": [
                            "Configure GitHub Actions to run pytest and ESLint on every push.",
                            "Set up automated build pipelines to push Docker images to Docker Hub.",
                            "Learn the basics of deploying containerized apps to Render, Heroku or GCP Cloud Run."
                        ]
                    }
                ]
            }

        try:
            raw_response = InterviewAgent._call_llm(SYSTEM_PROMPT, user_prompt, json_mode=True)
            return json.loads(raw_response)
        except Exception:
            return InterviewAgent.generate_internship_recommendations(parsed_text, skills)

    @staticmethod
    def generate_linkedin_profile(parsed_text: str, skills: List[str]) -> Dict[str, Any]:
        """Generates professional LinkedIn copies (headline, about, and resume summaries)."""
        user_prompt = (
            "Analyze the candidate's credentials and write search-engine-optimized professional LinkedIn copy "
            "that immediately hooks recruiters.\n\n"
            "You MUST return a JSON object conforming exactly to this schema:\n"
            "{\n"
            "  \"linkedin_headline\": \"string (punchy, SEO-optimized title containing core tech keywords, e.g. BCA | AIML | Python Dev | Building LLM Apps)\",\n"
            "  \"about_section\": \"string (3-paragraph professional bio emphasizing their developer journey, top projects, and active learning goals)\",\n"
            "  \"resume_summary\": \"string (3-sentence high-impact introductory profile summary to use at the top of their resume)\"\n"
            "}\n\n"
            f"Candidate Skills: {', '.join(skills)}\n"
            f"Resume Text:\n{parsed_text}"
        )

        if not groq_client:
            # Local Mock Fallback
            print("[AI Agent] Running Mock LinkedIn Generator (No Groq API Key found)...")
            return {
                "linkedin_headline": "BCA (AIML) Student | Python & AI Automation Developer | Building Scalable LLM Applications",
                "about_section": "Passionate BCA (AIML) student and self-driven developer specializing in AI automation, Python programming, and LLM application design. From founding modern web development workflows to crafting intelligent whatsapp agents and photoshoot automation frameworks, I focus on delivering scalable, high-performance digital products.\n\nWith extensive practical experience utilizing modern tools like FastAPI, LangChain, and vector embeddings, I enjoy resolving challenging architectural constraints and engineering optimized client solutions from scratch.\n\nActively looking for exciting backend and AI engineering internship opportunities where I can apply my automation expertise and contribute to real-world business optimization.",
                "resume_summary": "Highly motivated BCA student specializing in AI & Machine Learning with hands-on experience building automation workflows, Python REST APIs, and intelligent LLM applications. Proven entrepreneurship capability as the founder of an AI-driven web development agency, reducing turnaround times by 60%+. Seeking a technical internship to leverage expertise in FastAPI, LangChain, and RAG architectures."
            }

        try:
            raw_response = InterviewAgent._call_llm(SYSTEM_PROMPT, user_prompt, json_mode=True)
            return json.loads(raw_response)
        except Exception:
            return InterviewAgent.generate_linkedin_profile(parsed_text, skills)
