from sklearn.metrics.pairwise import cosine_similarity
from backend.embeddings import get_embeddings


def build_candidate_embeddings(results):
    """
    Create embeddings for each candidate.
    """

    embeddings_model = get_embeddings()

    candidate_embeddings = {}

    for result in results:

        candidate_name = result.get(
            "Name",
            "Unknown"
        )

        profile_text = f"""
        {result.get("Skills", "")}
        {result.get("Summary", "")}
        {result.get("Strengths", "")}
        """

        vector = embeddings_model.embed_query(
            profile_text
        )

        candidate_embeddings[
            candidate_name
        ] = vector

    return candidate_embeddings


def find_similar_candidates(
    candidate_name,
    candidate_embeddings,
    top_k=3
):
    """
    Find nearest candidates using cosine similarity.
    """

    if candidate_name not in candidate_embeddings:
        return []

    target_vector = candidate_embeddings[
        candidate_name
    ]

    similarities = []

    for name, vector in candidate_embeddings.items():

        if name == candidate_name:
            continue

        score = cosine_similarity(
            [target_vector],
            [vector]
        )[0][0]

        similarities.append(
            (
                name,
                round(score * 100, 2)
            )
        )

    similarities.sort(
        key=lambda x: x[1],
        reverse=True
    )

    return similarities[:top_k]