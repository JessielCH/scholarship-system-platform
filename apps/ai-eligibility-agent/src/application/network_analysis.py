from src.infrastructure.neo4j_repository import repository

def run_pagerank():
    print("Running PageRank algorithm on Neo4j Aura...")
    query = """
    CALL gds.pageRank.stream('ApplicantNetwork')
    YIELD nodeId, score
    RETURN gds.util.asNode(nodeId).name AS name, score
    ORDER BY score DESC, name ASC
    """
    try:
        results = repository.run_query(query)
        print("PageRank Results:")
        for record in results:
            print(f"{record['name']}: {record['score']}")
        return results
    except Exception as e:
        print(f"Error running PageRank: {e}")
        return []

if __name__ == "__main__":
    run_pagerank()
