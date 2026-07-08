import os
from neo4j import GraphDatabase

class Neo4jRepository:
    def __init__(self):
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def get_session(self):
        return self.driver.session()

    def run_query(self, query, parameters=None):
        with self.get_session() as session:
            result = session.run(query, parameters)
            return [record for record in result]

repository = Neo4jRepository()
