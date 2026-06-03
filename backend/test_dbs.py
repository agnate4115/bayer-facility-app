import os
import psycopg2
from azure.storage.blob import BlobServiceClient
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()

def test_postgres():
    print("Testing Postgres connection...")
    try:
        conn = psycopg2.connect(
            host=os.environ.get("PGHOST", "facility4115.postgres.database.azure.com"),
            database=os.environ.get("PGDATABASE", "postgres"),
            user=os.environ.get("PGUSER", "agnate"),
            password=os.environ.get("PGPASSWORD", "Epassword@_4"),
            port=os.environ.get("PGPORT", "5432"),
            connect_timeout=5
        )
        cur = conn.cursor()
        cur.execute("SELECT version();")
        db_version = cur.fetchone()
        print(f"✅ Postgres connection successful: {db_version[0]}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Postgres connection failed: {e}")

def test_blob_storage():
    print("Testing Azure Blob Storage connection...")
    try:
        connection_string = os.environ.get(
            "AZURE_STORAGE_CONNECTION_STRING",
            "DefaultEndpointsProtocol=https;AccountName=facilitydesk4115;AccountKey=XtSYJH54Z7SDeLpZv1HS36Pl/ttq22YbsE7oMxrJMxoplpsWy5P6bPFKHCEymT0tWD5a4NrC9jgQ+ASt5m08ZA==;EndpointSuffix=core.windows.net"
        )
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        containers = blob_service_client.list_containers()
        
        # consume the generator to test credentials
        container_list = [c.name for c in containers]
        print(f"✅ Azure Blob Storage connection successful. Found {len(container_list)} containers.")
    except Exception as e:
        print(f"❌ Azure Blob Storage connection failed: {e}")

def test_azure_openai():
    print("Testing Azure OpenAI connection...")
    try:
        client = AzureOpenAI(
            api_key=os.environ.get("AZURE_OPENAI_API_KEY", "4qWaLXeRSrj9Kpp7jzGoxgutH11njnnKRYo1PsoAtwpeKWyVJ1baJQQJ99BAACYeBjFXJ3w3AAABACOGOlkv"),  
            api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-06-01"),
            azure_endpoint=os.environ.get("AZURE_OPENAI_BASE_URL", "https://argusllm.openai.azure.com")
        )
        
        deployment_name = os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")
        
        # Make a small test completion
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say hello!"}
            ],
            max_tokens=10
        )
        print(f"✅ Azure OpenAI connection successful. Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ Azure OpenAI connection failed: {e}")

if __name__ == "__main__":
    test_postgres()
    print("-" * 40)
    test_blob_storage()
    print("-" * 40)
    test_azure_openai()
