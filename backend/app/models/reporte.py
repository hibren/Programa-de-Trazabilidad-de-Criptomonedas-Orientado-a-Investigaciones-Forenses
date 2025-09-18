from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.database import PyObjectId

class Reporte(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    chainabuse_id: Optional[str] = None
    id_direccion: str
    scamCategory: str
    createdAt: datetime
    trusted: bool
    domains: List[str]

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str,
            datetime: lambda dt: dt.isoformat(),
        }
        allow_population_by_field_name = True
        by_alias = True
        schema_extra = {
            "example": {
                "_id": "68c95ff85c5180f9ff238ec7",
                "chainabuse_id": "rep_123456789",
                "id_direccion": "1BoatSLRHtKNngkdXEeobR76b53LETtpyT",
                "scamCategory": "phishing",
                "createdAt": "2025-09-16T10:00:00.000+00:00",
                "trusted": False,
                "domains": ["example.com", "malicioussite.net"]
            }
        }