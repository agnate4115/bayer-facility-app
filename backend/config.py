from pydantic_settings import BaseSettings, SettingsConfigDict
import urllib.parse

class Settings(BaseSettings):
    PGHOST: str
    PGUSER: str
    PGPORT: str
    PGDATABASE: str
    PGPASSWORD: str

    ENABLE_AZURE_INTEGRATION: bool = False
    AZURE_CLIENT_ID: str = ""
    AZURE_TENANT_ID: str = ""
    AZURE_CLIENT_SECRET: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"

    @property
    def database_url(self) -> str:
        # PostgreSQL connection URL format
        encoded_password = urllib.parse.quote_plus(self.PGPASSWORD)
        return f"postgresql://{self.PGUSER}:{encoded_password}@{self.PGHOST}:{self.PGPORT}/{self.PGDATABASE}?sslmode=require"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
