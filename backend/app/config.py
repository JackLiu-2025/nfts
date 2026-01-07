from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Blockchain
    CONTRACT_ADDRESS: str
    RPC_URL: str
    CHAIN_ID: int
    
    # IPFS
    IPFS_GATEWAY: str = "https://gateway.pinata.cloud/ipfs/"
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"
    
    # Indexer
    INDEXER_START_BLOCK: int = 0
    INDEXER_INTERVAL: int = 5
    MAX_BLOCK_RANGE: int = 50
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
