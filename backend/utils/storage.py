import os
from azure.storage.blob import BlobServiceClient, ContentSettings, BlobSasPermissions, generate_blob_sas
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

def upload_to_blob(file_bytes: bytes, blob_name: str, content_type: str, container_name: str = "uploads") -> str:
    connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not connection_string:
        print("AZURE_STORAGE_CONNECTION_STRING not set")
        return ""
    
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    
    # Create container if it doesn't exist
    container_client = blob_service_client.get_container_client(container_name)
    if not container_client.exists():
        container_client.create_container()
        
    blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
    
    content_settings = ContentSettings(content_type=content_type)
    blob_client.upload_blob(file_bytes, overwrite=True, content_settings=content_settings)
    
    sas_token = generate_blob_sas(
        account_name=blob_service_client.account_name,
        container_name=container_name,
        blob_name=blob_name,
        account_key=blob_service_client.credential.account_key,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(days=3650)
    )
    
    return f"{blob_client.url}?{sas_token}"
