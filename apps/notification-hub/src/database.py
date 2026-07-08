import os
import time
from datetime import datetime
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider

CASSANDRA_HOST = os.getenv("CASSANDRA_HOST", "localhost")
CASSANDRA_PORT = int(os.getenv("CASSANDRA_PORT", 9042))
CASSANDRA_USER = os.getenv("CASSANDRA_USER", "")
CASSANDRA_PASSWORD = os.getenv("CASSANDRA_PASSWORD", "")
ASTRA_DB_SECURE_BUNDLE_PATH = os.getenv("ASTRA_DB_SECURE_BUNDLE_PATH", "")

KEYSPACE = "scholarship_system"

class CassandraDB:
    def __init__(self):
        self.cluster = None
        self.session = None
        self.insert_stmt = None

    def connect(self, retries=5, delay=5):
        for attempt in range(retries):
            try:
                if ASTRA_DB_SECURE_BUNDLE_PATH and os.path.exists(ASTRA_DB_SECURE_BUNDLE_PATH):
                    # Connect to DataStax Astra
                    cloud_config = {
                        'secure_connect_bundle': ASTRA_DB_SECURE_BUNDLE_PATH
                    }
                    auth_provider = PlainTextAuthProvider(CASSANDRA_USER, CASSANDRA_PASSWORD)
                    self.cluster = Cluster(cloud=cloud_config, auth_provider=auth_provider)
                else:
                    # Local Connection
                    self.cluster = Cluster([CASSANDRA_HOST], port=CASSANDRA_PORT)
                
                self.session = self.cluster.connect()
                print("Successfully connected to Cassandra!")
                self._initialize_schema()
                return
            except Exception as e:
                print(f"Failed to connect to Cassandra (Attempt {attempt+1}/{retries}): {e}")
                time.sleep(delay)
        
        print("Warning: Could not connect to Cassandra after retries. Operating without database.")

    def disconnect(self):
        if self.cluster:
            self.cluster.shutdown()

    def _initialize_schema(self):
        if not ASTRA_DB_SECURE_BUNDLE_PATH:
            self.session.execute(f"""
                CREATE KEYSPACE IF NOT EXISTS {KEYSPACE}
                WITH replication = {{'class': 'SimpleStrategy', 'replication_factor': 1}}
            """)
        
        self.session.set_keyspace(KEYSPACE)

        self.session.execute(f"""
            CREATE TABLE IF NOT EXISTS notification_logs (
                student_id text,
                sent_at timestamp,
                message text,
                type text,
                topic text,
                status text,
                PRIMARY KEY (student_id, sent_at)
            ) WITH CLUSTERING ORDER BY (sent_at DESC);
        """)
        
        self.insert_stmt = self.session.prepare(f"""
            INSERT INTO {KEYSPACE}.notification_logs (student_id, sent_at, message, type, topic, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """)

    def insert_notification_log(self, student_id: str, sent_at: datetime, message: str, type: str, topic: str, status: str):
        if self.session and self.insert_stmt:
            try:
                self.session.execute_async(self.insert_stmt, (student_id, sent_at, message, type, topic, status))
            except Exception as e:
                print(f"Failed to insert notification log: {e}")

db = CassandraDB()
